import * as fs from "fs";
import { createHash } from "crypto";
import { instrument } from "@socket.io/admin-ui";
import express from "express";
import {
  findOrCreatePerformer,
  findPerformerById,
  getPerformerRoom,
  getPerformersForBroadcast,
  logConnectedUsers,
} from "./performers";
import { ClientToServerEvent } from "./types";
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log("Server listening at http://localhost:%d", port);
});

// Routing
app.use(express.static("./public"));
let clientHash = computeDirectoryHash("./public");
fs.watch("./public", () => {
  clientHash = computeDirectoryHash("./public");
  io.emit("reload");
});

io.on("connection", (socket: ClientToServerEvent) => {
  let printedConnected = false;
  let clientId: string | null = null;
  let clientVersion: string | null = null;
  let username: string | null = null;

  setTimeout(printConnectionMessage, 100);
  socket.emit("performers", getPerformersForBroadcast());

  // When a client connects, find or create a performer with the given data.
  socket.on("join", (client) => {
    const performer = findOrCreatePerformer(client);
    if (!username) {
      console.log("connected", socket.id, "->", client.name);
    }
    clientId = client.id;
    username = client.name;
    logConnectedUsers();
    socket.emit("log", `Welcome ${username}`);
    socket.broadcast.emit("log", `${username} joined`);
    // Send the client the list of performers and room data.
    io.emit("performers", getPerformersForBroadcast());
    io.emit("room", getPerformerRoom(performer));
    io.emit("liveReload", (clientVersion = clientHash));
  });

  // When a client disconnects, set the connected property to false.
  socket.on("disconnect", () => {
    console.log("disconnected", username || socket.id);
    const performer = clientId && findPerformerById(clientId);
    if (performer) {
      performer.connected = false;
    }
    socket.broadcast.emit("log", `${username} left`);
    socket.broadcast.emit("performers", getPerformersForBroadcast());
  });

  // When a client sends a pose, broadcast it to all clients.
  socket.on("pose", (person, pose) => {
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
    if (clientVersion !== clientHash) {
      io.emit("liveReload", (clientVersion = clientHash));
    }
  });

  function printConnectionMessage() {
    if (!printedConnected) {
      console.log("connected", username || socket.id);
      printedConnected = true;
    }
  }
});

function computeDirectoryHash(dir: string) {
  const h = createHash("sha256");
  visit(dir);
  return h.digest("hex");

  function visit(dir: string) {
    if (fs.statSync(dir).isDirectory()) {
      fs.readdirSync(dir)
        .filter((file) => !file.startsWith("."))
        .forEach((file) => {
          visit(`${dir}/${file}`);
        });
    } else {
      // update the hash with the contents of the file
      h.update(fs.readFileSync(dir));
    }
  }
}

instrument(io, {
  auth: false,
});
