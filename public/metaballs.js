let metaballShader;

function preloadMetaballs() {
  metaballShader = loadShader('shaders/metaballs.vert', 'shaders/metaballs.frag');
}

function drawPoseMetaballs(pose) {
  shader(metaballShader);
  noStroke();

  metaballShader.setUniform('w', width)
  metaballShader.setUniform('h', height)

  setMetaballPoints(pose);
  metaballShader.setUniform('u_time', (millis() / 1000) * 1)
  // meta.setUniform('points', use_points)
  metaballShader.setUniform('mouseX', 0.2)
  metaballShader.setUniform('mouseY', 2.0)
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function setMetaballPoints(pose) {
  for (let keypoint of pose.keypoints) {
    if (keypoint.name == "nose") {
      metaballShader.setUniform('nose0', map((video.width - keypoint.x), 0, video.width, 0, 3))
      metaballShader.setUniform('nose1', map((keypoint.y), 0, video.height, 0, 3))
      // print(map((video.width - keypoint.x), 0, video.width, 0, 3));
      // print(map((keypoint.y), 0, video.height, 0, 3));

      // let nose=[];
      // nose[0]= map((video.width - keypoint.x), 0, video.width, 0, 3);
      // nose[1]=map((keypoint.y), 0, video.height, 0, 3);
      // use_points[0]=nose;
    }

    if (keypoint.name == "left_index") {
      metaballShader.setUniform('left_index0', map((video.width - keypoint.x), 0, video.width, 0, 3))
      metaballShader.setUniform('left_index1', map((keypoint.y), 0, video.height, 0, 3))

      // let left_index=[];
      // left_index[0]=map((video.width - keypoint.x), 0, video.width, 0, 3);
      // left_index[1]=map((keypoint.y), 0, video.height, 0, 3);
      // use_points[1]=left_index;
    }

    if (keypoint.name == "right_index") {
      metaballShader.setUniform('right_index0', map((video.width - keypoint.x), 0, video.width, 0, 3))
      metaballShader.setUniform('right_index1', map((keypoint.y), 0, video.height, 0, 3))

      // let right_index=[];
      // right_index[0]=map((video.width - keypoint.x), 0, video.width, 0, 3);
      // right_index[1]=map((keypoint.y), 0, video.height, 0, 3);
      // use_points[2]=right_index;
    }

    if (keypoint.name == "left_knee") {
      metaballShader.setUniform('left_knee0', map((video.width - keypoint.x), 0, video.width, 0, 3))
      metaballShader.setUniform('left_knee1', map((keypoint.y), 0, video.height, 0, 3))

      // let left_ankle=[];
      // left_ankle[0]=map((video.width - keypoint.x), 0, video.width, 0, 3);
      // left_ankle[1]=map((keypoint.y), 0, video.height, 0, 3);
      // use_points[3]=left_ankle;
    }

    if (keypoint.name == "right_knee") {
      metaballShader.setUniform('right_knee0', map((video.width - keypoint.x), 0, video.width, 0, 3))
      metaballShader.setUniform('right_knee1', map((keypoint.y), 0, video.height, 0, 3))

      // let right_ankle=[];
      // right_ankle[0]=map((video.width - keypoint.x), 0, video.width, 0, 3);
      // right_ankle[1]=map((keypoint.y), 0, video.height, 0, 3);
      // use_points[4]=right_ankle;
    }

    let right_hip = [];
    let left_hip = [];
    if (keypoint.name == "right_hip") {
      right_hip[0] = map((video.width - keypoint.x), 0, video.width, 0, 3);
      right_hip[1] = map((keypoint.y), 0, video.height, 0, 3);
    }
    if (keypoint.name == "left_hip") {
      left_hip[0] = map((video.width - keypoint.x), 0, video.width, 0, 3);
      left_hip[1] = map((keypoint.y), 0, video.height, 0, 3);
    }

    metaballShader.setUniform('hip0', map(((right_hip[0] + left_hip[0]) / 2), 0, video.width, 0, 3))
    metaballShader.setUniform('hip1', map(((right_hip[1] + left_hip[1]) / 2), 0, video.height, 0, 3))
    // let hip=[];
    // hip[0]=(right_hip[0]+left_hip[0])/2;
    // hip[1]=(right_hip[1]+left_hip[1])/2;
    // use_points[5]=hip;
  }
}
