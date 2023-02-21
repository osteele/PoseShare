/**
 * This module keeps track of performers and their positions.
 * It also handles the "performers" event, which is sent when the client
 * should update its list of performers.
 */

import { getNamedRoom } from "./rooms";
import { Performer, Room } from "./types";

let performers: Performer[] = [];

export function logConnectedUsers(): void {
  const connected = performers.filter(({ connected }) => connected);
  const disconnected = performers.filter(({ connected }) => !connected);
  const msg = [
    `Active performers: ${connected.length ? names(connected) : "none"}`,
    disconnected.length > 0 ? `Disconnected: ${names(disconnected)}` : "",
  ]
    .filter(Boolean)
    .join("; ");
  console.log(msg);

  function names(people: Performer[]) {
    return people.map(({ name }) => name).join(", ");
  }
}

// Find a performer by id.
export function findPerformerById(clientId: string): Performer | undefined {
  return performers.find(({ id }) => id === clientId);
}

// Find or create a performer with the given data.
export function findOrCreatePerformer(data: Performer): Performer {
  let performer = findPerformerById(data.id);
  if (!performer) {
    performer = { ...data };
    performers.push(performer);
    updatePerformerFromRoom(data, performer);
    // re-assign the hues
    reassignPerformerColors();
  }
  performer.connected = true;
  performer.timestamp = new Date();
  removeExpiredPerformers();
  return performer;
}

function reassignPerformerColors() {
  performers.forEach(
    (performer, i) => (performer.hue = (360 * i) / performers.length)
  );
}

export function getPerformerRoom(performer: Performer): Room {
  return getNamedRoom(performer.roomName);
}

// If there's a entry with this id or name in the rooms.json file, copy the
// position over.
function updatePerformerFromRoom(data: Performer, performer: Performer) {
  const room = getPerformerRoom(data);
  if (room) {
    const roomPerformer =
      room.performers.find(({ id }) => id === data.id) ||
      room.performers.find(({ name }) => name === data.name);
    if (roomPerformer) {
      performer.position = roomPerformer.position;
    }
  }
}

// Returns a list of performers to be broadcast to clients.
export function getPerformersForBroadcast() {
  if (performers.length === 0) return [];
  reassignPerformerColors();
  assignPerformerPositions(performers);
  console.info(performers);
  // remove the room and timestamp properties
  return performers.map(({ room, timestamp, ...performer }) => performer);
}

/** Make sure every performer has a position. Collect all the current
 * positions, and for every performer with a null position, assign it the next
 * available position.
 */
function assignPerformerPositions(performers: Performer[]) {
  // collect the positions that are in use
  const occupiedPositions = performers.map(({ position }) => position);
  // create an array of all the positions, and then remove the ones that are
  // already in use.
  const room = getPerformerRoom(performers[0]);
  const availablePositions = Array.from(
    { length: room.rows * room.cols },
    (_, i) => i
  ).filter((p) => !occupiedPositions.includes(p));
  performers
    .filter(({ position }) => position === undefined)
    .forEach((performer) => {
      if (availablePositions.length === 0) {
        availablePositions.push(Math.max(...occupiedPositions) + 1);
      }
      performer.position = availablePositions.shift()!;
    });
}

// Remove performers that haven't been connected for a while.
function removeExpiredPerformers(): void {
  const now = new Date();
  performers = performers.filter(
    ({ connected, timestamp }) => connected || +now - +timestamp < 5000
  );
}
