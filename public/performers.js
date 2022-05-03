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
  performerData.forEach(updatePersonPose);
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

  createDiv('Partner:').class('label').parent('partner-container');
  const sel = createSelect().parent('partner-container');
  sel.option(showAllString);

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

function getPerformers() {
  const activePerformers = performers.filter(({ pose, connected }) => pose && connected);
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

function getPerformersForGallery() {
  const syntheticPerformersMatch = document.location.hash.match(/synthetics(?:=(\d+))?/);
  let synthesizePerformerTotal = syntheticPerformersMatch === null ? 0 : Number(syntheticPerformersMatch[1] || 0);
  let activePerformers = performers;
  if (synthesizePerformerTotal) {
    // synthesize some more performers, for debugging purposes
    activePerformers = [...activePerformers];
    let srcIndex = 0;
    while (activePerformers.length > 0 && activePerformers.length < synthesizePerformerTotal) {
      const src = activePerformers[srcIndex++];
      activePerformers.push({ ...src, id: src.id + '-1', hue: src.hue + 30 });
    }
  }
  return activePerformers;
}
