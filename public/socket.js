const socket = io();

const logSocketEvents = false; // console.log received messages, if true

// remembers the initial hash, in order to display the splash if it changes
let liveReloadHash;

function connectWebsocket() {
  log('Connecting to websocket...');
  let sentJoinEvent = false;

  socket.on('connect', () => {
    log('Connected to websocket!');
    sendJoinEvent();
  });

  socket.on('pose', (person, pose) => {
    updatePersonPose(person, pose);
  });

  socket.on('performers', (performers) => {
    log('performers', performers);
    updatePerformerData(performers);
  });

  socket.on('room', (roomData) => {
    log('room', roomData);
    updateRoomFromServer(roomData);
  });

  socket.on("liveReload", (hash) => {
    // If this is the first time, set the hash
    liveReloadHash = liveReloadHash || hash;
    // If the hash has changed, display the splash
    document.getElementById('reload-splash').style.display =
      (liveReloadHash === hash) ? null : 'block';
  });

  socket.on('log', (message) => {
    // This is always logged to the console, regardless of the value of
    // logSocket.
    console.log(message);

    // Append it to the HTML log
    const elt = document.querySelector('#log');
    const line = document.createElement('code');
    const ts = (new Date()).toISOString().replace(/.+T(.{5}).+/, '$1');
    line.innerText = `${ts} — ${message}\n`;
    elt.appendChild(line);
    // Prune the HTML log
    while (document.querySelectorAll('#log code').length > 20) {
      document.querySelector('#log code').remove();
    }
  });

  socket.on('requestJoinEvent', () => {
    log('requestJoinEvent');
    // Prevent a race condition
    if (!sentJoinEvent) {
      sendJoinEvent();
    }
  });

  function sendJoinEvent() {
    const roomName = getQueryString('room');
    socket.emit('join', { id: clientId, name: username, roomName });
    sentJoinEvent = true;
  }

  function log(message, ...args) {
    if (logSocketEvents) { console.debug(message, ...args); }
  }
}
