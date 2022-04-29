function drawPerson(person) {
  let {
    id,
    pose,
    timestamp,
    hue
  } = person;
  drawKeypoints(pose, color(hue, 100, 100));
  // drawSkeleton(pose, color(hue, 50, 50));
  drawPoseOutline(pose, color(hue, 50, 50, 0.50));
}

function drawKeypoints(pose, c) {
  fill(c);
  noStroke();
  for (let keypoint of pose.pose.keypoints) {
    if (keypoint.score >= confidenceThreshold) {
      ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
    }
  }
}

function drawSkeleton(pose, c) {
  stroke(c);
  strokeWeight(2);
  for (let skeleton of pose.skeleton) {
    let [p1, p2] = skeleton;
    if (min(p1.score, p2.score) >= confidenceThreshold) {
      line(p1.position.x, p1.position.y, p2.position.x, p2.position.y);
    }
  }
}

function drawPoseOutline(pose, c) {
  let keypoints = pose.pose.keypoints;

  function findPart(partName) {
    if (partName.match(/\+/)) {
      let [p1, p2] = partName.split('+').map(findPart);
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
    for (let name of partNames) {
      let kp = findPart(name);
      // if (!kp) {
      // 	console.info('not found: ' + name);
      // 	noLoop();
      // }
      if (kp && kp.score >= confidenceThreshold) {
        if (name.match(/elbow|knee/i)) {
          curveVertex(kp.position.x, kp.position.y);
        } else {
          vertex(kp.position.x, kp.position.y);
        }
      }
    }
    fill(c);
    stroke(c);
    strokeWeight(10);
    endShape(CLOSE);
  }

  let partNames = [
    'rightShoulder', 'rightElbow', 'rightWrist', 'rightShoulder',
    'rightHip', 'rightKnee', 'rightAnkle', 'rightHip+leftHip',
    'leftKnee', 'leftAnkle', 'leftHip',
    'leftShoulder', 'leftElbow', 'leftWrist', 'leftShoulder',
  ];
  drawOutline(partNames);
  drawOutline(['leftEye', 'rightEye', 'nose']);
}
