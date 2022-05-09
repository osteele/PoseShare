import * as fs from "fs";
import { Performer } from "./types";

let performers: Performer[] = [];

const ROOMS_FILE = "./config/rooms.json";
let rooms: Record<string, [{ id: string; name: string; position: number }]> =
  {};

// Read the json for data/rooms.json if this file exists.
function readRoomData() {
  if (fs.existsSync(ROOMS_FILE)) {
    const data = fs.readFileSync(ROOMS_FILE, "utf8");
    rooms = JSON.parse(data);
  } else {
    rooms = {};
  }
}

if (fs.existsSync(ROOMS_FILE)) {
  readRoomData();
  // Watch the ./data/rooms.json file for changes.
  fs.watch(ROOMS_FILE, () => {
    console.info(`${ROOMS_FILE} updated`);
    readRoomData();
  });
}

export function logConnectedUsers() {
  const connected = performers.filter(({ connected }) => connected);
  const disconnected = performers.filter(({ connected }) => !connected);
  let msg = `Active: ${connected.length ? names(connected) : "none"}`;
  if (disconnected.length) {
    msg += `; Disconnected: ${names(disconnected)}`;
  }
  console.log(msg);

  function names(people: Performer[]) {
    return people.map(({ name }) => name).join(", ");
  }
}

// Find a performer by id.
export function findPerformerById(clientId: string) {
  return performers.find(({ id }) => id === clientId);
}

// Find or create a performer with the given data.
export function findOrCreatePerformer(data: Performer) {
  let performer = findPerformerById(data.id);
  if (!performer) {
    performer = { ...data };
    performers.push(performer);
    updatePerformerFromRoomFile(data, performer);
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

// If there's a entry with this id or name in the rooms.json file, copy the
// position over.
function updatePerformerFromRoomFile(data: Performer, performer: Performer) {
  const room = rooms["default"];
  if (room) {
    const roomPerformer =
      room.find(({ id }) => id === data.id) ||
      room.find(({ name }) => name === data.name);
    if (roomPerformer) {
      performer.position = roomPerformer.position;
    }
  }
}

// Returns a list of performers to be broadcast to clients.
export function getPerformersForBroadcast() {
  return performers.map((user) => ({ ...user, timestamp: undefined }));
}

// Remove performers that haven't been connected for a while.
function removeExpiredPerformers() {
  const now = new Date();
  performers = performers.filter(({ timestamp }) => +now - +timestamp < 5000);
}
