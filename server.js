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

let performers = [];

io.on('connection', (socket) => {
  console.log('connected', socket.id);
  socket.emit('performers', getPerformerList());

  function getPerformerList() {
    return performers.map(({ id, name, hue }) => ({ id, name, hue }));
  }


  socket.on('disconnect', () => {
    console.log('disconnected', socket.id);
  });
  socket.on('pose', (pose) => {
    let performer = performers.find(({ id }) => id === pose.id);
    const now = new Date;
    if (!performer) {
      performer = { ...pose, pose: undefined, timestamp: now };
      performers.push(performer);
      performers = performers.filter(({ timestamp }) => now - timestamp < 5000);
      performers.forEach((performer, i) => performer.hue = 360 * i / performers.length);
      io.emit('performers', getPerformerList());
    }
    performer.timestamp = now;
    socket.broadcast.volatile.emit('pose', pose);
  });
});


instrument(io, {
  auth: false
});
