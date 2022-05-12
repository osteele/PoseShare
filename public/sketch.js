// setup initializes these
let video; // p5.js Video instance
let poseNet;

function preload() {
  preloadMetaballs();
}

function setup() {
  // The webcam is initialized to this
  const canvas = createCanvas(settings.width, settings.height, settings.useWebGL ? WEBGL : P2D);
  // Move the canvas HTML element inside the container element. This posiitons
  // the canavs at the same x and y location as the video element.
  canvas.parent('sketch-container');
  colorMode(HSB);

  // This calls createVideo(CAMERA). It also creates a Promise that resolves
  // when the video is ready.
  initializeWebcam();

  connectWebsocket();
  // createPartnerSelector();
  cameraReadyPromise.then(initializePosenet);
}

function draw() {
  // Fade out the previous canvas pixels towards transparency.
  // This leaves a ghostly trail.
  push();
  drawingContext.globalCompositeOperation = 'destination-out';
  background(0, 1 / (1 + 2 * settings.trail));
  pop();

  xOffset = lerp(xOffset, targetXOffset, 0.1);
  yOffset = lerp(yOffset, targetYOffset, 0.1);

  // Draw the video onto the canvas. This is incompatible with the fading
  // functionality above; if it is disabled, the video is displayed in the
  // <video> HTML element, instead of being drawn onto each frame of the canvas.
  if (settings.drawVideoOnCanvas) {
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

function keyPressed() {
  const mappedKeyCode = {
    'W': UP_ARROW,
    'A': LEFT_ARROW,
    'S': DOWN_ARROW,
    'D': RIGHT_ARROW,
  }[key.toUpperCase()] || keyCode;
  movePoseInDirection(mappedKeyCode);
}

// Does not draw the background. draw() does that before it calls this function.
function drawScene() {
  const performers = getPerformers({ includeSelf: settings.showSelf });
  const self = getOwnRecord();
  for (const person of performers) {
    push();
    if (self && self.row >= 0 && person.row >= 0) {
      // translate the canvas by the displacement between the performer's home
      // position (person.row, person.col) and the position assigned to this
      // client's performer (self.row, self.col).
      translate(width * (person.col - self.col), height * (person.row - self.row));
    }
    drawPerson(person, settings.outlineSelf && person.isSelf);
    pop();
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
      pose = translatePose(pose, xOffset, yOffset);
      pose = smoothPose(pose);
      setOwnPose(pose);
    }
  });
}
