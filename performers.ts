import * as fs from "fs";
import { Performer } from "./types";

let performers: Performer[] = [];

const ROOMS_FILE = "./data/rooms.json";

// Read the json for data/rooms.json if this file exists.
function readRoomData(): Record<
  string,
  [{ id: string; name: string; position: number }]
> {
  if (fs.existsSync(ROOMS_FILE)) {
    const data = fs.readFileSync(ROOMS_FILE, "utf8");
    return JSON.parse(data);
  } else {
    return {};
  }
}

let rooms = readRoomData();

// Watch the ./data/rooms.json file for changes.
fs.watch(ROOMS_FILE, () => {
  rooms = readRoomData();
  console.info(`${ROOMS_FILE} updated`);
});

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

export function findPerformerById(clientId: string) {
  return performers.find(({ id }) => id === clientId);
}

export function findOrCreatePerformer(data: Performer) {
  let performer = findPerformerById(data.id);
  if (!performer) {
    performer = { ...data };
    performers.push(performer);
    // if there's a entry with this id or name in the rooms.json file, copy the position over
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

export function getPerformersForBroadcast() {
  return performers.map((user) => ({ ...user, timestamp: undefined }));
}

function removeExpiredPerformers() {
  const now = new Date();
  performers = performers.filter(({ timestamp }) => +now - +timestamp < 5000);
}
