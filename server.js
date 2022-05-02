const express = require('express');
const app = express();
const path = require('path');
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { instrument } = require("@socket.io/admin-ui");
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:3000"],
//     credentials: true
//   }
// });

let users = [];

io.on('connection', (socket) => {
  let printedConnected = false;
  let clientId = null;
  let username = null;

  setTimeout(printConnectionMessage, 100);
  socket.emit('performers', getPerformerList());

  socket.on('userdata', (data) => {
    let performer = findUserById(data.id);
    if (performer) {
      performer.connected = true;
    } else {
      users.push({ ...data, connected: true });
    }
    if (!username) {
      console.log('connected', socket.id, '->', data.name);
    }
    clientId = data.clientId;
    username = data.name;
    printedConnectedList();
  });

  socket.on('disconnect', () => {
    console.log('disconnected', username || socket.id);
    const performer = clientId && findUserById(clientId);
    if (performer) {
      performer.connected = false;
    }
  });

  socket.on('pose', (person) => {
    username = person.name;
    printConnectionMessage();

    const now = new Date;
    let user = findUserById(person.id);
    if (!user) {
      // reap old performers
      users = users.filter(({ timestamp }) => now - timestamp < 5000);
      user = { ...person, connected: true, pose: undefined };
      users.push(user);
      // re-assign the hues
      users.forEach((performer, i) => performer.hue = 360 * i / users.length);
      // send the new hues to the clients
      io.emit('performers', getPerformerList());
    }
    user.timestamp = now;
    socket.broadcast.volatile.emit('pose', person);
  });

  function getPerformerList() {
    return users.map(({ id, name, hue }) => ({ id, name, hue }));
  }

  function printConnectionMessage() {
    if (!printedConnected) {
      console.log('connected', username || socket.id);
      printedConnected = true;
    }
  }
});

function printedConnectedList() {
  const connected = users.filter(({ connected }) => connected);
  const disconnected = users.filter(({ connected }) => !connected);
  msg = `Active: ${connected.length ? names(connected) : 'none'}`;
  if (disconnected.length) {
    msg += `; Disconnected: ${names(disconnected)}`;
  }
  console.log(msg);

  function names(people) {
    return people.map(({ name }) => name).join(', ');
  }
}

function findUserById(clientId) {
  return users.find(({ id }) => id === clientId);
}


instrument(io, {
  auth: false
});
