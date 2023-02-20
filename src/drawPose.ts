/**
 * This file contains the code for drawing the pose on the canvas.
 */

import p5 from "p5";
import { drawPoseMetaballs } from "./metaballs";
import { getOwnRecord } from "./performers";
import { confidenceThreshold } from "./pose";
import { translatePose } from "./pose-utils";
import { settings } from "./settings";
import { createSkeleton } from "./skeleton";
import { BlazePose, Performer } from "./types";

export function drawPerson(p5: p5, person: Performer, outline: boolean): void {
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
        drawPoseMetaballs(p5, pose, hue);
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

function drawKeypoints(
  p5: p5,
  pose: BlazePose.Pose,
  c: p5.Color,
  outline: boolean
): void {
  p5.fill(c);
  p5.noStroke();
  if (outline) {
    p5.noFill();
    p5.stroke(c);
    p5.strokeWeight(1);
  }
  for (const keypoint of pose.keypoints) {
    if (keypoint.score >= confidenceThreshold) {
      p5.circle(keypoint.x, keypoint.y, 10);
    }
  }
}

function drawSkeleton(p5: p5, pose: BlazePose.Pose, c: p5.Color): void {
  p5.stroke(c);
  p5.strokeWeight(2);
  for (const [p1, p2] of createSkeleton(pose)) {
    if (p5.min(p1.score, p2.score) >= confidenceThreshold) {
      p5.line(p1.x, p1.y, p2.x, p2.y);
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
  p5: p5,
  pose: BlazePose.Pose,
  c: p5.Color,
  curved: boolean,
  outlineOnly: boolean
): void {
  const keypoints = pose.keypoints;

  function drawOutline(partNames: string[]) {
    p5.beginShape();
    for (const name of partNames) {
      const keypoint = findPart(name);
      if (keypoint && keypoint.score >= confidenceThreshold) {
        if (curved && name.match(/elbow|knee/i)) {
          p5.curveVertex(keypoint.x, keypoint.y);
        } else {
          p5.vertex(keypoint.x, keypoint.y);
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

  /** Find a part by name, or the midpoint of two parts. */
  function findPart(partName: string): BlazePose.Keypoint | undefined {
    if (partName.match(/\+/)) {
      const [p1, p2] = partName.split("+").map(findPart);
      if (!p1 || !p2) {
        return undefined;
      }
      return {
        score: (p1.score + p2.score) / 2,
        x: p1.x + p2.x,
        y: p1.x + p2.x,
      };
    }
    return keypoints.find(({ name }) => name === partName);
  }
}
