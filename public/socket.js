const socket = io();

function connectWebsocket() {
  socket.on('connect', () => {
    socket.emit('userdata', { id: clientId, name: username });
  });
  socket.on('pose', pose => {
    updatePersonPose(pose);
  });
  socket.on('performers', performers_ => {
    updatePerformerData(performers_);
  });
}
