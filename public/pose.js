let confidenceThreshold = 0.2;
let previousPose;

let xOffset = 0;
let yOffset = 0;
let targetXOffset = 0;
let targetYOffset = 0;
let rowOffset = 0;
let colOffset = 0;

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
function translatePose(pose, xOffset, yOffset) {
  return {
    ...pose,
    pose: {
      ...pose.pose,
      keypoints: pose.pose.keypoints.map(translateKeypoint)
    },
    skeleton: pose.skeleton.map(pts => pts.map(translateKeypoint))
  };

  function translateKeypoint(keypoint) {
    return {
      ...keypoint,
      position: {
        x: keypoint.position.x + xOffset,
        y: keypoint.position.y + yOffset,
      }
    }
  }
}
