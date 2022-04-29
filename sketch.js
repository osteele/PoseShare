let socket = io.connect(":30000?sketch=1556869");

// setup initializes these
let video; // p5.js Video instance
let poseNet;

// settings
let mirrorVideo = true;
let confidenceThreshold = 0.2;

// smoothing
let smoothing = 0.8;
let smoothingSlider;
let previousPose;

let people = []; // each entry is {id, pose, timestamp}
let partnerId = null; // if not null, show only that person

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  initializeCamera();
  setUsername();
  setupPosenet();
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
  smoothing = smoothingSlider.value();

  let s = min(width / video.width, height / video.height);
  scale(s);

  push();
  if (mirrorVideo) {
    translate(video.width, 0);
    scale(-1, 1);
  }
  image(video, 0, 0);
  pop();

  drawPeople();
}

function drawPeople() {
  // assign each person a hue
  people.forEach((person, i) => {
    person.hue = map(i, 0, people.length, 0, 360)
  });

  // make a list of people who have been seen recently
  let activePeople = people.filter(({
    timestamp
  }) => timestamp > millis() - 5000);

  // If the user has specified a particular partner, show
  // only that partner. (This replaces the initialize of
  // `activePeople` in the previous statement. It does *not*
  // restrict the filter to active people.
  if (partnerId) {
    activePeople = [people.find(({
      id
    }) => id === partnerId)];
  }

  for (let person of activePeople) {
    drawPerson(person);
  }
}

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

function initializeCamera() {
  video = createCapture(VIDEO);
  video.size(640, 480);
  // Hide the video element, and just show the canvas
  video.hide();
}

function setupPosenet() {
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
      updatePersonPose({
        id: myPersonId,
        name: username,
        pose,
        self: true
      });
    }
  });
}

function connectWebsocket() {
  poseNet.on("pose", ([pose]) => {
    if (pose) {
      pose = smoothPose(pose);
      socket.emit('pose', {
        id: myPersonId,
        name: username,
        pose
      });
    }
  });
  socket.on('pose', ({
    id,
    name,
    pose
  }) => {
    updatePersonPose({
      id,
      name,
      pose
    });
  });
}

function updatePersonPose(person) {
  let entry = people.find(({
    id
  }) => id === person.id);
  if (!entry) {
    entry = {
      id: person.id
    };
    people.push(entry);
  }
  entry.name = person.name;
  entry.pose = person.pose;
  entry.timestamp = millis();
  entry.self = person.self;
}

function createPartnerSelector() {
  let showAllString = 'Show All';

  function getOptionName({
    name,
    self
  }) {
    if (self) name += " (self)";
    return name;
  }

  createDiv('Partner:').position(200, 10);
  let sel = createSelect();
  sel.position(270, 10);
  sel.option(showAllString);
  sel.selected(showAllString);

  sel.changed(() => {
    let item = sel.value();
    if (item === showAllString) {
      partnerId = null;
    } else {
      let partner = people.find(person => getOptionName(person) === item);
      partnerId = partner ? partner.id : null;
    }
  });

  sel.mouseMoved(() => {
    sel.elt.innerHTML = '';
    sel.option(showAllString);
    sel.selected(showAllString);
    for (let person of people) {
      let optionName = getOptionName(person);
      sel.option(optionName);
      if (person.id === partnerId) {
        sel.selected(optionName);
      }
    }
  });
}

let myPersonId, username;
let setUsernameButton;

const POSE_SHARE_PERSON_ID_KEY = 'poseSharePersonId';
const POSE_SHARE_USERNAME_KEY = 'poseShareUsername';

function setUsername() {
  myPersonId = localStorage.getItem(POSE_SHARE_PERSON_ID_KEY);
  username = localStorage.getItem(POSE_SHARE_USERNAME_KEY);
  if (!myPersonId) {
    myPersonId = Array.from({
      length: 20
    })
      .map(() => floor(random(16)).toString(16))
      .join('');
    localStorage.setItem(POSE_SHARE_PERSON_ID_KEY, myPersonId);
  }
  if (!username) {
    promptForUsername();
  }
  setUsernameButton = createButton(username ? "You are: " + username : 'Set your username')
    .position(10, 10)
    .mousePressed(promptForUsername);
}

function promptForUsername() {
  do {
    username = prompt("Enter your user name", username || '') || username;
  } while (!username);

  localStorage.setItem(POSE_SHARE_USERNAME_KEY, username);
  if (setUsernameButton) {
    setUsernameButton.elt.innerHTML = 'You are: ' + username;
  }
}

function smoothPose(pose) {
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
