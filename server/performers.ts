import { getNamedRoom, Room } from "./rooms";
import { Performer } from "./types";

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
    performers.forEach(
      (performer, i) => (performer.hue = (360 * i) / performers.length)
    );
  }
  performer.connected = true;
  performer.timestamp = new Date();
  removeExpiredPerformers();
  return performer;
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
    // console.info("update", data.id, data.name, roomPerformer, room);
    if (roomPerformer) {
      performer.position = roomPerformer.position;
      // console.info("set position", performer.position);
    }
  }
}

// Returns a list of performers to be broadcast to clients.
export function getPerformersForBroadcast() {
  return performers.map(({ room, timestamp, ...performer }) => performer);
}

// Remove performers that haven't been connected for a while.
function removeExpiredPerformers(): void {
  const now = new Date();
  performers = performers.filter(
    ({ connected, timestamp }) => connected || +now - +timestamp < 5000
  );
}
