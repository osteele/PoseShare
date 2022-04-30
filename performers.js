const performers = []; // each entry is {id, pose, timestamp}
let partnerId = null; // if not null, show only that person

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
  let entry = performers.find(({
    id
  }) => id === person.id);
  if (!entry) {
    entry = {
      id: person.id
    };
    performers.push(entry);
  }
  entry.name = person.name;
  entry.pose = person.pose;
  entry.timestamp = millis();
  entry.self = person.self;
  entry.timestamp = millis();
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

  const sel = createSelect();
  sel.position(270, 10);
  sel.option(showAllString);
  sel.selected(showAllString);

  sel.changed(() => {
    let item = sel.value();
    if (item === showAllString) {
      partnerId = null;
    } else {
      let partner = performers.find(person => getOptionName(person) === item);
      partnerId = partner ? partner.id : null;
    }
  });

  sel.mouseMoved(() => {
    sel.elt.innerHTML = '';
    sel.option(showAllString);
    sel.selected(showAllString);
    for (let person of performers) {
      let optionName = getOptionName(person);
      sel.option(optionName);
      if (person.id === partnerId) {
        sel.selected(optionName);
      }
    }
  });
}

function getScenePartners() {
  // If the user has specified a particular partner, show only that partner.
  if (partnerId) {
    const partner = performers.find(({ id }) => id === partnerId);
    return [partner];
  } else {
    // make a list of people who have been seen recently
    return performers.filter(({ timestamp }) => timestamp > millis() - 5000);
  }
}
