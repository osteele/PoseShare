let confidenceThreshold = 0.2;

let xOffset = 0;
let yOffset = 0;
let targetXOffset = 0;
let targetYOffset = 0;
let rowOffset = 0;
let colOffset = 0;

function movePoseInDirection(keyCode) {
  const [dCol, dRow] = {
    [LEFT_ARROW]: [-1, 0],
    [RIGHT_ARROW]: [1, 0],
    [UP_ARROW]: [0, -1],
    [DOWN_ARROW]: [0, 1],
  }[keyCode] || [0, 0];
  const { row, col } = getOwnRecord() || {};
  if (dRow || dCol && row >= 0 && col >= 0) {
    const prevOffset = { rowOffset, colOffset };
    if (settings.toroidalMovement) {
      rowOffset = (rowOffset + dRow + row + room.rows) % room.rows - row;
      colOffset = (colOffset + dCol + col + room.cols) % room.cols - col;
    } else {
      rowOffset = min(max(rowOffset + dRow + row, 0), room.rows - 1) - row;
      colOffset = min(max(colOffset + dCol + col, 0), room.cols - 1) - col;
    }
    targetXOffset = colOffset * width;
    targetYOffset = rowOffset * height;
    // if moved by more than one square (toroidal movement), jump
    // to the new position instead of lerping
    if (max(abs(prevOffset.rowOffset - rowOffset), abs(prevOffset.colOffset - colOffset)) > 1) {
      xOffset = targetXOffset;
      yOffset = targetYOffset;
    }
  }
}
