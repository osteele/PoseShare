/**
 * This module handles the webcam.
 */

/// <reference path="p5.d.ts" />
import p5 from "p5";
import { guiControllers, settings } from "./settings";

export class CameraManager {
  private _videoElement: p5.Video | null = null;
  private _cameraSel: p5.Element | null = null;

  static async create(p5: p5): Promise<CameraManager> {
    const instance = new CameraManager();
    await instance.initialize(p5);
    return instance;
  }

  private async initialize(p5: p5): Promise<void> {
    const streamLoaded = new Promise((resolve) => {
      this._videoElement = p5.createCapture(p5.VIDEO, () =>
        resolve(this._videoElement)
      );
      this._videoElement.size(settings.width, settings.height);
      this._videoElement.parent("sketch-container");
      if (settings.drawVideoOnCanvas) {
        this._videoElement.hide();
      }
    });

    this.updateMirror();
    guiControllers.mirrorVideo.onFinishChange(() => this.updateMirror());
    await streamLoaded;
    await this.setupChooseCamera(p5);
  }

  updateMirror() {
    if (settings.mirrorVideo) {
      this._videoElement?.addClass("mirror");
    } else {
      this._videoElement?.removeClass("mirror");
    }
  }

  private async setupChooseCamera(p5: p5): Promise<void> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices
      .filter((d) => d.kind === "videoinput")
      .filter((d) => !d.label.match(/OBS Virtual Camera/));

    p5.createDiv("Camera:").class("label").parent("camera-container");
    this._cameraSel = p5.createSelect().parent("camera-container");
    for (const camera of cameras) {
      const optionName = getCameraName(camera);
      this._cameraSel.option(optionName);
    }
    // FIXME remove the cast to any. HTMLVideoElement.srcObject is typed as
    // MediaProvider, but it actually implements MediaStream.
    // TODO verify that this.video.elt.srcObject is a MediaStream.
    this._cameraSel.selected(
      getCameraName(
        (this._videoElement!.elt.srcObject as any).getVideoTracks()[0]
      )
    );

    this._cameraSel.changed(async () => {
      // TODO verify that this.cameraSel is not null.
      const optionName = this._cameraSel!.value();
      const camera = cameras.find((c) => getCameraName(c) === optionName)!;
      const { deviceId } = camera;
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
      });
      this._videoElement!.elt.srcObject = mediaStream;
    });

    function getCameraName(camera: MediaDeviceInfo) {
      return camera.label.replace(/\(.*\)$/g, "");
    }
  }

  public get videoElement(): p5.Video {
    if (this._videoElement === null) {
      throw new Error("CameraManager not initialized");
    }
    return this._videoElement;
  }
}
