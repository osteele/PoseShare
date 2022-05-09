import { Performer } from "./types";

let performers: Performer[] = [];

export function logConnectedUsers() {
  const connected = performers.filter(({ connected }) => connected);
  const disconnected = performers.filter(({ connected }) => !connected);
  let msg = `Active: ${connected.length ? names(connected) : "none"}`;
  if (disconnected.length) {
    msg += `; Disconnected: ${names(disconnected)}`;
  }
  console.log(msg);

  function names(people: Performer[]) {
    return people.map(({ name }) => name).join(", ");
  }
}

export function findPerformerById(clientId: string) {
  return performers.find(({ id }) => id === clientId);
}

export function findOrCreatePerformer(data: Performer) {
  let performer = findPerformerById(data.id);
  if (!performer) {
    performer = { ...data };
    performers.push(performer);
    // re-assign the hues
    performers.forEach(
      (performer, i) => (performer.hue = (360 * i) / performers.length)
    );
  }
  performer.connected = true;
  performer.timestamp = new Date();
  removeExpiredPerformers();
  return performer;
}

export function getPerformersForBroadcast() {
  return performers.map((user) => ({ ...user, timestamp: undefined }));
}

function removeExpiredPerformers() {
  const now = new Date();
  performers = performers.filter(({ timestamp }) => +now - +timestamp < 5000);
}
