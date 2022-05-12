const socket = io();
let liveReloadHash;

function connectWebsocket() {
  socket.on('connect', () => {
    const roomName = getQueryString('room');
    socket.emit('join', { id: clientId, name: username, roomName });
  });

  socket.on('pose', (person, pose) => {
    updatePersonPose(person, pose);
  });

  socket.on('performers', (performers) => {
    updatePerformerData(performers);
  });

  socket.on('room', (room_) => {
    room.settings = room_;
    room.performers = room_.performers;
    updateRoom();
  });

  socket.on("liveReload", (hash) => {
    liveReloadHash = liveReloadHash || hash;
    document.getElementById('reload-splash').style.display =
      (liveReloadHash === hash) ? null : 'block';
  });

  socket.on('log', (log) => {
    console.log(log);
    const elt = document.querySelector('#log');
    const line = document.createElement('code');
    const ts = (new Date()).toISOString().replace(/.+T(.{5}).+/, '$1');
    line.innerText = `${ts} — ${log}\n`;
    elt.appendChild(line);
    while (document.querySelectorAll('#log code').length > 20) {
      document.querySelector('#log code').remove();
    }
  });
}

}
