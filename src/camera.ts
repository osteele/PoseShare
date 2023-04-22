/**
 * This module handles the webcam.
 */

/// <reference path="p5.d.ts" />
import p5 from "p5";
import { guiControllers, settings } from "./settings";

export class CameraManager {
  private _videoElement: p5.Video | null = null;
  private _cameraMenu: p5.Element | null = null;

  // Clients must use this to create a CameraManager, in order to ensure that
  // the camera is initialized before the CameraManager is returned.
  //
  // This is necessary because the camera initialization is asynchronous.
  // A constructor cannot be asynchronous, so we can't initialize the camera
  // in the constructor.
  static async create(
    p5: p5,
    initialCameraName: string | null
  ): Promise<CameraManager> {
    const instance = new CameraManager(initialCameraName);
    await instance.initialize(p5);
    return instance;
  }

  // Declaring this `private` prevents clients from calling `new
  // CameraManager()` without going through `CameraManager.create()`, which
  // calls `initialize()`.
  private constructor(private _initialCameraName: string | null) {}

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
    await this.createCameraMenu(p5);
  }

  updateMirror() {
    if (settings.mirrorVideo) {
      this._videoElement?.addClass("mirror");
    } else {
      this._videoElement?.removeClass("mirror");
    }
  }

  private async createCameraMenu(p5: p5): Promise<void> {
    const cameras = await this.getCameras();

    // Create the camera menu
    p5.createDiv("Camera:").class("label").parent("camera-container");
    this._cameraMenu = p5.createSelect().parent("camera-container");

    // Add the cameras to the menu
    for (const camera of cameras) {
      const optionName = this.getCameraName(camera);
      this._cameraMenu.option(optionName);
    }

    // Set the menu to the selected camera.
    // FIXME remove the cast to any. HTMLVideoElement.srcObject is typed as
    // MediaProvider, but it actually implements MediaStream.
    // TODO verify that this.video.elt.srcObject is a MediaStream.
    const cameraName =
      this._initialCameraName &&
      cameras.find((c) => this.getCameraName(c) === this._initialCameraName)
        ? this._initialCameraName
        : this.getCameraName(
            (this._videoElement!.elt.srcObject as any).getVideoTracks()[0]
          );
    this._cameraMenu.selected(cameraName);

    // When the camera is changed, update the video element.
    this._cameraMenu.changed(() => this.onCameraChanged());
  }

  private getCameraName(camera: MediaDeviceInfo) {
    return camera.label.replace(/\(.*\)$/g, "");
  }

  private async getCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === "videoinput")
      .filter((d) => !d.label.match(/OBS Virtual Camera/));
  }

  private async onCameraChanged() {
    const cameras = await this.getCameras();
    if (!this._cameraMenu) {
      throw new Error("CameraManager not initialized");
    }
    const optionName = this._cameraMenu.value();
    const camera = cameras.find((c) => this.getCameraName(c) === optionName);
    if (!camera) {
      alert(`Camera ${optionName} not found`);
      return;
    }
    const { deviceId } = camera;
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId },
    });
    this._videoElement!.elt.srcObject = mediaStream;
  }

  public get videoElement(): p5.Video {
    if (this._videoElement === null) {
      throw new Error("CameraManager not initialized");
    }
    return this._videoElement;
  }
}
