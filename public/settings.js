const gui = new dat.GUI({ autoPlace: false });
const settings = {
  name: '',
  mirrorVideo: true,
  showSelf: true,
  appearance: 'bouba',
  smoothing: 0.8,
  trail: 5,
  width: 880,
  height: 500,
  toroidalMovement: true,
  useWebGL: false,
};

const guiControllers = {
  username: gui.add(settings, 'name').name('User Name').listen(),
  mirrorVideo: gui.add(settings, 'mirrorVideo').name('Mirror Video'),
}
gui.add(settings, 'showSelf').name('Show Self');
gui.add(settings, 'appearance').options(['skeleton', 'kiki', 'bouba']);
gui.add(settings, 'smoothing', 0, 0.95, 0.05);
gui.add(settings, 'trail', 0, 10);

document.querySelector('#dat-container').appendChild(gui.domElement)
