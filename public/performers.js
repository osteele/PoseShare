const performers = []; // each entry is {id, pose, timestamp}
let partnerId = null; // if not null, show only that person

function setOwnPose(pose) {
  updatePersonPose({
    id: clientId,
    name: username,
    self: true,
    pose,
  });
  socket.emit('pose', {
    id: clientId,
    name: username,
    pose
  });
}

function updatePersonPose(person) {
  // find the index of the person in the list of performers
  let ix = performers.findIndex(({ id }) => id === person.id);
  if (ix < 0) {
    ix = performers.length;
    performers.push(person);
  }
  // update their record
  performers[ix] = {
    ...performers[ix],
    ...person,
    timestamp: millis(),
  };
}

// Update the performer data with properties from the server
function updatePerformerData(performerData) {
  performerData.forEach(({ id, hue }) => {
    updatePersonPose({
      id,
      hue,
    });
  });
}

function createPartnerSelector() {
  const showAllString = 'Show All';

  function getOptionName({
    name,
    self
  }) {
    if (self) name += " (self)";
    return name;
  }

  createDiv('Partner:').position(660, 180);

  const sel = createSelect();
  sel.position(730, 180);
  sel.option(showAllString);
  sel.selected(showAllString);

  sel.changed(() => {
    const item = sel.value();
    if (item === showAllString) {
      partnerId = null;
    } else {
      const partner = performers.find(person => getOptionName(person) === item);
      partnerId = partner ? partner.id : null;
    }
  });

  sel.mouseMoved(() => {
    sel.elt.innerHTML = '';
    sel.option(showAllString);
    sel.selected(showAllString);
    for (const person of getOtherPerformers()) {
      const optionName = getOptionName(person);
      sel.option(optionName);
      if (person.id === partnerId) {
        sel.selected(optionName);
      }
    }
  });
}

function getScenePartners() {
  const activePerformers = performers.filter(({ pose }) => pose);
  // If the user has specified a particular partner, show only that partner.
  if (partnerId) {
    const partner = activePerformers.find(({ id }) => id === partnerId);
    return [partner];
  } else {
    // make a list of people who have been seen recently
    return activePerformers.filter(({ self, timestamp }) => timestamp > millis() - 5000 && !self);
  }
}

function getOtherPerformers() {
  return performers.filter(({ self, pose }) => !self && pose);
}

function getOwnRecord() {
  return performers.find(({ self, pose }) => self && pose);
}
