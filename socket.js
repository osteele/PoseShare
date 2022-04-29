const socket = io('socket-server.underconstruction.fun:3000');

function connectWebsocket() {
  socket.on('pose', ({
    id,
    name,
    pose
  }) => {
    updatePersonPose({
      id,
      name,
      pose
    });
  });
}
