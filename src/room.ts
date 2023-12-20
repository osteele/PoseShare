/**
 * This module contains the room state, which is the state of the room that is
 * shared between all clients.
 */

import * as Base from "@common/base-types";
import { Room } from "./types";

// Initialize the room to a 1x1 grid that will hold a single performer.
//
// The client uses this to initialize the room before the server sends the
// "room" event.
//
// This is occasionally useful during development, so that it is possible to
// run the client without the server.
export let room: Room = {
  name: "local",
  rows: 1,
  cols: 1,
  performers: [],
};

/**
 * Finds an unused cell in a room.
 * @param room - The room object.
 * @returns An object containing the row and column of the unused cell.
 */
// FIXME: this function is duplicated in server/rooms.ts.
// An effort to move this function to common/common-utils.ts failed with an
// an error of unknown origin:
//   Error: Cannot find module '@common/base-types'
export function findUnusedPosition(room: Room) {
  const { rows, cols } = room; // get the dimensions of the room
  const occupiedCells = new Array(rows * cols).fill(false);
  room.performers.forEach(({ row, col }) => {
    if (row !== null && col !== null) {
      occupiedCells[row * cols + col] = true;
    }
  });
  let ix = occupiedCells.findIndex((x) => x === false);
  if (ix < 0) {
    ix = occupiedCells.length;
  }
  return { row: Math.floor(ix / cols), col: ix % cols };
}

/** Update the room data with properties from the server. */
export function updateRoomFromServer(roomData: Base.Room): void {
  // update the room global variable with new data from the server, which is in the parameter
  room = { ...room, ...roomData };
}
