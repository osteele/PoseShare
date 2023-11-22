/**
 * This module manages the list of performers, and the partner selector.
 * It also handles the "performers" event, which is sent when the client
 * should update its list of performers.
 */

import { poseEmitter } from "./blazePose";
import { emptyPose, polishPose, translatePose } from "./pose-utils";
import { xOffset, yOffset } from "./poseOffset";
import { room } from "./room";
import { BlazePose, Performer, Person } from "./types";
import { clientId, username } from "./username";

import EventEmitter from "events";
import { settings } from "./settings";

/** Emits "performers" event when the list of performers is updated. */
export const performersEmitter = new EventEmitter();

/** The list of performers. */
let performers: Performer[] = [];

/** If not null, show only the performer with the specified id. */
let partnerId: string | null = null;

// When the pose is updated, update the performer data
poseEmitter.on("pose", (pose: BlazePose.Pose) => {
  pose = translatePose(pose, xOffset, yOffset);
  updatePersonPose(
    {
      id: clientId,
      name: username,
      isSelf: true,
      connected: true,
      appearance: settings.appearance, // TODO: double-check if this updatePersonPose is local
    },
    pose
  );
  poseEmitter.emit("translatedPose", pose);
});

/**
 * Creates a performer object based on a person.
 *
 * @param person - The person object used as the base for the performer.
 * @returns A performer object.
 */
function createPerformer(person: Person): Performer {
  return {
    ...person,
    isLocal: true,
    // col and row are set by the server
    row: null,
    col: null,
    pose: emptyPose,
    // Supply these initial values to satisfy the typechecker. They will be
    // overwritten by the statement that follows this conditional.
    hue: 0,
    timestamp: 0,
    previousPoses: [emptyPose],
    polishedPose: emptyPose,
    // appearance: DEFAULT_APPEARANCE,
  };
}

/**
 * Finds or creates a Performer based on a person object.
 * @param person - The person object used to find or create the Performer.
 * @returns The found or created Performer.
 */
function findOrCreatePerformer(person: Person): Performer {
  let performer = performers.find(({ id }) => id === person.id);
  if (!performer) {
    performer = createPerformer(person);
    performers.push(performer);
  }
  // FIXME why is this necessary?
  performer.previousPoses ??= [];
  return performer;
}

/**
 * Updates the pose of a person in the performers list.
 * @param person - The person object to update.
 * @param pose - The new pose of the person. (optional)
 */
export function updatePersonPose(
  person: Person,
  pose: BlazePose.Pose | null = null
): void {
  // find the index of the person in the list of performers
  performers = room.performers;
  let performer = findOrCreatePerformer(person);

  // before overwriting the record, update previousPoses
  if (performer.pose) {
    performer.previousPoses.push(performer.pose);
  }
  while (performer.previousPoses.length > settings.posesMaxLength) {
    performer.previousPoses.splice(0, 1);
  }

  // update the performer with new values from `person`
  performer = {
    ...performer,
    ...person,
    pose: pose || performer.pose,
    timestamp: +new Date(),
  };
  if (person.hue && person.hue >= 0) {
    performer.hue = person.hue;
  }
  // calculate the polished pose
  // TODO: should I just pass the performer and polish pose in-place?
  performer.polishedPose = polishPose(performer.previousPoses, performer.pose);

  // replace the previous performer record with the new one
  const ix = performers.findIndex(({ id }) => id === person.id);
  if (ix < 0) {
    throw `performer ${person.id} not found`;
  }
  performers[ix] = performer;

  performersEmitter.emit("performers", performers);
}

/** Update the performer data with properties from the server. */
export function updatePerformerData(performerData: Performer[]) {
  performerData.forEach((person) => updatePersonPose(person));
}

/**
 * Retrieves a list of performers based on the specified parameters.
 *
 * @param includeSelf - Optional. Specifies whether to include the current user in the list of performers. Defaults to false.
 * @returns An array of performer objects that match the criteria.
 */
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

/**
 * Retrieves the Performer object for the current user.
 *
 * @returns {Performer} The Performer object representing the current user.
 */
export function getOwnRecord(): Performer {
  return performers.find(({ isSelf, pose }) => isSelf && pose)!;
}
