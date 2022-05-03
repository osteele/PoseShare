let confidenceThreshold = 0.2;

const gui = new dat.GUI({ autoPlace: false });
const settings = {
  name: '',
  mirrorVideo: true,
  showSelf: true,
  appearance: 'bouba',
  smoothing: 0.8,
};

const usernameController = gui.add(settings, 'name').name('User Name').listen();
gui.add(settings, 'mirrorVideo').name('Mirror Video');
gui.add(settings, 'showSelf').name('Show Self');
gui.add(settings, 'appearance').options(['skeleton', 'kiki', 'bouba']);
gui.add(settings, 'smoothing', 0, 0.95, 0.05);

document.querySelector('#dat-container').appendChild(gui.domElement)

let xOffset = 0;
let yOffset = 0;
