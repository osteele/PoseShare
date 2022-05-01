function initializeBlazePose() {
  let model = poseDetection.SupportedModels.BlazePose;
  let detectorConfig = {
    runtime: 'tfjs', // 'mediapipe', 'tfjs'
    modelType: 'full' // 'lite', 'full', 'heavy'
  };
  poseDetection.createDetector(model, detectorConfig).then(d => {
    detector = d;
    getPose();
  });

  function getPose() {
    detector.estimatePoses(video.elt).then(([pose]) => {
      if (pose) {
        // pose = smoothPose(pose);
        setOwnPose(pose);
      }
      getPose();
    })
  }
}
