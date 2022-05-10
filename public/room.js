// {size, rows, cols, isLocal, Record<clientId: string, positon: Number>}
let room = {
  isLocal: true,
  rows: 0,
  cols: 0,
  performers: [],
  settings: {}
};

// Update the room dimensions based on the number of performers.
function updateRoom() {
  const sharedPerformers = room.performers.filter(({ isLocal }) => !isLocal);
  const n = max(sharedPerformers.length, 1);
  room.rows = room.settings?.rows ?? ceil(sqrt(n));
  room.cols = room.settings?.cols ?? ceil(n / room.rows);

  room.performers.forEach(person => {
    if (person.id === clientId) {
      person.isSelf = true;
    }
  });

  // Assign each extra performer that is not in the list of room performers to
  // the next unused position:

  // Clear out the positions of performers that are not assigned to a position
  // by the server.
  room.performers
    .filter(({ isLocal }) => isLocal)
    .forEach(person => person.position = null);

  // Assign each performer without a position, to the next unused position. This
  // is order O(n^2), but n is usually 0, occasionally 1, and rarely a slightly
  // greater number.
  room.performers
    .filter(({ position }) => position === null || position === undefined)
    .forEach(person => {
      // Collect the positions of non-local performers.
      const positions = room.performers
        .map(({ position }) => position)
        .filter(position => position !== null);
      person.position = positions.length ? 1 + Math.max(...positions) : 0;
    });

  // Add row and col properties.
  room.performers.forEach(person => {
    person.row = floor(person.position / room.cols);
    person.col = person.position % room.cols;
  });

  // enlarge the room to accomodate any extra rows
  room.rows = Math.max(room.rows,
    (1 + Math.max(...room.performers.map(({ row }) => row))))
}
