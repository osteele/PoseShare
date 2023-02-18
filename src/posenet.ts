/**
 * This file is responsible for initializing the PoseNet model and
 * handling the pose data.
 */

import p5 from "p5";
import * as ml5 from "ml5";
import { video } from "./camera";
import { xOffset, yOffset } from "./pose";
import { smoothPose, translatePose } from "./pose-utils";
import { setOwnPose } from "./performers";

let poseNet: ml5.PoseNet;

export function initializePosenet(p5: p5): void {
  poseNet = ml5.poseNet(
    video,
    {
      flipHorizontal: true,
      detectionType: "single",
    },
    () => p5.select("#loading").hide()
  );

  poseNet.on("pose", ([pose]) => {
    if (pose) {
      pose = translatePose(pose, xOffset, yOffset);
      pose = smoothPose(pose);
      setOwnPose(pose);
    }
  });
}
