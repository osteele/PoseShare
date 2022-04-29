// setup initializes these
let video; // p5.js Video instance
let poseNet;

// settings
let mirrorVideo = true;
let confidenceThreshold = 0.2;

let people = []; // each entry is {id, pose, timestamp}
let partnerId = null; // if not null, show only that person

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  initializeCamera();
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

  // If the user has specified a particular partner, show only that partner.
  //
  // This replaces the initialize of `activePeople` in the previous statement.
  // It does *not* restrict the filter to active people.
  if (partnerId) {
    activePeople = [people.find(({
      id
    }) => id === partnerId)];
  }

  for (let person of activePeople) {
    drawPerson(person);
  }
}

function initializeCamera() {
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

function setOwnPose(pose) {
  updatePersonPose({
    id: myPersonId,
    name: username,
    self: true,
    pose,
  });
  socket.emit('pose', {
    id: myPersonId,
    name: username,
    pose
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
