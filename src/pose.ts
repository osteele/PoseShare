import { getOwnRecord } from "./performers";
import { room } from "./room";
import { settings } from "./settings";
import { P5 } from "./types";

export let confidenceThreshold = 0.2;

export let xOffset = 0;
export let yOffset = 0;
export let targetXOffset = 0;
export let targetYOffset = 0;
let rowOffset = 0;
let colOffset = 0;

export function setOffset(x:number, y:number): void {
  xOffset = x;
  yOffset = y;
}

/** Move the pose in the given direction. */
export function movePoseInDirection(p5:P5, keyCode:number): void {
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
