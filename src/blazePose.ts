// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * This module contains the code for initializing and configuring the BlazePose
 * model.
 *
 * It also contains the code for emitting "pose" events.
 *
 * Usage:
 *   import { poseEmitter } from "./blazePose";
 *   poseEmitter.on("pose", (pose) => {
 *     // do something with the pose
 *  });
 */

import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl"; // Importing this registers the WebGL backend
import EventEmitter from "events";
import { partNames, smoothPose } from "./pose-utils";
import Stats from "stats-js"; // ignore error message

// ========== @mediapipe/tasks-vision ==========
import {
  PoseLandmarker,
  FilesetResolver,
  RunningMode,
  PoseLandmarkerResult,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { BlazePose } from "types";


const poseLandmarks : BlazePose.PartName[] = [
  "nose"
  , "left_eye_inner"
  , "left_eye"
  , "left_eye_outer"
  , "right_eye_inner"
  , "right_eye"
  , "right_eye_outer"
  , "left_ear"
  , "right_ear"
  , "mouth_left"
  , "mouth_right"
  , "left_shoulder"
  , "right_shoulder"
  , "left_elbow"
  , "right_elbow"
  , "left_wrist"
  , "right_wrist"
  , "left_pinky"
  , "right_pinky"
  , "left_indix"
  , "right_indix"
  , "left_thumb"
  , "right_thumb"
  , "left_hip"
  , "right_hip"
  , "left_knee"
  , "right_knee"
  , "left_ankle"
  , "right_ankle"
  , "left_heel"
  , "right_heel"
  , "left_foot_index"
  , "right_foot_index"
  ,
 ];

let poseLandmarker: PoseLandmarker | undefined = undefined;
let runningMode : RunningMode = "VIDEO";
let smoothPoses = true;

/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/

// for usage, see: https://github.com/mrdoob/stats.js
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

/** Emits the following events:
 *
 * ("pose", pose: Pose)
 *   pose is the (optionally, smoothed) pose, detected by the locally
 *   running BlazePose detector from the local webcam image.
 *   The loop inside of `initializeBlazePose` emits this event.
 *
 * ("translatedPose", pose: Pose)
 *   pose is local pose, translated according to the local pose offset.
 *   This event is emitted by `updatePersonPose` in `performers.ts`.
 */
export const poseEmitter = new EventEmitter();

/** Starts BlazePose.
 *
 * Configures and starts BlazePose. This function also starts an asynchronous
 * loop that continuously relays poses from the model to the poseEmitter,
 * which emits "pose" events.
 *
 * @param video The video element to stream to the model.
 * @returns A Promise that resolves once the model has loaded.
 */
export async function initializeBlazePose(
  video: HTMLVideoElement
): Promise<void> {
  // Before we can use PoseLandmarker class we must wait for it to finish
  // loading. Machine Learning models can be large and take a moment to
  // get everything needed to run.
  const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("../node_modules/@mediapipe/tasks-vision/wasm");
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task`,
        delegate: "GPU"
      },
      runningMode: runningMode,
      numPoses: 1
    });
  };
  await createPoseLandmarker();

  let loopIsRunning = false;
  let lastVideoTime = -1;
  video.addEventListener("loadeddata", () => {
    loopIsRunning = true;
    predictWebcam();
  });
  loopIsRunning = true;
  predictWebcam();
  return;

  async function predictWebcam() {
    // stats begin
    stats.begin();

    let pose : BlazePose.Pose = {
      keypoints: [],
      keypoints3D: [],
      score: 0.99,
    };

    let landmarks : NormalizedLandmark[] | undefined = undefined;

    try {
      let startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        if (poseLandmarker != undefined) {
          poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
            [landmarks] = result.landmarks;
            for (let i=0;i<landmarks.length;i++) {
              let landmark = landmarks[i];
              let kp : BlazePose.Keypoint = {
                score: 0.99,
                x: landmark.x * video.width,
                y: landmark.y * video.height,
                name: poseLandmarks[i],
              };
              pose.keypoints.push(kp);
            }
          });
        }
      }
    } catch (e) {
      console.error("error while estimating poses", e);
      loopIsRunning = false;
      return;
    }

    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      if (poseLandmarker != undefined) {
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
          [landmarks] = result.landmarks;
          for (let i=0;i<landmarks.length;i++) {
            let landmark = landmarks[i];
            let kp : BlazePose.Keypoint = {
              score: 0.99,
              x: landmark.x,
              y: landmark.y,
              name: poseLandmarks[i],
            };
            pose.keypoints.push(kp);
          }
        });
      }
    }    

    console.log(pose);
    poseEmitter.emit("pose", pose);
  
    // Call this function again to keep predicting when the browser is ready.
    if (loopIsRunning) {
      window.requestAnimationFrame(predictWebcam);
    }

    // stats end
    stats.end();
  }
  
}
