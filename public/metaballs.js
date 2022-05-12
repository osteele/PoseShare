let metaballShader;

function preloadMetaballs() {
  metaballShader = loadShader('shaders/metaballs.vert', 'shaders/metaballs.frag');
}

function drawPoseMetaballs(pose, hue) {
  shader(metaballShader);
  noStroke();

  metaballShader.setUniform('w', width)
  metaballShader.setUniform('h', height)
  metaballShader.setUniform('mouseX', mouseX / width);
  metaballShader.setUniform('mouseY', mouseY / height);
  metaballShader.setUniform('hue', hue / 360);
  metaballShader.setUniform('millis', millis());
  metaballShader.setUniform('radius', settings.metaballRadius);
  const shaderProxy = {
    setUniform(name, value) {
      // console.info(`${name}: ${value}`);
      metaballShader.setUniform(name, value);
    }
  }
  setMetaballPoints(shaderProxy, pose);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function setMetaballPoints(shader, pose) {
  let [xRangeMin, xRangeMax] = [2, 0];
  const [yRangeMin, yRangeMax] = [2, 0];
  if (settings.mirrorVideo) {
    [xRangeMin, xRangeMax] = [xRangeMax, xRangeMin];
  }
  let hip_x = 0, hip_y = 0, hip_score = 1;
  for (let keypoint of pose.keypoints) {
    if (keypoint.name.match(/^nose|(left|right)(Shoulder|Elbow|Wrist|Hip|Knee|Ankle)$/)) {
      if (keypoint.score >= confidenceThreshold) {
        shader.setUniform(`${keypoint.name}_x`, map(keypoint.x, 0, video.width, xRangeMin, xRangeMax));
        shader.setUniform(`${keypoint.name}_y`, map(keypoint.y, 0, video.height, yRangeMin, yRangeMax));
      } else {
        shader.setUniform(`${keypoint.name}_x`, -1);
        shader.setUniform(`${keypoint.name}_y`, -1);
      }
    } else if (keypoint.name.match(/^(left|right)_hip/)) {
      hip_x += keypoint.x;
      hip_y += keypoint.y;
      hip_score = min(hip_score, keypoint.score);
    }
  }
  if (hip_score >= confidenceThreshold) {
    shader.setUniform('hip_x', map(hip_x / 2, 0, video.width, xRangeMin, xRangeMax));
    shader.setUniform('hip_y', map(hip_y / 2, 0, video.height, yRangeMin, yRangeMax));
  } else {
    shader.setUniform('hip_x', -1);
    shader.setUniform('hip_y', -1);
  }
}
