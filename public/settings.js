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

document.body.appendChild(gui.domElement)

async function setupChooseCamera() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter(d => d.kind === 'videoinput')
    .filter(d => !d.label.match(/OBS Virtual Camera/));

  const sel = createSelect();
  sel.position(660, 500);

  for (const camera of cameras) {
    const optionName = getCameraName(camera);
    sel.option(optionName);
  }

  sel.changed(async () => {
    const optionName = sel.value();
    const camera = cameras.find(c => getCameraName(c) === optionName);
    const { deviceId } = camera;
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId } })
    video.elt.srcObject = mediaStream;
  });

  sel.mouseMoved(() => {
    if (video.elt.srcObject && video.elt.srcObject) {
      console.info(video.elt.srcObject.getVideoTracks()[0].label)
      sel.selected(getCameraName(video.elt.srcObject.getVideoTracks()[0]));
    }
  });

  function getCameraName(camera) {
    return camera.label.replace(/\(.*\)$/g, '');
  }
}
