/**
 * This module handles the websocket connection to the server.
 * It also handles the "liveReload" event, which is sent when the client
 * should reload the page.
 */

import * as Base from "@common/base-types";
import { io } from "socket.io-client";
import { poseEmitter } from "./blazePose";
import { appendToLog } from "./htmlLog";
import { updatePerformerData, updatePersonPose } from "./performers";
import { updateRoomFromServer } from "./room";
import { BlazePose, Performer, Person, Room } from "./types";
import { clientId, username } from "./username";
import { getQueryString } from "./utils";
import { settings } from "./settings";

const socket = io();

// log received messages to console.log, if true.
const logSocketEvents = true;

// remembers the initial hash, in order to display the splash if it changes
let liveReloadHash: string | null = null;

export function connectWebsocket() {
  log("Connecting to websocket...");
  let sentJoinEvent = false;

  // The "connect" event is sent when the client connects to the server.
  // Send the "join" event to the server.
  socket.on("connect", () => {
    if (logSocketEvents) console.log("Connected to websocket!");
    sendJoinEvent();
  });

  socket.on("pose", (person: Person, pose: BlazePose.Pose) => {
    updatePersonPose(person, pose);
  });

  socket.on("performers", (performers: Performer[]) => {
    if (logSocketEvents) console.log("performers", performers);
    updatePerformerData(performers);
  });

  socket.on("room", (roomData: Room) => {
    if (logSocketEvents) console.log("room", roomData);
    updateRoomFromServer(roomData);
  });

  socket.on("liveReload", (hash: string) => {
    // If this is the first time this message has been received, set the hash.
    //
    // This is used to compare to the hash in subsequent messages, to see
    // if the sources has changed.
    //
    // There's a possible race condition, but this isn't a critical feature.
    liveReloadHash ||= hash;

    // If the hash has changed, display the splash
    const clientIsOutdated = liveReloadHash !== hash;
    document.getElementById("reload-splash")!.style.display = clientIsOutdated
      ? "block"
      : "";
  });

  socket.on("log", (message) => {
    // Always log the message to the JavaScript console, regardless of the value
    // of logSocketEvents.
    console.log(message);

    // Append message to the HTML log
    appendToLog(message);
  });

  socket.on("requestJoinEvent", () => {
    if (logSocketEvents) console.log("requestJoinEvent");
    // Prevent a race condition
    if (!sentJoinEvent) {
      sendJoinEvent();
    }
  });

  function sendJoinEvent() {
    const roomName = getQueryString("room");
    socket.emit("join", {
      id: clientId,
      name: username,
      roomName,
    } as Base.UserDetails);
    sentJoinEvent = true;
  }
}

poseEmitter.on("translatedPose", (pose: BlazePose.Pose) => {
  socket.emit(
    "pose",
    {
      id: clientId,
      name: username,
      appearance: settings.appearance,
    } as Base.UserDetails,
    pose
  ); // TODO: only emit appearance upon change
});

// TODO: test whether this works in the Edge browser
function log(message: string, ...args: unknown[]) {
  if (logSocketEvents) {
    console.debug(message, ...args);
  }
}
