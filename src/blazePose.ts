/**
 * This file contains the code for initializing and configuring the BlazePose
 * model.
 *
 */

import * as poseDetection from "@tensorflow-models/pose-detection";
// Register WebGL backend:
import "@tensorflow/tfjs-backend-webgl";
import { setOwnPose } from "./performers";
import { smoothPose } from "./pose-utils";

const smoothPoses = false;

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
  const detectorConfig = {
    runtime: "tfjs", // 'mediapipe', 'tfjs'
    modelType: "full", // 'lite', 'full', 'heavy'
  };
  const detector = await poseDetection.createDetector(model, detectorConfig);

  let loopIsRunning = false;
  video.addEventListener("loadeddata", () => {
    console.info("stream loaded", loopIsRunning);
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
      setOwnPose(pose);
    }
  }
}
