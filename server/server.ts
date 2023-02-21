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
import { ClientToServerEvent, Performer } from "./types";

// Create the HTTP server
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

// Vite transforms the TypeScript code into JavaScript code.
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

//
// Static routes
//
app.use(express.static("./public"));
app.use(express.static("./build"));

//
// Socket events
//

// The anonymous function here is the handler for the "connection" event.
// It is called once for each client that connects to the server.
// The local variables in this function are scoped to the connection.
// They are not shared between connections.
// They therefore act, so far as the function arguments to the `socket.on()`
// calls are concerned, as if they were global variables.
io.on("connection", (socket: ClientToServerEvent) => {
  let clientId: string | null = null;
  let username: string | null = null;
  let printedConnected = false;
  let broadcastPerformerData = 0;

  setTimeout(printConnectionMessage, 150);

  // When a page is reloaded, the client doesn't receive the "connect" event.
  // Use this to request that it send the "join" event.
  setTimeout(requestJoinEvent, 100);

  socket.emit("performers", getPerformersForBroadcast());

  // When a client connects, it sends this event.
  socket.on("join", (client: Performer) => {
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

  // When a client disconnects, set its `connected` property to false, and
  // broadcast the list of performers to all the other clients so that they
  // have the information that it is no longer connected.
  socket.on("disconnect", () => {
    console.log("Disconnected:", username || socket.id);
    const performer = clientId && findPerformerById(clientId);
    if (performer) {
      performer.connected = false;
    }
    socket.broadcast.emit("log", `${username} left`);
    socket.broadcast.emit("performers", getPerformersForBroadcast());
  });

  // When a client sends a pose, broadcast it to the other clients.
  socket.on("pose", (person: Performer, pose: unknown) => {
    // If the client hasn't yet sent a join event, request that it do so
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

    // FIXME: this works around a bug that I saw at some point.
    // Re-broadcast the list of performers to a client after every 100 poses
    // that it sends, to ensure that its list is up to date.
    if (++broadcastPerformerData % 100 === 0) {
      socket.emit("performers", getPerformersForBroadcast());
    }
  });

  function printConnectionMessage() {
    if (!printedConnected) {
      console.log("Connected:", username || socket.id);
      printedConnected = true;
    }
  }

  function requestJoinEvent() {
    if (!username) {
      socket.emit("requestJoinEvent");
    }
  }
});

instrument(io, {
  auth: false,
});
