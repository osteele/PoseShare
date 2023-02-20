/**
 * This file contains utility functions for working with poses.
 */

import { settings } from "./settings";
import { BlazePose } from "./types";
import { lerp } from "./utils";

export function createEmptyPose(): BlazePose.Pose {
  const keypoints = new Array<BlazePose.Keypoint>();
  const keypoints3D = new Array<BlazePose.Keypoint>();
  return { keypoints, keypoints3D, score: 0 };
}

/** The previous pose, used for smoothing. */
let previousPose: BlazePose.Pose;

/** Smooth the pose by interpolating between the previous pose and the current
 * pose.
 *
 * This function can only be used on one stream of poses at a time.
 * The previous pose is stored as a global variable.
 */
export function smoothPose(pose: BlazePose.Pose): BlazePose.Pose {
  const { smoothing } = settings;
  if (previousPose) {
    const keypoints = pose.keypoints.map((keypoint, i) => {
      let prev = previousPose.keypoints[i];
      return smoothKeypoint(keypoint, prev);
    });
    const keypoints3D = pose.keypoints.map((keypoint, i) => {
      let prev = previousPose.keypoints[i];
      return smoothKeypoint(keypoint, prev);
    });
    pose = { ...pose, keypoints, keypoints3D };
  }
  previousPose = pose;
  return pose;

  // Smooth a single keypoint
  function smoothKeypoint(
    keypoint: BlazePose.Keypoint,
    prev: BlazePose.Keypoint
  ): BlazePose.Keypoint {
    return {
      ...keypoint,
      score: lerp(prev.score, keypoint.score, 1 - smoothing),
      x: lerp(prev.x, keypoint.x, 1 - smoothing),
      y: lerp(prev.y, keypoint.y, 1 - smoothing),
      z:
        prev.z !== undefined && keypoint.z !== undefined
          ? lerp(prev.z, keypoint.z, 1 - smoothing)
          : undefined,
    };
  }
}

/** Add xOffset and yOffset to all the keypoints in the pose */
export function translatePose(
  pose: BlazePose.Pose,
  xOffset: number,
  yOffset: number
): BlazePose.Pose {
  return {
    ...pose,
    keypoints: pose.keypoints.map(translateKeypoint),
    keypoints3D: pose.keypoints3D.map(translateKeypoint),
  };

  // Translate a single keypoint
  function translateKeypoint(keypoint: BlazePose.Keypoint): BlazePose.Keypoint {
    return {
      ...keypoint,
      x: keypoint.x + xOffset,
      y: keypoint.y + yOffset,
    };
  }
}
