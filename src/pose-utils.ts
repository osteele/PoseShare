/**
 * This file contains utility functions for working with poses.
 */

import { settings } from "./settings";
import { Posenet } from "./types";
import { lerp } from "./utils";

/** The previous pose, used for smoothing. */
let previousPose: Posenet.Pose;

/** Smooth the pose by interpolating between the previous pose and the current
 * pose.
 *
 * This function can only be used on one stream of poses at a time.
 * The previous pose is stored as a global variable.
 */
export function smoothPose(pose: Posenet.Pose): Posenet.Pose {
  const { smoothing } = settings;
  let smoothed = pose;

  if (previousPose) {
    const keypoints = pose.pose.keypoints.map((keypoint, i) => {
      let prev = previousPose.pose.keypoints[i];
      return smoothKeypoint(keypoint, prev);
    });
    smoothed = {
      ...pose,
      pose: { ...pose.pose, keypoints },
    };
  }
  previousPose = pose;
  return smoothed;

  // Smooth a single keypoint
  function smoothKeypoint(
    keypoint: Posenet.Keypoint,
    prev: Posenet.Keypoint
  ): Posenet.Keypoint {
    return {
      ...keypoint,
      score: lerp(prev.score, keypoint.score, 1 - smoothing),
      position: {
        x: lerp(prev.position.x, keypoint.position.x, 1 - smoothing),
        y: lerp(prev.position.y, keypoint.position.y, 1 - smoothing),
      },
    };
  }
}

/** Add xOffset and yOffset to all the keypoints in the pose */
export function translatePose(
  pose: Posenet.Pose,
  xOffset: number,
  yOffset: number
): Posenet.Pose {
  return {
    ...pose,
    pose: {
      ...pose.pose,
      keypoints: pose.pose.keypoints.map(translateKeypoint),
    },
    skeleton: pose.skeleton.map((pts) => pts.map(translateKeypoint)) as [
      Posenet.Keypoint,
      Posenet.Keypoint
    ][],
  };

  // Translate a single keypoint
  function translateKeypoint(keypoint: Posenet.Keypoint): Posenet.Keypoint {
    return {
      ...keypoint,
      position: {
        x: keypoint.position.x + xOffset,
        y: keypoint.position.y + yOffset,
      },
    };
  }
}
