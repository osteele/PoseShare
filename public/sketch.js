// setup initializes these
let video; // p5.js Video instance
let poseNet;

function setup() {
  createCanvas(640, 480).parent('sketch-container');
  colorMode(HSB);
  initializeWebcam();
  connectWebsocket();
  createPartnerSelector();
  // setupChooseCamera();
}

function draw() {
  clear();

  push();
  if (settings.mirrorVideo) {
    translate(video.width, 0);
    scale(-1, 1);
  }
  image(video, 0, 0);
  pop();

  drawScene();
  updateGallery();
}

// Does not draw the background. draw() does that first.
function drawScene() {
  const scenePartners = getScenePartners();
  if (settings.showSelf) {
    const self = getOwnRecord();
    if (self) {
      scenePartners.push(self);
    }
  }
  for (const person of scenePartners) {
    drawPerson(person);
  }
}

function initializePosenet() {
  poseNet = ml5.poseNet(
    video, {
    flipHorizontal: true,
    detectionType: "single"
  },
    () => select("#loading").hide()
  );

  poseNet.on("pose", ([pose]) => {
    if (pose) {
      adjustPose(pose, xOffset, yOffset);
      pose = smoothPose(pose);
      setOwnPose(pose);
    }
  });
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
