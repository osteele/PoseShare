/**
 * This module contains the code for drawing the pose on the canvas.
 */

import p5 from "p5";
import { drawPoseMetaballs } from "./metaballs";
import { getOwnRecord } from "./performers";
import {
  findPart,
  PartNameOrPair,
  partNames,
  translatePose,
} from "./pose-utils";
import { confidenceThreshold, settings } from "./settings";
import { createSkeleton } from "./skeleton";
import { BlazePose, Performer } from "./types";

/** Draw the pose onto the canvas, using the appearance settings.
 *
 * @param p5 The p5 instance
 * @param person The person to draw
 * @param outline Whether to draw just the outline, or (default) fill the
 * interior
 */
export function drawPose(p5: p5, person: Performer, outline: boolean): void {
  let { pose, hue, previousPoses, polishedPose } = person;
  const keypointColor = p5.color(hue, 100, 100);
  const skeletonColor = p5.color(hue, 50, 50);
  const outlineColor = p5.color(hue, 50, 50, 0.5);

  drawKeypoints(p5, pose, keypointColor, outline);

  drawKeypoints(p5, polishedPose, keypointColor, false);

  // test draw previous poses
  let testH = hue;
  let testS = 100;
  let testB = 100;
  let testKeypointColor = p5.color(testH, testS, testB);
  for (let pose of previousPoses) {
    // testH += 360 / settings.posesMaxLength;
    testB -= 100 / settings.posesMaxLength;
    testKeypointColor = p5.color(testH, testS, testB);
    drawKeypoints(p5, pose, testKeypointColor, outline);
  }

  switch (settings.appearance) {
    case "metaballs":
      {
        const self = getOwnRecord();
        if (self && self.row >= 0 && person.row >= 0) {
          pose = translatePose(
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

/** The pose renderer for the bouba (curved=true) and kiki (curved=false)
 * appearances. */
function drawPoseOutline(
  p5: p5,
  pose: BlazePose.Pose,
  c: p5.Color,
  curved: boolean,
  outlineOnly: boolean
): void {
  function drawOutline(partNames: PartNameOrPair[]) {
    p5.beginShape();
    for (const name of partNames) {
      const keypoint = findPart(pose, name);
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
  drawOutline(["left_eye", "right_eye", "nose"]);
}
