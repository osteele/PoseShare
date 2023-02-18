/**
 * This module handles the webcam.
 */

import { guiControllers, settings } from "./settings";
import { P5 } from "./types";

export let video: P5.Video; // p5.js Video instance

export let cameraReadyPromise: Promise<P5.Video>;
let cameraSel: P5.Element;

export function initializeWebcam(p5: P5) {
  cameraReadyPromise = new Promise((resolve) => {
    video = p5.createCapture(p5.VIDEO, () => resolve(video));
    video.size(settings.width, settings.height);
    video.parent("sketch-container");
    if (settings.drawVideoOnCanvas) {
      video.hide();
    }

    updateMirror();
    guiControllers.mirrorVideo.onFinishChange(updateMirror);
  });
  cameraReadyPromise.then(() => setupChooseCamera(p5));

  function updateMirror() {
    if (settings.mirrorVideo) {
      video.addClass("mirror");
    } else {
      video.removeClass("mirror");
    }
  }
}

async function setupChooseCamera(p5: P5) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices
    .filter((d) => d.kind === "videoinput")
    .filter((d) => !d.label.match(/OBS Virtual Camera/));

  p5.createDiv("Camera:").class("label").parent("camera-container");
  cameraSel = p5.createSelect().parent("camera-container");
  for (const camera of cameras) {
    const optionName = getCameraName(camera);
    cameraSel.option(optionName);
  }
  // FIXME remove the cast to any
  cameraSel.selected(
    getCameraName((video.elt.srcObject as any).getVideoTracks()[0])
  );

  cameraSel.changed(async () => {
    const optionName = cameraSel.value();
    const camera = cameras.find((c) => getCameraName(c) === optionName)!;
    const { deviceId } = camera;
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId },
    });
    video.elt.srcObject = mediaStream;
  });

  function getCameraName(camera: MediaDeviceInfo) {
    return camera.label.replace(/\(.*\)$/g, "");
  }
}
