/** Create the skeleton from the pose. */

import { BlazePose } from "./types";

type Skeleton = [BlazePose.Keypoint, BlazePose.Keypoint][];

export function createSkeleton(pose: BlazePose.Pose): Skeleton {
  const keypoints = pose.keypoints.filter(
    (kp): kp is BlazePose.Keypoint & { name?: BlazePose.PartName } =>
      Boolean(kp.name)
  );
  const keypointsByIndex = Object.fromEntries(
    keypoints.map((keypoint) => [keypoint.name, keypoint])
  );
  return skeletonJointPairNames.flatMap(([name1, name2]) => {
    const kp1 = keypointsByIndex[name1];
    const kp2 = keypointsByIndex[name2];
    return kp1 && kp2 ? [[kp1, kp2]] : [];
  });
}

/** The joint pairs that make up the skeleton. */
const skeletonJointPairNames: [string, string][] = createSkeletonJointPairs();

/** Create the joint pairs that make up the skeleton. */
function createSkeletonJointPairs() {
  type SideName = "left" | "right";
  const tuples: [BlazePose.PartName, BlazePose.PartName][] = [];
  const sides: SideName[] = ["left", "right"];
  const chains = [
    ["shoulder", "elbow", "wrist"],
    ["hip", "knee", "ankle", "heel"],
  ];
  for (const side of sides) {
    for (const chain of chains) {
      for (let i = 1; i < chain.length; i++) {
        const p1 = chain[i - 1];
        const p2 = chain[i];
        const name1 = makeName(side, p1);
        const name2 = makeName(side, p2);
        tuples.push([name1, name2]);
      }
    }
    for (const finger of ["pinky", "index", "thumb"]) {
      tuples.push([makeName(side, "wrist"), makeName(side, finger)]);
    }
  }
  return tuples;

  function makeName(sideName: SideName, jointName: string) {
    return `${sideName}_${jointName}` as BlazePose.PartName;
  }
}
