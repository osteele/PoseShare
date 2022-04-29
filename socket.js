const socket = io('socket-server.underconstruction.fun:3000');

function connectWebsocket() {
  poseNet.on("pose", ([pose]) => {
    if (pose) {
      pose = smoothPose(pose);
      socket.emit('pose', {
        id: myPersonId,
        name: username,
        pose
      });
    }
  });
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
