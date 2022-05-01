let confidenceThreshold = 0.2;

const gui = new dat.GUI();
const settings = {
  name: '',
  mirrorVideo: true,
  smoothing: 0.8,
};
const usernameController = gui.add(settings, 'name').listen();
gui.add(settings, 'mirrorVideo');
gui.add(settings, 'smoothing', 0, 0.95, 0.05);
