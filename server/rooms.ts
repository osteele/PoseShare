/**
 * This module provides a simple way to configure the rooms in the app.
 * It reads the config/rooms.json file and provides a function to get a room
 * by name.
 * If the file doesn't exist, it returns a default room.
 * If the file exists but doesn't contain a room with the given name, it
 * returns the default room.
 * If the file exists and contains a room with the given name, it returns
 * that room.
 * If the file exists and contains a room with the given name, but that room
 * doesn't have a row or column, it returns the default room.
 */
import * as fs from "fs";

const ROOM_CONFIG_PATH = "./config/rooms.json";
const DEFAULT_ROOM_NAME = "default";

/** A room in the app. */
export type Room = {
  name: string;
  row?: number;
  col?: number;
  performers: {
    id: string;
    name: string;
    position: number;
  }[];
};

/** The default room. */
const DEFAULT_ROOM = {
  name: DEFAULT_ROOM_NAME,
  rows: 1,
  cols: 1,
  performers: [],
};

/** A map of room names to rooms. */
let rooms: Record<string, Room> = readRoomConfig();

/** Read the JSON data from ./config/rooms.json if this file exists. */
function readRoomConfig() {
  let rooms = { default: DEFAULT_ROOM };
  if (fs.existsSync(ROOM_CONFIG_PATH)) {
    const data = fs.readFileSync(ROOM_CONFIG_PATH, "utf8");
    rooms = JSON.parse(data);
  }
  Object.entries(rooms).forEach(([name, room]) => {
    room.name = name;
    room.performers ||= [];
  });
  return rooms;
}

/** Watch the ./config/rooms.json file for changes. */
if (fs.existsSync(ROOM_CONFIG_PATH)) {
  fs.watch(ROOM_CONFIG_PATH, () => {
    console.log(`Reloading ${ROOM_CONFIG_PATH}`);
    rooms = readRoomConfig();
  });
}

/** Get a room by name. */
export function getNamedRoom(roomName?: string): Room {
  const room = rooms[roomName || DEFAULT_ROOM_NAME];
  if (!room) {
    console.error(`Uknown room: ${roomName}`);
    return rooms[DEFAULT_ROOM_NAME];
  }
  return room;
}
