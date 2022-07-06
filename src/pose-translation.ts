import { BlazePose, Posenet } from "./types";
import { capitalize } from "./utils";

// NOTE: does not add the missing keypoints; the order ends up being different
export function translatePosenetToBlazePose(
  pose: Posenet.Pose
): BlazePose.Pose {
  const keypoints = pose.pose.keypoints.map(translateKeypoint);
  const keypoints3D = [];
  return { keypoints, keypoints3D, score: pose.pose.score };

  function translateKeypoint(keypoint: Posenet.Keypoint) {
    const { part, position, score } = keypoint;
    return {
      name: translatePartName(part),
      score,
      ...position,
      z: 0,
    };
  }

  function translatePartName(name: Posenet.PartName) {
    return name.replace(
      /([A-Z])/g,
      (_, c) => `_${c.toLowerCase()}`
    ) as BlazePose.PartName;
  }
}

// NOTE: does not remove BlazePose keypoints that aren't in PoseNet; the order
// ends up being different
export function translateBlazePoseToPosenet(
  pose: BlazePose.Pose
): Posenet.Pose {
  const keypoints = pose.keypoints.map(translateKeypoint);
  const keypointsByIndex = Object.fromEntries(
    keypoints.map((keypoint) => [keypoint.part, keypoint])
  );
  const skeleton = skeletonJointPairs.map(([name1, name2]) => {
    const keypoint1 = keypointsByIndex[name1];
    const keypoint2 = keypointsByIndex[name2];
    return [keypoint1, keypoint2] as [Posenet.Keypoint, Posenet.Keypoint];
  });
  return { pose: { keypoints, score: pose.score }, skeleton };

  function translateKeypoint(keypoint: BlazePose.Keypoint) {
    const { score, x, y } = keypoint;
    return {
      part: translatePartName(keypoint.name),
      score,
      position: { x, y },
    };
  }

  function translatePartName(name: BlazePose.PartName) {
    return name.replace(/_([a-z])/g, (_, c) =>
      c.toUpperCase()
    ) as Posenet.PartName;
  }
}

const skeletonJointPairs = createSkeletonJointPairs();

function createSkeletonJointPairs() {
  const tuples: [Posenet.PartName, Posenet.PartName][] = [];
  const sides = ["left", "right"];
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

  function makeName(leftOrRight: string, baseName: string) {
    return `${leftOrRight}${capitalize(baseName)}` as Posenet.PartName;
  }
}
