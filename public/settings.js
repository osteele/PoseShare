let confidenceThreshold = 0.2;

const gui = new dat.GUI({ autoPlace: false });
const settings = {
  name: '',
  mirrorVideo: true,
  showSelf: true,
  appearance: 'bouba',
  smoothing: 0.8,
};
const usernameController = gui.add(settings, 'name').listen();
gui.add(settings, 'mirrorVideo');
gui.add(settings, 'showSelf');
gui.add(settings, 'appearance').options(['skeleton', 'kiki', 'bouba']);
gui.add(settings, 'smoothing', 0, 0.95, 0.05);

document.body.appendChild(gui.domElement)
