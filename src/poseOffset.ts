/** The user can press the arrow keys in order to move the pose within the room.
 * This file stores the current offset, and handles the keypresses.
 */

import p5 from "p5";
import { getOwnRecord } from "./performers";
import { room } from "./room";
import { settings } from "./settings";

export let xOffset = 0;
export let yOffset = 0;
export let targetXOffset = 0;
export let targetYOffset = 0;

let rowOffset = 0;
let colOffset = 0;

export function setOffset(x: number, y: number): void {
  xOffset = x;
  yOffset = y;
}

/** Move the pose in the direction specified by the keyCode.
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
  const { row, col } = getOwnRecord() || {};
  if (dRow || (dCol && row >= 0 && col >= 0)) {
    const prevOffset = { rowOffset, colOffset };
    if (settings.toroidalMovement) {
      rowOffset = ((rowOffset + dRow + row + room.rows) % room.rows) - row;
      colOffset = ((colOffset + dCol + col + room.cols) % room.cols) - col;
    } else {
      rowOffset =
        p5.min(p5.max(rowOffset + dRow + row, 0), room.rows - 1) - row;
      colOffset =
        p5.min(p5.max(colOffset + dCol + col, 0), room.cols - 1) - col;
    }
    targetXOffset = colOffset * p5.width;
    targetYOffset = rowOffset * p5.height;
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
}
