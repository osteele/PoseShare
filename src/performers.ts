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
    const performer = this.findOrCreatePerformer(person);
    this.updatePerformerFromPerson(performer, person);
    if (pose) {
      this.addPose(performer, pose);
    }
    this.emit("performers", this.performers);
  }

  private updatePerformerFromPerson(performer: Performer, person: Person) {
    const performerIndex = this.findPerformerIndex(this.performers, person);
    const { position } = performer;
    if (person.hue && person.hue >= 0) {
      performer.hue = person.hue;
      // console.info('hue', person.name, person.hue);
    } else {
      // console.info('no hue', person.name)
    }
    this.performers[performerIndex] = {
      ...performer,
      ...person,
      timestamp: +new Date(),
      col: position % room.cols,
      row: Math.floor(position / room.cols),
    };
  }

  private findOrCreatePerformer(person: Person) {
    const performers = this.performers;
    let performerIndex = this.findPerformerIndex(performers, person);
    if (performerIndex < 0) {
      // if not found, create a new performer and add it to the list
      return this.createPerformer(person);
    } else {
      return this.performers[performerIndex];
    }
  }

  private addPose(performer: Performer, pose: BlazePose.Pose) {
    performer.previousPoses.push(performer.pose);
    while (performer.previousPoses.length > settings.posesMaxLength) {
      performer.previousPoses.splice(0, 1);
    }
    performer.pose = pose;
    // TODO: should I just pass the performer and polish pose in-place?
    performer.polishedPose = polishPose(
      performer.previousPoses,
      performer.pose
    );
  }

  createPerformer(person: Person) {
    const performer = {
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
    };
    this.performers.push(performer);
    return performer;
  }

  private findPerformerIndex(performers: Performer[], person: Person) {
    return performers.findIndex(({ id }) => id === person.id);
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
