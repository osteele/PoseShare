// setup initializes these
let video; // p5.js Video instance
let poseNet;

// settings
let mirrorVideo = true;
let confidenceThreshold = 0.2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  initializeWebcam();
  setUsername();
  connectWebsocket();
  createPartnerSelector();

  createDiv('Smoothing').position(10, 70);
  smoothingSlider = createSlider(0, 0.95, smoothing, 0.05)
    .position(100, 70);
  let checkbox = createCheckbox('Mirror video', mirrorVideo)
    .position(10, 40)
    .changed(() => mirrorVideo = checkbox.checked());
}

function draw() {
  clear();

  let s = min(width / video.width, height / video.height);
  scale(s);

  push();
  if (mirrorVideo) {
    translate(video.width, 0);
    scale(-1, 1);
  }
  image(video, 0, 0);
  pop();

  drawScene();
}

// Does not draw the background. draw() does that first.
function drawScene() {
  // assign each person a hue
  performers.forEach((person, i) => {
    person.hue = map(i, 0, performers.length, 0, 360)
  });

  let activePeople = getScenePartners();

  for (let person of activePeople) {
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
