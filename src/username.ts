import { settings, guiControllers } from "./settings";

const POSE_SHARE_PERSON_ID_KEY = "poseSharePersonId";
const POSE_SHARE_USERNAME_KEY = "poseShareUsername";

export const clientId = getClientId();
export let username = getUsername();

function getClientId() {
  let id = localStorage.getItem(POSE_SHARE_PERSON_ID_KEY);
  if (!id) {
    id = createClientId();
    localStorage.setItem(POSE_SHARE_PERSON_ID_KEY, id);
  }
  return id;
}

function createClientId() {
  const { floor, random } = Math;
  // The following statement doesn't necessarily generate two characters for
  // each hex digit, but that's okay; it's still enough entropy to avoid
  // collisions.
  return Array.from({ length: 20 })
    .map(() => floor(16 * random()).toString(16))
    .join("");
}

function getUsername() {
  let name = localStorage.getItem(POSE_SHARE_USERNAME_KEY);
  for (; !name; ) {
    name = prompt("Enter your user name", name || "");
  }
  localStorage.setItem(POSE_SHARE_USERNAME_KEY, name);
  settings.name = name;
  return name;
}

guiControllers.username.onFinishChange((value) => {
  value = value.trim();
  if (value) {
    username = value;
    localStorage.setItem(POSE_SHARE_USERNAME_KEY, username);
  } else {
    settings.name = username;
  }
});
