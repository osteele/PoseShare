/**
 * This module manages the list of performers, and the partner selector.
 * It also handles the "performers" event, which is sent when the client
 * should update its list of performers.
 */

import { poseEmitter } from "./blazePose";
import { createEmptyPose, translatePose } from "./pose-utils";
import { xOffset, yOffset } from "./poseOffset";
import { room } from "./room";
import { BlazePose, Performer, Person } from "./types";
import { clientId, username } from "./username";

/** The list of performers. */
let performers: Performer[] = [];

/** If not null, show only the performer with the specified id. */
let partnerId: string | null = null;

poseEmitter.on("pose", (pose: BlazePose.Pose) => {
  pose = translatePose(pose, xOffset, yOffset);
  updatePersonPose(
    {
      id: clientId,
      name: username,
      isSelf: true,
      connected: true,
      // hue: 0,
    },
    pose
  );
  poseEmitter.emit("translatedPose", pose);
});

export function updatePersonPose(
  person: Person,
  pose: BlazePose.Pose | null = null
) {
  // find the index of the person in the list of performers
  performers = room.performers;
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
    });
  }
  const { position } = performers[ix];
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
}

/** Update the performer data with properties from the server. */
export function updatePerformerData(performerData: Performer[]) {
  // console.info('update performer data');
  performerData.forEach((person) => updatePersonPose(person));
}

export function getPerformers({ includeSelf }: { includeSelf?: boolean } = {}) {
  const activePerformers = performers.filter(
    ({ pose, connected }) => pose && connected
  );
  let result = partnerId
    ? // If the user has specified a particular partner, show only that partner.
      [activePerformers.find(({ id }) => id === partnerId)!]
    : // else make a list of people who have been seen recently
      activePerformers.filter(
        ({ isSelf }) => /*timestamp > millis() - 5000 &&*/ !isSelf
      );
  if (includeSelf) {
    const self = getOwnRecord();
    if (self) {
      result.push(self);
    }
  }
  return result;
}

export function getOwnRecord(): Performer {
  return performers.find(({ isSelf, pose }) => isSelf && pose)!;
}
