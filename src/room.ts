/**
 * This module contains the room state, which is the state of the room that is
 * shared between all clients.
 */

import * as Messages from "@common/messages";
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
  rows: 3,
  cols: 3,
  performers: [],
};

/** Update the room data with properties from the server. */
export function updateRoomFromServer(roomData: Messages.Room): void {
  // update the room global variable with new data from the server, which is in the parameter
  room = { ...room, ...roomData };
}
