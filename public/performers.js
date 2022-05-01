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
  let ix = performers.findIndex(({ id }) => id === person.id);
  if (ix < 0) {
    ix = performers.length;
    performers.push(person);
  }
  performers[ix] = {
    ...performers[ix],
    ...person,
    timestamp: millis(),
  };
}

function updatePerformerData(performerData) {
  performerData.forEach(({ id, hue }) => {
    updatePersonPose({
      id,
      hue,
    });
  });
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
  const activePerformers = performers.filter(({ pose }) => pose);
  // If the user has specified a particular partner, show only that partner.
  if (partnerId) {
    const partner = activePerformers.find(({ id }) => id === partnerId);
    return [partner];
  } else {
    // make a list of people who have been seen recently
    return activePerformers.filter(({ timestamp }) => timestamp > millis() - 5000);
  }
}
