import p5 from "p5";
import { initializeBlazePose } from "./blazePose";
import { initializeWebcam, video } from "./camera";
import { drawPose } from "./drawPose";
import { initializeGallery, updateGallery } from "./gallery";
import { preloadMetaballs } from "./metaballs";
import { getOwnRecord, getPerformers } from "./performers";
import {
  movePoseInDirection, updateOffset
} from "./poseOffset";
import { settings } from "./settings";
import { connectWebsocket } from "./socket";

// Create a new p5 instance. This uses the p5 constructor, which takes a
// function that is called with the p5 instance as an argument.
// See https://github.com/processing/p5.js/wiki/Global-and-instance-mode
new p5((sk: p5) => {
  const sketch = {
    preload() {
      preloadMetaballs(sk);
    },

    async setup() {
      const canvas = sk.createCanvas(
        settings.width,
        settings.height,
        settings.useWebGL ? sk.WEBGL : sk.P2D
      );
      // Move the canvas HTML element inside the container element. This
      // positions the canvas at the same x and y location as the video element.
      canvas.parent("sketch-container");
      sk.colorMode(sk.HSB);

      initializeGallery();
      connectWebsocket();

      // initializeWebcam calls createVideo(CAMERA). It returns a Promise that
      // resolves when the video stream is ready.
      await initializeWebcam(sk);
      document.body.classList.add("video-initialized");

      await initializeBlazePose(video.elt);
      document.body.classList.add("detector-initialized");
    },

    draw() {
      // Fade out the previous canvas pixels towards transparency.
      // This leaves a ghostly trail.
      sk.push();
      sk.drawingContext.globalCompositeOperation = "destination-out";
      sk.background(0, 1 / (1 + 2 * settings.trail));
      sk.pop();

      updateOffset();

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
      // Map WASD to arrow keys.
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

  // Copy the functions from the p5 instance into sketch.
  Object.entries(sketch).forEach(([key, value]) => {
    (sk as Record<string, any>)[key] = value;
  });
});

// Does not draw the background. draw() does that before it calls this function.
function drawScene(sk: p5) {
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
    drawPose(sk, person, settings.outlineSelf && person.isSelf);
    sk.pop();
  }
}
