import { Room } from "./types";
import { clientId } from "./username";

// {size, rows, cols, isLocal, Record<clientId: string, positon: Number>}
export let room: Room = {
  isLocal: true,
  rows: 0,
  cols: 0,
  performers: [],
  settings: {}, // The server room data
};

// Update the room dimensions based on the number of performers.
export function updateRoom() {
  const sharedPerformers = room.performers.filter(({ isLocal }) => !isLocal);
  const n = Math.max(sharedPerformers.length, 1);
  room.rows = room.settings?.rows ?? Math.ceil(Math.sqrt(n));
  room.cols = room.settings?.cols ?? Math.ceil(n / room.rows);

  room.performers.forEach((person) => {
    if (person.id === clientId) {
      person.isSelf = true;
    }
  });

  // Assign each extra performer that is not in the list of room performers to
  // the next unused position:

  // Clear out the positions of performers that are not assigned to a position
  // by the server.
  room.performers
    .filter(({ isLocal }) => isLocal)
    .forEach((person) => (person.position = null as unknown as number));

  // Assign each performer without a position, to the next unused position. This
  // is order O(n^2), but n is usually 0, occasionally 1, and rarely a slightly
  // greater number.
  room.performers
    .filter(({ position }) => position === null || position === undefined)
    .forEach((person) => {
      // Collect the positions of non-local performers.
      const positions = room.performers
        .map(({ position }) => position)
        .filter((position) => position !== null);
      person.position = positions.length ? 1 + Math.max(...positions) : 0;
    });

  // Add row and col properties.
  room.performers.forEach((person) => {
    person.row = Math.floor(person.position / room.cols);
    person.col = person.position % room.cols;
  });

  // enlarge the room to accomodate any extra rows
  room.rows = Math.max(
    room.rows,
    1 + Math.max(...room.performers.map(({ row }) => row))
  );
}

export function updateRoomFromServer(roomData) {
  room.settings = roomData;
  room.performers = roomData.performers;
  updateRoom();
}
