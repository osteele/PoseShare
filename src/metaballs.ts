/**
 * This module contains the code for drawing the pose as metaballs.
 */

import p5 from "p5";
import { video } from "./camera";
import { confidenceThreshold } from "./poseOffset";
import { settings } from "./settings";
import { BlazePose } from "./types";

let metaballShader: p5.Shader;

export function preloadMetaballs(p5: p5) {
  metaballShader = p5.loadShader(
    "shaders/metaballs.vert",
    "shaders/metaballs.frag"
  );
}

export function drawPoseMetaballs(p5: p5, pose: BlazePose.Pose, hue: number) {
  p5.shader(metaballShader);
  p5.noStroke();

  metaballShader.setUniform("w", p5.width);
  metaballShader.setUniform("h", p5.height);
  metaballShader.setUniform("mouseX", p5.mouseX / p5.width);
  metaballShader.setUniform("mouseY", p5.mouseY / p5.height);
  metaballShader.setUniform("hue", hue / 360);
  metaballShader.setUniform("millis", p5.millis());
  metaballShader.setUniform("radius", settings.metaballRadius);

  const shaderProxy = {
    setUniform(name: string, value: number): p5.Shader {
      // console.info(`${name}: ${value}`);
      return metaballShader.setUniform(name, value);
    },
  };
  setMetaballPoints(p5, shaderProxy, pose);
  p5.quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function setMetaballPoints(p5: p5, shader: p5.Shader, pose: BlazePose.Pose) {
  let [xRangeMin, xRangeMax] = [2, 0];
  const [yRangeMin, yRangeMax] = [2, 0];
  if (settings.mirrorVideo) {
    [xRangeMin, xRangeMax] = [xRangeMax, xRangeMin];
  }
  let hip_x = 0,
    hip_y = 0,
    hip_score = 1;
  for (let keypoint of pose.keypoints) {
    if (
      keypoint.name?.match(
        /^nose|(left|right)(Shoulder|Elbow|Wrist|Hip|Knee|Ankle)$/
      )
    ) {
      if (keypoint.score >= confidenceThreshold) {
        shader.setUniform(
          `${keypoint.name}_x`,
          p5.map(keypoint.x, 0, video.width, xRangeMin, xRangeMax)
        );
        shader.setUniform(
          `${keypoint.name}_y`,
          p5.map(keypoint.y, 0, video.height, yRangeMin, yRangeMax)
        );
      } else {
        shader.setUniform(`${keypoint.name}_x`, -1);
        shader.setUniform(`${keypoint.name}_y`, -1);
      }
    } else if (keypoint.name?.match(/^(left|right)_hip/)) {
      hip_x += keypoint.x;
      hip_y += keypoint.y;
      hip_score = p5.min(hip_score, keypoint.score);
    }
  }
  if (hip_score >= confidenceThreshold) {
    shader.setUniform(
      "hip_x",
      p5.map(hip_x / 2, 0, video.width, xRangeMin, xRangeMax)
    );
    shader.setUniform(
      "hip_y",
      p5.map(hip_y / 2, 0, video.height, yRangeMin, yRangeMax)
    );
  } else {
    shader.setUniform("hip_x", -1);
    shader.setUniform("hip_y", -1);
  }
}
