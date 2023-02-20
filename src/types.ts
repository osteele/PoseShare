export type Performer = {
  id: string;
  name: string;
  connected: boolean;
  hue: number;
  isLocal: boolean;
  isSelf: boolean;
  pose: BlazePose.Pose;
  position: number;
  col: number;
  row: number;
  timestamp: number;
};

export type Person = {
  id: string;
  name: string;
  connected: boolean;
  isSelf: boolean;
  hue?: number;
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
    name?: PartName;
    score: number;
    x: number;
    y: number;
    z?: number;
  };

  export type Pose = {
    keypoints: Keypoint[];
    keypoints3D: Keypoint[];
    score: number;
  };
}
