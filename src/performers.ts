/**
 * This module manages the list of performers, and the partner selector.
 * It also handles the "performers" event, which is sent when the client
 * should update its list of performers.
 */

import { room, updateRoom } from "./room";
import { socket } from "./socket";
import { Performer } from "./types";
import { clientId, username } from "./username";

/** The list of performers. */
let performers: Performer[] = [];

/** If not null, show only the performer with the specified id. */
let partnerId: string | null = null;

export function setOwnPose(pose) {
  updatePersonPose(
    {
      id: clientId,
      name: username,
      isSelf: true,
      connected: true,
      // hue: 0,
    },
    pose
  );
  socket.emit("pose", { id: clientId, name: username }, pose);
}

export function updatePersonPose(person, pose = null) {
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
    timestamp: +new Date(), // TODO: review
  };
  if (person.hue >= 0) {
    performers[ix].hue = person.hue;
    // console.info('hue', person.name, person.hue);
  } else {
    // console.info('no hue', person.name)
  }
}

/** Update the performer data with properties from the server. */
export function updatePerformerData(performerData) {
  // console.info('update performer data');
  performerData.forEach((person) => updatePersonPose(person));
}

function createPartnerSelector(p5) {
  const showAllString = "Show All";

  // get the name of the performer as an option for the selection element
  function getOptionName({ name, isSelf }: { name: string; isSelf: boolean }) {
    if (isSelf) name += " (self)";
    return name;
  }

  p5.createDiv("Partner:").class("label").parent("partner-container");
  const sel = p5.createSelect().parent("partner-container");
  sel.option(showAllString);

  sel.changed(() => {
    const item = sel.value();
    if (item === showAllString) {
      partnerId = null;
    } else {
      const partner = performers.find(
        (person) => getOptionName(person) === item
      );
      partnerId = partner ? partner.id : null;
    }
  });

  // TODO: use this when the list of partners or their names change, instead of
  // on mouse entry
  sel.mouseMoved(() => {
    sel.elt.innerHTML = "";
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

export function getPerformers({ includeSelf }: { includeSelf?: boolean } = {}) {
  const activePerformers = performers.filter(
    ({ pose, connected }) => pose && connected
  );
  let result = partnerId
    ? // If the user has specified a particular partner, show only that partner.
      [activePerformers.find(({ id }) => id === partnerId)!]
    : // else make a list of people who have been seen recently
      activePerformers.filter(
        ({ isSelf, timestamp }) => /*timestamp > millis() - 5000 &&*/ !isSelf
      );
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

export function getOwnRecord() {
  return performers.find(({ isSelf, pose }) => isSelf && pose)!;
}

function getPerformersForGallery() {
  const syntheticPerformersMatch = document.location.hash.match(
    /synthetics(?:=(\d+))?/
  );
  let synthesizePerformerTotal =
    syntheticPerformersMatch === null
      ? 0
      : Number(syntheticPerformersMatch[1] || 0);
  let activePerformers = performers;
  if (synthesizePerformerTotal) {
    // synthesize some more performers, for debugging purposes
    activePerformers = [...activePerformers];
    let srcIndex = 0;
    while (
      activePerformers.length > 0 &&
      activePerformers.length < synthesizePerformerTotal
    ) {
      const src = activePerformers[srcIndex++];
      activePerformers.push({ ...src, id: src.id + "-1", hue: src.hue + 30 });
    }
  }
  return activePerformers;
}
