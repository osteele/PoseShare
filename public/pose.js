let confidenceThreshold = 0.2;
let previousPose;

let xOffset = 0;
let yOffset = 0;

function smoothPose(pose) {
  const { smoothing } = settings;
  let smoothed = pose;
  if (previousPose) {
    const keypoints = pose.pose.keypoints.map((keypoint, i) => {
      let prev = previousPose.pose.keypoints[i];
      return smoothKeypoint(keypoint, prev)
    });
    smoothed = {
      ...pose,
      pose: { ...pose.pose, keypoints },
    };
  }
  previousPose = pose;
  return smoothed;

  function smoothKeypoint(keypoint, prev) {
    return {
      ...keypoint,
      score: lerp(prev.score, keypoint.score, 1 - smoothing),
      position: {
        x: lerp(prev.position.x, keypoint.position.x, 1 - smoothing),
        y: lerp(prev.position.y, keypoint.position.y, 1 - smoothing),
      }
    };
  }
}

// Add xOffset and yOffset to all the keypoints in the pose
function adjustPose(pose, xOffset, yOffset) {
  for (const keypoint of pose.pose.keypoints) {
    keypoint.position.x += xOffset;
    keypoint.position.y += yOffset;
  }
  for (const [p1, p2] of pose.skeleton) {
    p1.position.x += xOffset;
    p1.position.y += yOffset;
    p2.position.x += xOffset;
    p2.position.y += yOffset;
  }
}
