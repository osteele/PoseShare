const socket = io('socket-server.underconstruction.fun:3000');

function connectWebsocket() {
  socket.on('pose', pose => {
    updatePersonPose(pose);
  });
  socket.on('performers', performers_ => {
    updatePerformerData(performers_);
  });
}
