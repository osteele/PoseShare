import p5 from "p5";
import { initializeBlazePose } from "./blazePose";
import { cameraReadyPromise, initializeWebcam, video } from "./camera";
import { drawPerson } from "./drawPose";
import { updateGallery } from "./gallery";
import { preloadMetaballs } from "./metaballs";
import { getOwnRecord, getPerformers } from "./performers";
import {
  movePoseInDirection,
  setOffset,
  targetXOffset,
  targetYOffset,
  xOffset,
  yOffset,
} from "./pose";
import { initializePosenet } from "./posenet";
import { settings } from "./settings";
import { connectWebsocket } from "./socket";

new p5((sk) => {
  const sketch = {
    preload() {
      preloadMetaballs(sk);
    },

    setup() {
      // The webcam is initialized to this
      const canvas = sk.createCanvas(
        settings.width,
        settings.height,
        settings.useWebGL ? sk.WEBGL : sk.P2D
      );
      // Move the canvas HTML element inside the container element. This posiitons
      // the canavs at the same x and y location as the video element.
      canvas.parent("sketch-container");
      sk.colorMode(sk.HSB);

      // This calls createVideo(CAMERA). It also creates a Promise that resolves
      // when the video is ready.
      initializeWebcam(sk);

      connectWebsocket();
      // createPartnerSelector();
      // cameraReadyPromise.then(() => initializePosenet(sk));
      cameraReadyPromise.then(() => initializeBlazePose(video));
    },

    draw() {
      // Fade out the previous canvas pixels towards transparency.
      // This leaves a ghostly trail.
      sk.push();
      sk.drawingContext.globalCompositeOperation = "destination-out";
      sk.background(0, 1 / (1 + 2 * settings.trail));
      sk.pop();

      setOffset(
        sk.lerp(xOffset, targetXOffset, 0.1),
        sk.lerp(yOffset, targetYOffset, 0.1)
      );

      // Draw the video onto the canvas. This is incompatible with the fading
      // functionality above; if it is disabled, the video is displayed in the
      // <video> HTML element, instead of being drawn onto each frame of the canvas.
      if (settings.drawVideoOnCanvas) {
        sk.push();
        if (settings.mirrorVideo) {
          sk.translate(video.width, 0);
          sk.scale(-1, 1);
        }
        sk.image(video, 0, 0);
        sk.pop();
      }

      drawScene(sk);
      updateGallery(sk);
    },

    keyPressed() {
      const mappedKeyCode =
        {
          W: sk.UP_ARROW,
          A: sk.LEFT_ARROW,
          S: sk.DOWN_ARROW,
          D: sk.RIGHT_ARROW,
        }[sk.key.toUpperCase()] || sk.keyCode;
      movePoseInDirection(sk, mappedKeyCode);
    },
  };
  Object.entries(sketch).forEach(([key, value]) => {
    sk[key] = value;
  });
});

// Does not draw the background. draw() does that before it calls this function.
function drawScene(sk) {
  const performers = getPerformers({ includeSelf: settings.showSelf });
  const self = getOwnRecord();
  for (const person of performers) {
    sk.push();
    if (self && self.row >= 0 && person.row >= 0) {
      // translate the canvas by the displacement between the performer's home
      // position (person.row, person.col) and the position assigned to this
      // client's performer (self.row, self.col).
      sk.translate(
        sk.width * (person.col - self.col),
        sk.height * (person.row - self.row)
      );
    }
    drawPerson(sk, person, settings.outlineSelf && person.isSelf);
    sk.pop();
  }
}