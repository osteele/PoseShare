// setup initializes these
let video; // p5.js Video instance
let poseNet;

// Enable the following to draw the image on the canQvas. Currently it is
// rendered via a <video> element placed behind theQ canvas.
const drawVideoOnCanvas = false;

function setup() {
  createCanvas(640, 480).parent('sketch-container');
  colorMode(HSB);
  initializeWebcam();
  connectWebsocket();
  createPartnerSelector();
  cameraReadyPromise.then(initializePosenet);
}

function draw() {
  push();
  drawingContext.globalCompositeOperation = 'destination-out';
  background(0, 1 / (1 + 2 * settings.trail));
  pop();

  if (drawVideoOnCanvas) {
    push();
    if (settings.mirrorVideo) {
      translate(video.width, 0);
      scale(-1, 1);
    }
    image(video, 0, 0);
    pop();
  }

  drawScene();
  updateGallery();
}

// Does not draw the background. draw() does that before it calls this function.
function drawScene() {
  const performers = getPerformers({ includeSelf: settings.showSelf });
  for (const person of performers) {
    drawPerson(person, performers.length > 1 && person.isSelf);
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
