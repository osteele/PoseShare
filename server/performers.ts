/**
 * This module keeps track of performers and their positions.
 * It also handles the "performers" event, which is sent when the client
 * should update its list of performers.
 */

// FIXME why doesn't the first import work?
import * as Base from "@common/base-types";
import { findUnusedPosition, getNamedRoom } from "./rooms";
import { Performer } from "./types";

/** All performers, across all rooms. */
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
export function findOrCreatePerformer(
  userDetails: Base.UserDetails
): Performer {
  let performer = findPerformerById(userDetails.id);
  if (!performer) {
    // Create a new performer.
    const room = getNamedRoom(userDetails.roomName);
    const { row, col } = findUnusedPosition(
      room,
      performers.filter((p) => p.room === room)
    );
    performer = {
      ...userDetails,
      room,
      col,
      row,
      // These are replaced later
      connected: true,
      hue: 0,
      timestamp: new Date(),
    };
    performers.push(performer);
    updatePerformerFromRoom(performer);
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

/** If there's a entry with this id or name in the rooms.json file, copy its
 * position to the Performer.
 */
function updatePerformerFromRoom(_performer: Performer) {
  // TODO: fix the following code or remove this function
  // const { room } = performer;
  // if (room) {
  //   const roomPerformer =
  //     room.performers.find(({ id }) => id === performer.id) ||
  //     room.performers.find(({ name }) => name === performer.name);
  //   if (roomPerformer) {
  //     performer.col = roomPerformer.col;
  //     performer.row = roomPerformer.row;
  //   }
  // }
}

// Returns a list of performers to be broadcast to clients.
export function getPerformersForBroadcast(): Base.Performer[] {
  reassignPerformerColors();
  // remove the room and timestamp properties
  return performers.map(({ room, timestamp, ...performer }) => performer);
}

// Remove performers that haven't been connected for a while.
function removeExpiredPerformers(): void {
  const now = new Date();
  performers = performers.filter(
    ({ connected, timestamp }) => connected || +now - +timestamp < 5000
  );
}
