/**
 * This module contains utility functions for working with poses.
 */

import { settings } from "./settings";
import { BlazePose } from "./types";
import { lerp } from "./utils";

function createEmptyPose(): BlazePose.Pose {
  const keypoints = new Array<BlazePose.Keypoint>();
  const keypoints3D = new Array<BlazePose.Keypoint>();
  return { keypoints, keypoints3D, score: 0 };
}

export const emptyPose = createEmptyPose();

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

export function polishPose(
  previousPoses: BlazePose.Pose[],
  currentPose: BlazePose.Pose,
): BlazePose.Pose {
  // calculate the polished pose
  // current implementation: (unweighed) average of poses;
  let polishedPose = JSON.parse(JSON.stringify(currentPose));
  // traverse the target keypoints
  for (const targetKeypoint of polishedPose.keypoints) {
    let xtemp = targetKeypoint.x, ytemp = targetKeypoint.y, countertemp = 1;
    // find the target name
    const targetName = targetKeypoint.name;
    // traverse previous poses
    for (let i=0; i<previousPoses.length; i++) {
      const previousPose = previousPoses[i];
      // if name matches the target name, include this data item
      for (const kp of previousPose.keypoints) {
        if (kp.name == targetName) {
          countertemp++;
          xtemp += kp.x;
          ytemp += kp.y;
        }
      }
    }
    targetKeypoint.x = xtemp / countertemp;
    targetKeypoint.y = ytemp / countertemp;

    // const keypoint = findPart(currentPose, targetName);
    // if (keypoint && keypoint.score >= confidenceThreshold) {
    // }
  }

  // TODO: return the polished pose
  return polishedPose;
}

export type PartNameOrPair =
  | BlazePose.PartName
  | `${BlazePose.PartName}+${BlazePose.PartName}`;

export const partNames: PartNameOrPair[] = [
  "right_shoulder",
  "right_elbow",
  "right_wrist",
  "right_shoulder",
  "right_hip",
  "right_knee",
  "right_ankle",
  "right_hip+left_hip",
  "left_knee",
  "left_ankle",
  "left_hip",
  "left_shoulder",
  "left_elbow",
  "left_wrist",
  "left_shoulder",
];

/** Find a part by name, or the midpoint of two parts. */
export function findPart(
  pose: BlazePose.Pose,
  partName: PartNameOrPair
): BlazePose.Keypoint | undefined {
  if (partName.match(/\+/)) {
    const [p1, p2] = (partName.split("+") as BlazePose.PartName[]).map((name) =>
      findPart(pose, name)
    );
    if (!p1 || !p2) {
      return undefined;
    }
    return {
      score: (p1.score + p2.score) / 2,
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  } else {
    return pose.keypoints.find(({ name }) => name === partName);
  }
}
