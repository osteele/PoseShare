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
import { P5 } from "./types";

export function initializeBlazePose(video: P5.Video): void {
  let model = poseDetection.SupportedModels.BlazePose;
  let detector: poseDetection.PoseDetector;
  let detectorConfig = {
    runtime: "tfjs", // 'mediapipe', 'tfjs'
    modelType: "full", // 'lite', 'full', 'heavy'
  };
  poseDetection.createDetector(model, detectorConfig).then((_detector) => {
    detector = _detector;
    getPose();
  });

  function getPose() {
    detector.estimatePoses(video.elt).then(([bpPose]) => {
      if (bpPose) {
        // FIXME remove the any cast
        const pnPose = translateBlazePoseToPosenet(bpPose as any);
        // pose = smoothPose(pose);
        setOwnPose(pnPose);
      }
      getPose();
    });
  }
}
