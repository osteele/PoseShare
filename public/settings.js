const gui = new dat.GUI({ autoPlace: false });
const settings = {
  name: '',
  mirrorVideo: true,
  showSelf: true,
  appearance: getQueryParameter('appearance') || 'bouba',
  smoothing: 0.8,
  trail: 5,

  // These don't have GUI settings at the moment
  width: 880,
  height: 500,
  toroidalMovement: true,
  useWebGL: getQueryParameter('webgl') === 'true',

  // Enable the following to draw the image on the canQvas. Currently it is
  // rendered via a <video> element placed behind theQ canvas.
  drawVideoOnCanvas: false,
};

const guiControllers = {
  username: gui.add(settings, 'name').name('User Name').listen(),
  mirrorVideo: gui.add(settings, 'mirrorVideo').name('Mirror Video'),
  showSelf: gui.add(settings, 'showSelf').name('Show Self'),
  appearance: gui.add(settings, 'appearance').options(['skeleton', 'kiki', 'bouba', 'metaballs']),
}
gui.add(settings, 'smoothing', 0, 0.95, 0.05);
gui.add(settings, 'trail', 0, 10);

document.querySelector('#dat-container').appendChild(gui.domElement)

guiControllers.appearance.onChange(appearance => {
  const useWebGL = appearanceRequiresWebGL(appearance);
  if (useWebGL != settings.useWebGL) {
    // Add or remove the webgl query parameter from the document URL and reload the page
    const url = new URL(window.location.href);
    url.searchParams.set('appearance', appearance);
    url.searchParams.set('webgl', useWebGL ? 'true' : null);
    window.location.href = url.href;
  }
});

function getQueryParameter(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function appearanceRequiresWebGL(appearance) {
  return appearance === 'metaballs';
}
