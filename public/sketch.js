// setup initializes these
let video; // p5.js Video instance
let poseNet;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  initializeWebcam();
  connectWebsocket();
  createPartnerSelector();
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
}

// Does not draw the background. draw() does that first.
function drawScene() {
  const scenePartners = getScenePartners();
  for (const person of scenePartners) {
    drawPerson(person);
  }
}

function initializeWebcam() {
  video = createCapture(VIDEO, initializePosenet);
  video.size(640, 480);
  video.hide();
}

function initializePosenet() {
  poseNet = ml5.poseNet(
    video, {
    flipHorizontal: true,
    detectionType: "single"
  },
    // () => select("#status").hide()
  );

  poseNet.on("pose", ([pose]) => {
    if (pose) {
      pose = smoothPose(pose);
      setOwnPose(pose);
    }
  });
}
