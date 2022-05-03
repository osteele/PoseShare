let cameraSel;

function initializeWebcam() {
  video = createCapture(VIDEO, () => {
    initializePosenet();
    if (cameraSel) {
      cameraSel.selected(getCameraName(video.elt.srcObject.getVideoTracks()[0]));
    } else {
      setupChooseCamera();
    }
  });
  video.size(640, 480);
  video.hide();
}

async function setupChooseCamera() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter(d => d.kind === 'videoinput')
    .filter(d => !d.label.match(/OBS Virtual Camera/));

  createDiv('Camera:').class('label').parent('camera-container');
  cameraSel = createSelect().parent('camera-container');
  for (const camera of cameras) {
    const optionName = getCameraName(camera);
    cameraSel.option(optionName);
  }
  cameraSel.selected(getCameraName(video.elt.srcObject.getVideoTracks()[0]));

  cameraSel.changed(async () => {
    const optionName = cameraSel.value();
    const camera = cameras.find(c => getCameraName(c) === optionName);
    const { deviceId } = camera;
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId } })
    video.elt.srcObject = mediaStream;
  });

  function getCameraName(camera) {
    return camera.label.replace(/\(.*\)$/g, '');
  }
}
