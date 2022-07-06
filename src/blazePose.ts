import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import { setOwnPose } from "./performers";
import { translateBlazePoseToPosenet } from "./pose-translation";

export function initializeBlazePose(video) {
  let model = poseDetection.SupportedModels.BlazePose;
  let detector;
  let detectorConfig = {
    runtime: "tfjs", // 'mediapipe', 'tfjs'
    modelType: "full", // 'lite', 'full', 'heavy'
  };
  poseDetection.createDetector(model, detectorConfig).then((d) => {
    detector = d;
    getPose();
  });

  function getPose() {
    detector.estimatePoses(video.elt).then(([pose]) => {
      if (pose) {
        pose = translateBlazePoseToPosenet(pose);
        // pose = smoothPose(pose);
        setOwnPose(pose);
      }
      getPose();
    });
  }
}
