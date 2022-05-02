const POSE_SHARE_PERSON_ID_KEY = 'poseSharePersonId';
const POSE_SHARE_USERNAME_KEY = 'poseShareUsername';

const clientId = getClientId();
let username = getUsername();

function getClientId() {
  let id = localStorage.getItem(POSE_SHARE_PERSON_ID_KEY);
  if (!id) {
    id = Array.from({
      length: 20
    })
      .map(() => floor(random(16)).toString(16))
      .join('');
    localStorage.setItem(POSE_SHARE_PERSON_ID_KEY, id);
  }
  return id;
}

function getUsername() {
  let name = localStorage.getItem(POSE_SHARE_USERNAME_KEY);
  for (; !name;) {
    name = prompt("Enter your user name", name || '');
  }
  localStorage.setItem(POSE_SHARE_USERNAME_KEY, name);
  settings.name = name;
  return name;
}

usernameController.onFinishChange(value => {
  value = value.trim();
  if (value) {
    username = value;
    localStorage.setItem(POSE_SHARE_USERNAME_KEY, username);
  } else {
    settings.name = username;
  }
});
