let previousPose;

function smoothPose(pose) {
  const { smoothing } = settings;
  let smoothed = pose;
  if (previousPose) {
    smoothed = {
      ...pose,
      pose: pose.pose,
      keypoints: pose.keypoints
    };
    smoothed.pose.keypoints.forEach((keypoint, i) => {
      let prev = previousPose.pose.keypoints[i];
      smoothed.pose.keypoints[i] = {
        ...keypoint,
        score: lerp(prev.score, keypoint.score, 1 - smoothing),
        position: {
          x: lerp(prev.position.x, keypoint.position.x, 1 - smoothing),
          y: lerp(prev.position.y, keypoint.position.y, 1 - smoothing),
        }
      }
    });
  }
  previousPose = pose;
  return smoothed;
}
