const http = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true
  }
});

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

httpServer.listen(3030);
