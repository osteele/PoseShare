export type Performer = {
  col: number;
  connected: boolean;
  hue: number;
  id: string;
  isLocal: boolean;
  isSelf: boolean;
  name: string;
  pose: Posenet.Pose;
  position: number;
  row: number;
  timestamp: never;
};

export type Room = {
  isLocal: boolean;
  rows: number;
  cols: number;
  performers: Performer[];
  settings: {
    [key: string]: any;
  };
};

export namespace Posenet {
  export type PartName =
    | "nose"
    | "leftEye"
    | "rightEye"
    | "leftEar"
    | "rightEar"
    | "leftShoulder"
    | "rightShoulder"
    | "leftElbow"
    | "rightElbow"
    | "leftWrist"
    | "rightWrist"
    | "leftHip"
    | "rightHip"
    | "leftKnee"
    | "rightKnee"
    | "leftAnkle"
    | "rightAnkle";

  type Vector2D = {
    x: number;
    y: number;
  };

  export type Keypoint = {
    part: PartName;
    position: Vector2D;
    score: number;
  };

  export type Pose = {
    pose: {
      keypoints: Keypoint[];
      score: number;
    };
    skeleton: [Keypoint, Keypoint][];
  };
}

export namespace BlazePose {
  export type PartName =
    | "nose"
    | "left_eye_inner"
    | "left_eye"
    | "left_eye_outer"
    | "right_eye_inner"
    | "right_eye"
    | "right_eye_outer"
    | "left_ear"
    | "right_ear"
    | "mouth_left"
    | "mouth_right"
    | "left_shoulder"
    | "right_shoulder"
    | "left_elbow"
    | "right_elbow"
    | "left_wrist"
    | "right_wrist"
    | "left_pinky"
    | "right_pinky"
    | "left_indix"
    | "right_indix"
    | "left_thumb"
    | "right_thumb"
    | "left_hip"
    | "right_hip"
    | "left_knee"
    | "right_knee"
    | "left_ankle"
    | "right_ankle"
    | "left_heel"
    | "right_heel"
    | "left_foot_index"
    | "right_foot_index";

  export type Keypoint = {
    name: PartName;
    score: number;
    x: number;
    y: number;
    z: number;
  };

  export type Pose = {
    keypoints: Keypoint[];
    keypoints3D: Keypoint[];
    score: number;
  };
}
