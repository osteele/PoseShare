import * as fs from "fs";

export type Room = {
  row?: number;
  col?: number;
  performers: {
    id: string;
    name: string;
    position: number;
  }[];
};

const ROOM_CONFIG_PATH = "./config/rooms.json";

export let rooms: Record<string, Room> = readRoomConfig();

// Read the json for data/rooms.json if this file exists.
function readRoomConfig() {
  if (fs.existsSync(ROOM_CONFIG_PATH)) {
    const data = fs.readFileSync(ROOM_CONFIG_PATH, "utf8");
    return JSON.parse(data);
  } else {
    return { default: { performers: [] } };
  }
}

// Watch the ./data/rooms.json file for changes.
if (fs.existsSync(ROOM_CONFIG_PATH)) {
  fs.watch(ROOM_CONFIG_PATH, () => {
    console.info(`Updated: ${ROOM_CONFIG_PATH}`);
    rooms = readRoomConfig();
  });
}

export function getNamedRoom(roomName?: string): Room {
  const room = rooms[roomName || "default"] || rooms["default"];
  room.performers ||= [];
  return room;
}
