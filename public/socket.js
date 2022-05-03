const socket = io();

function connectWebsocket() {
  socket.on('connect', () => {
    socket.emit('join', { id: clientId, name: username });
  });

  socket.on('pose', (pose) => {
    updatePersonPose(pose);
  });

  socket.on('performers', (performers_) => {
    updatePerformerData(performers_);
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
