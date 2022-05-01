const socket = io(':3030');

function connectWebsocket() {
  socket.on('pose', pose => {
    updatePersonPose(pose);
  });
  socket.on('performers', performers_ => {
    updatePerformerData(performers_);
  });
}
