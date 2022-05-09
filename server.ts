import { instrument } from "@socket.io/admin-ui";
import express from "express";
import path from "path";
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

interface Performer {
  id: string;
  name: string;
  connected: boolean;
  hue: number;
  timestamp: Date;
}

interface ClientToServerEvent {
  broadcast: {
    emit: (name: string, data: {}) => void;
    volatile: {
      emit(name: string, person: Performer, pose: unknown): void;
    };
  };
  emit(name: string, event: ServerToClientEvent): void;
  on(name: string, handler: (person: Performer, pose: unknown) => void): void;
  id: string;
}

interface ServerToClientEvent {}

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});

// Routing
app.use(express.static(path.join(__dirname, "public")));

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:3000"],
//     credentials: true
//   }
// });

let users: Performer[] = [];

io.on("connection", (socket: ClientToServerEvent) => {
  let printedConnected = false;
  let clientId: string | null = null;
  let username: string | null = null;

  setTimeout(printConnectionMessage, 100);
  socket.emit("performers", getPerformerList());

  socket.on("join", (data) => {
    let performer = findUserById(data.id);
    if (performer) {
      performer.connected = true;
    } else {
      users.push({ ...data, connected: true });
      // re-assign the hues
      users.forEach(
        (performer, i) => (performer.hue = (360 * i) / users.length)
      );
      // send the new hues to the clients
    }
    if (!username) {
      console.log("connected", socket.id, "->", data.name);
    }
    clientId = data.id;
    username = data.name;
    printedConnectedList();
    socket.emit("log", `Welcome ${username}`);
    socket.broadcast.emit("log", `${username} joined`);
    io.emit("performers", getPerformerList());
  });

  socket.on("disconnect", () => {
    console.log("disconnected", username || socket.id);
    const performer = clientId && findUserById(clientId);
    if (performer) {
      performer.connected = false;
    }
    socket.broadcast.emit("log", `${username} left`);
    socket.broadcast.emit("performers", getPerformerList());
  });

  socket.on("pose", (person, pose) => {
    username = person.name;
    printConnectionMessage();

    const now = new Date();
    let user = findUserById(person.id);
    if (!user) {
      // reap old performers
      users = users.filter(({ timestamp }) => +now - +timestamp < 5000);
      user = { ...person, connected: true };
      users.push(user);
      // re-assign the hues
      users.forEach(
        (performer, i) => (performer.hue = (360 * i) / users.length)
      );
      // send the new hues to the clients
      io.emit("performers", getPerformerList());
    }
    user.timestamp = now;
    socket.broadcast.volatile.emit("pose", person, pose);
  });

  function getPerformerList() {
    return users.map((user) => ({ ...user, timestamp: undefined }));
  }

  function printConnectionMessage() {
    if (!printedConnected) {
      console.log("connected", username || socket.id);
      printedConnected = true;
    }
  }
});

function printedConnectedList() {
  const connected = users.filter(({ connected }) => connected);
  const disconnected = users.filter(({ connected }) => !connected);
  let msg = `Active: ${connected.length ? names(connected) : "none"}`;
  if (disconnected.length) {
    msg += `; Disconnected: ${names(disconnected)}`;
  }
  console.log(msg);

  function names(people: Performer[]) {
    return people.map(({ name }) => name).join(", ");
  }
}

function findUserById(clientId: string) {
  return users.find(({ id }) => id === clientId);
}

instrument(io, {
  auth: false,
});
