/**
 * This module manages the list of performers, and the partner selector.
 * It also handles the "performers" event, which is sent when the client
 * should update its list of performers.
 */

import { poseEmitter } from "./blazePose";
import { createEmptyPose, polishPose, translatePose } from "./pose-utils";
import { xOffset, yOffset } from "./poseOffset";
import { room } from "./room";
import { BlazePose, Performer, Person, Room } from "./types";
import { clientId, username } from "./username";

import EventEmitter from "events";
import { settings } from "./settings";

/** @event PerformerManagerperformers Emitted when the list of performers is
 * updated. */
class PerformersManager extends EventEmitter {
  /** The list of performers. */
  performers: Performer[] = [];

  constructor(public room: Room) {
    super();

    // When the pose is updated, update the performer data
    poseEmitter.on("pose", (pose: BlazePose.Pose) => {
      pose = translatePose(pose, xOffset, yOffset);
      this.updatePersonPose(
        {
          id: clientId,
          name: username,
          isSelf: true,
          connected: true,
        },
        pose
      );
      poseEmitter.emit("translatedPose", pose);
    });
  }

  public updatePersonPose(person: Person, pose: BlazePose.Pose | null = null) {
    // find the index of the person in the list of performers
    const performers = this.performers;
    let ix = performers.findIndex(({ id }) => id === person.id);
    if (ix < 0) {
      // if not found, create a new performer and add it to the list
      ix = performers.length;
      performers.push({
        ...person,
        isLocal: true,
        position: 0,
        col: 0,
        row: 0,
        pose: createEmptyPose(),
        // Supply these initial values to satisfy the typechecker. They will be
        // overwritten by the statement that follows this conditional.
        hue: 0,
        timestamp: 0,
        previousPoses: [createEmptyPose()],
        polishedPose: createEmptyPose(),
      });
    }
    const { position } = performers[ix];
    // before overwriting the record, update previousPoses
    performers[ix].previousPoses.push(performers[ix].pose);
    while (performers[ix].previousPoses.length > settings.posesMaxLength) {
      performers[ix].previousPoses.splice(0, 1);
    }
    // update the record
    performers[ix] = {
      ...performers[ix],
      ...person,
      pose: pose || performers[ix].pose,
      timestamp: +new Date(),
      col: position % room.cols,
      row: Math.floor(position / room.cols),
    };
    if (person.hue && person.hue >= 0) {
      performers[ix].hue = person.hue;
      // console.info('hue', person.name, person.hue);
    } else {
      // console.info('no hue', person.name)
    }
    // after updating the record, calculate the polished pose
    // TODO: should I just pass the performer and polish pose in-place?
    performers[ix].polishedPose = polishPose(
      performers[ix].previousPoses,
      performers[ix].pose
    );
    this.emit("performers", performers);
  }

  /** Update the performer data with properties from the server. */
  public updatePerformerData(performerData: Performer[]) {
    performerData.forEach((person) => this.updatePersonPose(person));
  }

  /** Active performers, optionally excluding self.
   *
   * @param includeSelf If true, include self in the list of performers.
   */
  public getPerformers({ includeSelf }: { includeSelf?: boolean } = {}) {
    const activePerformers = this.performers.filter(
      ({ pose, connected }) => pose && connected
    );
    // make a list of people who have been seen recently
    let result = activePerformers.filter(
      ({ isSelf }) => /*timestamp > millis() - 5000 &&*/ !isSelf
    );
    if (includeSelf) {
      const self = this.getOwnRecord();
      if (self) {
        result.push(self);
      }
    }
    return result;
  }

  /** Get the performer record for the current user. */
  public getOwnRecord(): Performer {
    return this.performers.find(({ isSelf, pose }) => isSelf && pose)!;
  }
}

export const performerManager = new PerformersManager(room);
