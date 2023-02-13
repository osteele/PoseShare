import * as fs from "fs";

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

const ROOM_CONFIG_PATH = "./config/rooms.json";

const DEFAULT_ROOM = {
  name: "default",
  rows: 1,
  cols: 1,
  performers: [],
};

let rooms: Record<string, Room> = readRoomConfig();

// Read the JSON data from ./config/rooms.json if this file exists.
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

// Watch the ./config/rooms.json file for changes.
if (fs.existsSync(ROOM_CONFIG_PATH)) {
  fs.watch(ROOM_CONFIG_PATH, () => {
    console.log(`Reloading ${ROOM_CONFIG_PATH}`);
    rooms = readRoomConfig();
  });
}

export function getNamedRoom(roomName?: string): Room {
  const room = rooms[roomName || "default"];
  if (!room) {
    console.error(`Uknown room: ${roomName}`);
    return rooms["default"];
  }
  return room;
}
