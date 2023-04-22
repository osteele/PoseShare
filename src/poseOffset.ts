/** The user can press the arrow keys in order to move the pose within the room.
 * This module stores the current offset, and handles the keypresses.
 */

import p5 from "p5";
import { performerManager } from "./performers";
import { room } from "./room";
import { settings } from "./settings";
import { clamp, lerp, mod } from "./utils";

// The (row, column) grid offset from the initial position of the performer,
// which is stored in the performer's row and col properties.
let rowOffset = 0;
let colOffset = 0;

// The target (x, y) pixel offset from the initial position of the performer.
// This is calculated from the rowOffset and colOffset.
export let targetXOffset = 0;
export let targetYOffset = 0;

// The current (x, y) pixel offset from the initial position of the performer.
// This is used to interpolate to the new position, when the grid position changes.
export let xOffset = 0;
export let yOffset = 0;

export function setOffset(x: number, y: number): void {
  xOffset = x;
  yOffset = y;
}

export function updateOffset() {
  setOffset(
    lerp(xOffset, targetXOffset, 0.1),
    lerp(yOffset, targetYOffset, 0.1)
  );
}

/** Move the pose in the direction specified by the keyCode.
 * The pose will move in the direction of the arrow key that was pressed.
 * This function is called by the p5 keyPressed() function.
 * @param p5 The p5 instance
 * @param keyCode The keyCode of the key that was pressed
 * @see https://p5js.org/reference/#/p5/keyCode
 * @see https://p5js.org/reference/#/p5/keyPressed
 */
export function movePoseInDirection(p5: p5, keyCode: number): void {
  const [dCol, dRow] = {
    [p5.LEFT_ARROW]: [-1, 0],
    [p5.RIGHT_ARROW]: [1, 0],
    [p5.UP_ARROW]: [0, -1],
    [p5.DOWN_ARROW]: [0, 1],
  }[keyCode] || [0, 0];
  const { row, col } = performerManager.getOwnRecord() || { row: 0, col: 0 };
  const prevOffset = { rowOffset, colOffset };
  let row1 = row + rowOffset + dRow;
  let col1 = col + colOffset + dCol;
  if (settings.toroidalMovement) {
    // If toroidal movement is enabled, wrap around the edges of the room.
    row1 = mod(row1, room.rows);
    col1 = mod(col1, room.cols);
  } else {
    // If toroidal movement is disabled, clamp the pose to the edges of the room.
    row1 = clamp(row, 0, room.rows);
    col1 = clamp(col, 0, room.cols);
  }
  rowOffset = row1 - row;
  colOffset = col1 - col;
  // If the user presses the 0 key, reset the pose to its initial position.
  if (keyCode === 48) {
    rowOffset = 0;
    colOffset = 0;
  }
  targetYOffset = rowOffset * p5.height;
  targetXOffset = colOffset * p5.width;
  // if moved by more than one square (toroidal movement), jump
  // to the new position instead of lerping
  if (
    p5.max(
      p5.abs(prevOffset.rowOffset - rowOffset),
      p5.abs(prevOffset.colOffset - colOffset)
    ) > 1
  ) {
    xOffset = targetXOffset;
    yOffset = targetYOffset;
  }
}
