/**
 * This module handles the webcam.
 */

/// <reference path="p5.d.ts" />
import p5 from "p5";
import { guiControllers, settings } from "./settings";

export let video: p5.Video;

let cameraSel: p5.Element;

export async function initializeWebcam(p5: p5): Promise<void> {
  const streamLoaded = new Promise((resolve) => {
    video = p5.createCapture(p5.VIDEO, () => resolve(video));
  });
  video.size(settings.width, settings.height);
  video.parent("sketch-container");
  if (settings.drawVideoOnCanvas) {
    video.hide();
  }

  updateMirror();
  guiControllers.mirrorVideo.onFinishChange(updateMirror);
  await streamLoaded;
  await setupChooseCamera(p5);

  function updateMirror() {
    if (settings.mirrorVideo) {
      video.addClass("mirror");
    } else {
      video.removeClass("mirror");
    }
  }
}

async function setupChooseCamera(p5: p5): Promise<void> {
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
  // FIXME remove the cast to any. HTMLVideoElement.srcObject is typed as
  // MediaProvider, but it actually implements MediaStream.
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
