/**
 * @fileoverview This file contains the code for initializing and using the
 * BlazePose model.
 *
 */

import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import { setOwnPose } from "./performers";
import { translateBlazePoseToPosenet } from "./pose-translation";

export async function initializeBlazePose(
  video: HTMLVideoElement
): Promise<void> {
  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: "tfjs", // 'mediapipe', 'tfjs'
    modelType: "full", // 'lite', 'full', 'heavy'
  };
  const detector = await poseDetection.createDetector(model, detectorConfig);
  loop(); // run asynchronously
  return;

  async function loop() {
    while (true) {
      const [bpPose] = await detector.estimatePoses(video);
      if (!bpPose) continue;
      // FIXME remove the any cast
      let pose = translateBlazePoseToPosenet(bpPose as any);
      // pose = smoothPose(pose);
      setOwnPose(pose);
    }
  }
}
