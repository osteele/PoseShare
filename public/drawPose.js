function drawPerson(person) {
  const {
    pose,
    hue,
    self
  } = person;
  drawKeypoints(pose, color(hue, 100, 100), self);
  switch (settings.appearance) {
    case 'skeleton':
      drawSkeleton(pose, color(hue, 50, 50));
      break;
    case 'kiki':
    case 'bouba':
      drawPoseOutline(pose, color(hue, 50, 50, 0.50),
        settings.appearance === 'bouba',
        self);
      break;
  }
}

function drawKeypoints(pose, c, outline) {
  fill(c);
  noStroke();
  if (outline) {
    noFill(c);
    stroke(c);
    strokeWeight(1);
  }
  for (const keypoint of pose.pose.keypoints) {
    if (keypoint.score >= confidenceThreshold) {
      circle(keypoint.position.x, keypoint.position.y, 10);
    }
  }
}

function drawSkeleton(pose, c) {
  stroke(c);
  strokeWeight(2);
  for (const skeleton of pose.skeleton) {
    const [p1, p2] = skeleton;
    if (min(p1.score, p2.score) >= confidenceThreshold) {
      line(p1.position.x, p1.position.y, p2.position.x, p2.position.y);
    }
  }
}

const partNames = [
  'rightShoulder', 'rightElbow', 'rightWrist', 'rightShoulder',
  'rightHip', 'rightKnee', 'rightAnkle', 'rightHip+leftHip',
  'leftKnee', 'leftAnkle', 'leftHip',
  'leftShoulder', 'leftElbow', 'leftWrist', 'leftShoulder',
];

function drawPoseOutline(pose, c, curved, outlineOnly) {
  const keypoints = pose.pose.keypoints;

  function findPart(partName) {
    if (partName.match(/\+/)) {
      const [p1, p2] = partName.split('+').map(findPart);
      return {
        score: (p1.score + p2.score) / 2,
        position: {
          x: (p1.position.x + p2.position.x),
          y: (p1.position.x + p2.position.x),
        }
      };
    }
    return keypoints.find(({
      part
    }) => part === partName);
  };

  function drawOutline() {
    beginShape();
    for (const name of partNames) {
      const keypoint = findPart(name);
      if (keypoint && keypoint.score >= confidenceThreshold) {
        if (curved && name.match(/elbow|knee/i)) {
          curveVertex(keypoint.position.x, keypoint.position.y);
        } else {
          vertex(keypoint.position.x, keypoint.position.y);
        }
      }
    }
    fill(c);
    stroke(c);
    strokeWeight(10);
    if (outlineOnly) {
      noFill();
      strokeWeight(2);
    }
    endShape(CLOSE);
  }

  drawOutline(partNames);
  drawOutline(['leftEye', 'rightEye', 'nose']);
}
