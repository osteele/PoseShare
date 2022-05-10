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

function keyPressed() {
  const mappedKeyCode = {
    'W': UP_ARROW,
    'A': LEFT_ARROW,
    'S': DOWN_ARROW,
    'D': RIGHT_ARROW,
  }[key.toUpperCase()] || keyCode;
  const [dCol, dRow] = {
    [LEFT_ARROW]: [-1, 0],
    [RIGHT_ARROW]: [1, 0],
    [UP_ARROW]: [0, -1],
    [DOWN_ARROW]: [0, 1],
  }[mappedKeyCode] || [0, 0];
  const { row, col } = getOwnRecord();
  if (dRow || dCol && row >= 0 && col >= 0) {
    rowOffset = min(max(row + rowOffset + dRow, 0), room.rows - 1) - row;
    colOffset = min(max(col + colOffset + dCol, 0), room.cols - 1) - col;
    xOffset = colOffset * 640;
    yOffset = rowOffset * 480;
  }
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
