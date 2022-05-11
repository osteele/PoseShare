// setup initializes these
let video; // p5.js Video instance
let poseNet;

// Enable the following to draw the image on the canQvas. Currently it is
// rendered via a <video> element placed behind theQ canvas.
const drawVideoOnCanvas = false;

function setup() {
  // The webcam is initialized to this
  createCanvas(880, 500).parent('sketch-container');
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

  xOffset = lerp(xOffset, targetXOffset, 0.1);
  yOffset = lerp(yOffset, targetYOffset, 0.1);

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
  const { row, col } = getOwnRecord() || {};
  if (dRow || dCol && row >= 0 && col >= 0) {
    rowOffset = min(max(row + rowOffset + dRow, 0), room.rows - 1) - row;
    colOffset = min(max(col + colOffset + dCol, 0), room.cols - 1) - col;
    targetXOffset = colOffset * width;
    targetYOffset = rowOffset * height;
  }
}

// Does not draw the background. draw() does that before it calls this function.
function drawScene() {
  const performers = getPerformers({ includeSelf: settings.showSelf });
  const self = getOwnRecord();
  for (const person of performers) {
    push();
    if (self && self.row >= 0 && person.row >= 0) {
      translate(width * (person.col - self.col), height * (person.row - self.row));
    }
    drawPerson(person, performers.length > 1 && person.isSelf);
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
