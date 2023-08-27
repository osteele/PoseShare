/**
 * This module provides a CameraManager class that handles the webcam.
 *
 * @requires p5 - global object in p5.js sketches
 * @requires EventEmitter - class that enables the communication between different parts of the code
 * @requires settings - module that stores the settings for the sketch
 */

/// <reference path="p5.d.ts" />
import EventEmitter from "events";
import p5 from "p5";
import { guiControllers, settings } from "./settings";

/**
 * Manages the webcam and provides an API for interacting with it.
 * @event cameraName - Emitted when the camera changes. The event payload is the new camera name as a string.
 */
export class CameraManager extends EventEmitter {
  /**
   * The video element used for displaying the camera feed.
   */
  private _videoElement: p5.Video | null = null;

  /**
   * The camera selection menu element.
   */
  private _cameraMenu: p5.Element | null = null;

  /* Creates and initializes a CameraManager instance.
   *
   * Clients must use this to create a CameraManager, in order to ensure that
   * the camera is initialized before the CameraManager is returned.
   *
   * This is necessary because the camera initialization is asynchronous. A
   * constructor cannot be asynchronous, so we can't initialize the camera in
   * the constructor.
   *
   * @param p5 - The p5 instance to use for initializing the camera and creating
   * the camera menu. @param initialCameraName - The name of the initial camera
   * to use. If null, the default camera is used. @returns A Promise that
   * resolves to a new CameraManager instance.
   */
  static async create(
    p5: p5,
    initialCameraName: string | null
  ): Promise<CameraManager> {
    const instance = new CameraManager(initialCameraName);
    await instance.initialize(p5);
    return instance;
  }

  /**
   * Constructs a new CameraManager instance.
   *
   * Declaring this `private` prevents clients from calling `new
   * CameraManager()` without going through `CameraManager.create()`, which
   * calls `initialize()`.
   *
   * Clients should use the static create method to create CameraManager
   * instances.
   *
   * @param _initialCameraName - The name of the initial camera to use. If null,
   * the default camera is used.
   */
  private constructor(private _initialCameraName: string | null) {
    super();
  }

  /**
   * Initializes the camera and camera menu.
   *
   * This method is called by the static create method and should not be called
   * directly.
   *
   * @param p5 - The p5 instance to use for initializing the camera and creating
   * the camera menu.
   * @returns A Promise that resolves when the camera and camera menu are
   * initialized.
   */
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
      if (!settings.drawVideoBehindCanvas) {
        this._videoElement.hide();
      }
    });

    this.updateMirror();
    guiControllers.mirrorVideo.onFinishChange(() => this.updateMirror());
    
    this.updateVideoSource();
    guiControllers.showVideoSource.onFinishChange(() => this.updateVideoSource());
    
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

  updateVideoSource() {
    if (!settings.drawVideoBehindCanvas) {
      this._videoElement?.hide();
    } else {
      this._videoElement?.show();
    }
  }

  /**
   * Creates the camera selection menu and sets up event handlers for it.
   *
   * This method is called by the initialize method and should not be called
   * directly.
   *
   * @param p5 - The p5 instance to use for creating the camera menu.
   * @returns A Promise that resolves when the camera menu is created.
   */
  private async createCameraMenu(p5: p5): Promise<void> {
    const cameras = await this.getCameras();
    const cameraDisplayNames = cameras.map((c) => this.getCameraName(c));

    // Create the camera menu
    p5.createDiv("Camera:").class("label").parent("camera-container");
    const cameraMenu = p5.createSelect().parent("camera-container");
    this._cameraMenu = cameraMenu;

    // Add the camera names to the menu
    cameraDisplayNames.forEach((cameraName) => {
      cameraMenu.option(cameraName);
    });

    const initialCameraName = this.getCurrentCameraName();
    const specifiedCameraName =
      this._initialCameraName &&
      cameraDisplayNames.includes(this._initialCameraName)
        ? this._initialCameraName
        : null;

    if (specifiedCameraName && specifiedCameraName !== initialCameraName) {
      await this.setCamera(specifiedCameraName);
    }

    // Set the menu selection to the currently selected camera.
    cameraMenu.selected(this.getCurrentCameraName());

    // When the camera is changed, update the video element.
    cameraMenu.changed(() => this.onCameraChanged());
  }

  private getCurrentCameraName(): string {
    return this.getCameraName(
      // FIXME remove the cast to `any`. HTMLVideoElement.srcObject is typed as
      // MediaProvider, but it actually implements MediaStream.
      // TODO verify that this.video.elt.srcObject is a MediaStream.
      (this._videoElement!.elt.srcObject as any).getVideoTracks()[0]
    );
  }

  private getCameraName(camera: MediaDeviceInfo): string {
    return camera.label.replace(/\(.*\)$/g, "");
  }

  private async getCameras(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === "videoinput")
      .filter((d) => !d.label.match(/OBS Virtual Camera/));
  }

  /**
   * Handles the camera selection change event.
   *
   * This method is called by the camera selection menu event handler and should
   * not be called directly.
   */
  private async onCameraChanged(): Promise<void> {
    if (!this._cameraMenu) {
      throw new Error("CameraManager not initialized");
    }
    const optionName = this._cameraMenu.value();
    this.setCamera(optionName);
  }

  private async setCamera(cameraName: string): Promise<void> {
    const cameras = await this.getCameras();
    const camera = cameras.find((c) => this.getCameraName(c) === cameraName);
    if (!camera) {
      alert(`Camera ${cameraName} not found`);
      return;
    }
    const { deviceId } = camera;
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId },
    });
    this._videoElement!.elt.srcObject = mediaStream;
    this.emit("cameraName", cameraName);
  }

  public get videoElement(): p5.Video {
    if (this._videoElement === null) {
      throw new Error("CameraManager not initialized");
    }
    return this._videoElement;
  }
}
