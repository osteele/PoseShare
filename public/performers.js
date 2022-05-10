let performers = []; // each entry is {id, pose, timestamp}
let partnerId = null; // if not null, show only the performer with that id

function setOwnPose(pose) {
  updatePersonPose({
    id: clientId,
    name: username,
    isSelf: true,
    connected: true,
    hue: 0,
  }, pose);
  socket.emit('pose', { id: clientId, name: username }, pose);
}

function updatePersonPose(person, pose) {
  // find the index of the person in the list of performers
  performers = room.performers;
  let ix = performers.findIndex(({ id }) => id === person.id);
  if (ix < 0) {
    ix = performers.length;
    performers.push({ ...person, isLocal: true });
    if (room.isLocal) {
      updateRoom();
    }
  }
  // update the record
  performers[ix] = {
    ...performers[ix],
    ...person,
    pose: pose || performers[ix].pose,
    timestamp: millis(),
  };
}

// Update the performer data with properties from the server
function updatePerformerData(performerData) {
  performerData.forEach(person => updatePersonPose(person));
}

function createPartnerSelector() {
  const showAllString = 'Show All';

  // get the name of the performer as an option for the selection element
  function getOptionName({ name, isSelf }) {
    if (isSelf) name += " (self)";
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

  // TODO: use this when the list of partners or their names change, instead of
  // on mouse entry
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

function getPerformers({ includeSelf } = {}) {
  const activePerformers = performers.filter(({ pose, connected }) => pose && connected);
  let result = partnerId
    // If the user has specified a particular partner, show only that partner.
    ? [activePerformers.find(({ id }) => id === partnerId)]
    // else make a list of people who have been seen recently
    : activePerformers.filter(({ isSelf, timestamp }) => /*timestamp > millis() - 5000 &&*/ !isSelf);
  if (includeSelf) {
    const self = getOwnRecord();
    if (self) {
      result.push(self);
    }
  }
  return result;
}

function getOtherPerformers() {
  return performers.filter(({ isSelf, pose }) => !isSelf && pose);
}

function getOwnRecord() {
  return performers.find(({ isSelf, pose }) => isSelf && pose);
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
