const POSE_SHARE_PERSON_ID_KEY = 'poseSharePersonId';
const POSE_SHARE_USERNAME_KEY = 'poseShareUsername';

let myPersonId, username;
let setUsernameButton;

function setUsername() {
  myPersonId = localStorage.getItem(POSE_SHARE_PERSON_ID_KEY);
  username = localStorage.getItem(POSE_SHARE_USERNAME_KEY);
  if (!myPersonId) {
    myPersonId = Array.from({
      length: 20
    })
      .map(() => floor(random(16)).toString(16))
      .join('');
    localStorage.setItem(POSE_SHARE_PERSON_ID_KEY, myPersonId);
  }
  if (!username) {
    promptForUsername();
  }
  setUsernameButton = createButton(username ? "You are: " + username : 'Set your username')
    .position(10, 10)
    .mousePressed(promptForUsername);
}

function promptForUsername() {
  do {
    username = prompt("Enter your user name", username || '') || username;
  } while (!username);

  localStorage.setItem(POSE_SHARE_USERNAME_KEY, username);
  if (setUsernameButton) {
    setUsernameButton.elt.innerHTML = 'You are: ' + username;
  }
}
