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
// Register WebGL backend:
import "@tensorflow/tfjs-backend-webgl";
import EventEmitter from "events";
import { smoothPose } from "./pose-utils";

/*
 * Configuration
 */

const smoothPoses = false;

const blazePoseDetectorConfig = {
  runtime: "tfjs", // 'mediapipe', 'tfjs'
  modelType: "full", // 'lite', 'full', 'heavy'
};

/** Emits "pose" events with the (optionally, smoothed) pose. */
export const poseEmitter = new EventEmitter();

/** Configured BlazePose. Returns a Promise that resolves once the model has
 * loaded.
 *
 * This function also initiates an asynchronous loop that applies the
 * model to the video and updates the ownPose variable.
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
      // It is needed because the typescript definitions for the BlazePose
      // model specify PartName instead of string
      let pose = bpPose as any;
      if (smoothPoses) {
        pose = smoothPose(pose);
      }
      poseEmitter.emit("pose", pose);
    }
  }
}
