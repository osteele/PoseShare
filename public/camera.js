let cameraReadyPromise;
let cameraSel;

function initializeWebcam() {
  cameraReadyPromise = new Promise(resolve => {
    video = createCapture(VIDEO, () => resolve(video));
    video.size(settings.width, settings.height);
    video.parent('sketch-container');
    if (settings.drawVideoOnCanvas) {
      video.hide();
    }

    updateMirror();
    guiControllers.mirrorVideo.onFinishChange(updateMirror);
  });
  cameraReadyPromise.then(setupChooseCamera);

  function updateMirror() {
    if (settings.mirrorVideo) {
      video.addClass('mirror');
    } else {
      video.removeClass('mirror');
    }
  }
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
