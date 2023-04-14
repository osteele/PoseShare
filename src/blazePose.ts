/**
 * This module contains the code for initializing and configuring the BlazePose
 * model.
 *
 * It also contains the code for emitting "pose" events.
 *
 * Usage:
 *   import { poseEmitter } from "./blazePose";
 *   poseEmitter.on("pose", (pose) => {
 *     // do something with the pose
 *  });
 */

import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl"; // Importing this registers the WebGL backend
import EventEmitter from "events";
import { smoothPose } from "./pose-utils";

/**
 * Configuration
 */

const smoothPoses = false;

const blazePoseDetectorConfig = {
  runtime: "tfjs", // 'mediapipe', 'tfjs'
  modelType: "full", // 'lite', 'full', 'heavy'
};

/** Emits the following events:
 *
 * ("pose", pose: Pose)
 *   pose is the (optionally, smoothed) pose, detected by the locally
 *   running BlazePose detector from the local webcam image.
 *   The loop inside of `initializeBlazePose` emits this event.
 *
 * ("translatedPose", pose: Pose)
 *   pose is local pose, translated according to the local pose offset.
 *   This event is emitted by `updatePersonPose` in `performers.ts`.
 */
export const poseEmitter = new EventEmitter();

/** Starts BlazePose.
 *
 * Configures and starts BlazePose. This function also starts an asynchronous
 * loop that continuously relays poses from the model to the poseEmitter,
 * which emits "pose" events.
 *
 * @param video The video element to stream to the model.
 * @returns A Promise that resolves once the model has loaded.
 */
export async function initializeBlazePose(
  video: HTMLVideoElement
): Promise<void> {
  const model = poseDetection.SupportedModels.BlazePose;
  const detector = await poseDetection.createDetector(
    model,
    blazePoseDetectorConfig
  );

  let loopIsRunning = false;
  video.addEventListener("loadeddata", () => {
    if (!loopIsRunning) loop();
  });
  loop(); // run asynchronously
  return;

  async function loop() {
    loopIsRunning = true;
    while (true) {
      let poses;
      try {
        poses = await detector.estimatePoses(video);
      } catch (e) {
        console.error("error while estimating poses", e);
        loopIsRunning = false;
        return;
      }
      let [bpPose] = await detector.estimatePoses(video);
      if (!bpPose) continue;
      // TODO remove the any cast
      //
      // It is currently needed because the typescript definitions for the
      // BlazePose model specifies the type as `PartName` instead of `string`.
      //
      // Possibly this app should import the BlazePose definitions instead of
      // defining its own.
      let pose = bpPose as any;
      if (smoothPoses) {
        pose = smoothPose(pose);
      }
      poseEmitter.emit("pose", pose);
    }
  }
}
