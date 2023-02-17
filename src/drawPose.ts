/**
 * This file contains the code for drawing the pose on the canvas.
  */

import { drawPoseMetaballs } from "./metaballs";
import { getOwnRecord } from "./performers";
import { confidenceThreshold } from "./pose";
import { translatePose } from "./pose-utils";
import { translatePosenetToBlazePose } from "./pose-translation";
import { settings } from "./settings";
import { Performer, Posenet } from "./types";

export function drawPerson(p5, person: Performer, outline: boolean) {
  const { pose, hue } = person;
  const keypointColor = p5.color(hue, 100, 100);
  const skeletonColor = p5.color(hue, 50, 50);
  const outlineColor = p5.color(hue, 50, 50, 0.5);

  drawKeypoints(p5, pose, keypointColor, outline);
  switch (settings.appearance) {
    case "metaballs":
      {
        const self = getOwnRecord();
        let xpose = pose;
        if (self && self.row >= 0 && person.row >= 0) {
          xpose = translatePose(
            pose,
            -p5.width * (person.col - self.col),
            -p5.height * (person.row - self.row)
          );
        }
        const pose3D = translatePosenetToBlazePose(pose);
        drawPoseMetaballs(p5, pose3D, hue);
      }
      break;
    case "skeleton":
      drawSkeleton(p5, pose, skeletonColor);
      break;
    case "kiki":
    case "bouba":
      drawPoseOutline(
        p5,
        pose,
        outlineColor,
        settings.appearance === "bouba",
        outline
      );
      break;
  }
}

function drawKeypoints(p5, pose: Posenet.Pose, c, outline: boolean) {
  p5.fill(c);
  p5.noStroke();
  if (outline) {
    p5.noFill(c);
    p5.stroke(c);
    p5.strokeWeight(1);
  }
  for (const keypoint of pose.pose.keypoints) {
    if (keypoint.score >= confidenceThreshold) {
      p5.circle(keypoint.position.x, keypoint.position.y, 10);
    }
  }
}

function drawSkeleton(p5, pose: Posenet.Pose, c) {
  p5.stroke(c);
  p5.strokeWeight(2);
  for (const [p1, p2] of pose.skeleton) {
    if (p5.min(p1.score, p2.score) >= confidenceThreshold) {
      p5.line(p1.position.x, p1.position.y, p2.position.x, p2.position.y);
    }
  }
}

const partNames = [
  "rightShoulder",
  "rightElbow",
  "rightWrist",
  "rightShoulder",
  "rightHip",
  "rightKnee",
  "rightAnkle",
  "rightHip+leftHip",
  "leftKnee",
  "leftAnkle",
  "leftHip",
  "leftShoulder",
  "leftElbow",
  "leftWrist",
  "leftShoulder",
];

function drawPoseOutline(
  p5,
  pose: Posenet.Pose,
  c,
  curved,
  outlineOnly: boolean
) {
  const keypoints = pose.pose.keypoints;

  function findPart(partName) {
    if (partName.match(/\+/)) {
      const [p1, p2] = partName.split("+").map(findPart);
      return {
        score: (p1.score + p2.score) / 2,
        position: {
          x: p1.position.x + p2.position.x,
          y: p1.position.x + p2.position.x,
        },
      };
    }
    return keypoints.find(({ part }) => part === partName);
  }

  function drawOutline(partNames: string[]) {
    p5.beginShape();
    for (const name of partNames) {
      const keypoint = findPart(name);
      if (keypoint && keypoint.score >= confidenceThreshold) {
        if (curved && name.match(/elbow|knee/i)) {
          p5.curveVertex(keypoint.position.x, keypoint.position.y);
        } else {
          p5.vertex(keypoint.position.x, keypoint.position.y);
        }
      }
    }
    p5.fill(c);
    p5.stroke(c);
    p5.strokeWeight(10);
    if (outlineOnly) {
      p5.noFill();
      p5.strokeWeight(2);
    }
    p5.endShape(p5.CLOSE);
  }

  drawOutline(partNames);
  drawOutline(["leftEye", "rightEye", "nose"]);
}
