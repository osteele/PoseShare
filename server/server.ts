/**
 * This is the main entry point for the server.
 * It sets up the websocket connection and the HTTP server.
 * It also handles the "join" event, which is sent when the client
 * connects to the server.
 * It also handles the "pose" event, which is sent when the client
 * should update the pose of a person.
 * It also handles the "room" event, which is sent when the client
 * should update the room data.
 */

import { instrument } from "@socket.io/admin-ui";
import express from "express";
import { createServer as createViteServer } from "vite";
import {
  findOrCreatePerformer,
  findPerformerById,
  getPerformersForBroadcast,
  logConnectedUsers,
} from "./performers";
import { getNamedRoom } from "./rooms";
import { ClientToServerEvent } from "./types";

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

async function attachViteMiddleware() {
  const vite = await createViteServer({
    server: { middlewareMode: "html" },
  });
  app.use(vite.middlewares);
}

server.listen(port, async () => {
  await attachViteMiddleware();
  console.log("Server listening at http://localhost:%d", port);
});

// Routing
app.use(express.static("./public"));
app.use(express.static("./build"));

// const watchPaths = ["./build", "./public"];
// function computeWatchHash() {
//   return watchPaths.map(computeDirectoryHash).join("");
// }
// let clientHash = computeWatchHash();
// watchPaths.forEach((dirPath) =>
//   fs.watch(dirPath, () => {
//     clientHash = computeWatchHash();
//     io.emit("reload");
//   })
// );

io.on("connection", (socket: ClientToServerEvent) => {
  let clientId: string | null = null;
  let clientVersion: string | null = null;
  let printedConnected = false;
  let username: string | null = null;

  setTimeout(printConnectionMessage, 150);

  // When a page is reloaded, the client doesn't receive the "connect" event.
  // Use this to request that it send the "join" event.
  setTimeout(requestJoinEvent, 100);

  socket.emit("performers", getPerformersForBroadcast());

  // When a client connects, find or create a performer with the given data.
  socket.on("join", (client) => {
    // If we haven't yet logged the client connection, or if we have already
    // logged the client *without* a username, log it again *with* a username.
    if (!username) {
      console.log("Connected:", socket.id, "->", client.name);
      printedConnected = true;
    }

    // This has the side effect of setting the connected flag on the performer.
    findOrCreatePerformer(client);
    clientId = client.id;
    username = client.name;
    logConnectedUsers();

    // Broadcast the updated list of performers
    io.emit("performers", getPerformersForBroadcast());

    // Send the client room data and its id
    socket.emit("room", getNamedRoom(client.roomName));

    // Welcome the client; tell everyone else the client has joined
    socket.emit("log", `Welcome ${username}`);
    socket.broadcast.emit("log", `${username} joined`);
  });

  // When a client disconnects, set the connected property to false.
  socket.on("disconnect", () => {
    console.log("Disconnected:", username || socket.id);
    const performer = clientId && findPerformerById(clientId);
    if (performer) {
      performer.connected = false;
    }
    socket.broadcast.emit("log", `${username} left`);
    socket.broadcast.emit("performers", getPerformersForBroadcast());
  });

  // When a client sends a pose, broadcast it to all clients.
  socket.on("pose", (person, pose) => {
    if (!username) {
      requestJoinEvent();
    }
    username = person.name;
    printConnectionMessage();

    let performer = findPerformerById(person.id);
    if (!performer) {
      performer = findOrCreatePerformer(person);
      io.emit("performers", getPerformersForBroadcast());
    }
    performer.timestamp = new Date();
    socket.broadcast.volatile.emit("pose", performer, pose);

    // Use this as an excuse to tell the client whether to reload.
    // if (clientVersion !== clientHash) {
    // }

    // FIXME: kludge
    if (++broadcastPerformerData % 100 === 0) {
      // console.info("Broadcasting performer data...");
      socket.emit("performers", getPerformersForBroadcast());
    }
  });
  let broadcastPerformerData = 0;

  function printConnectionMessage() {
    if (!printedConnected) {
      console.log("Connected:", username || socket.id);
      printedConnected = true;
    }
  }

  function requestJoinEvent() {
    // console.debug("requestJoinEvent", username);
    if (!username) {
      socket.emit("requestJoinEvent");
    }
  }
});

instrument(io, {
  auth: false,
});
