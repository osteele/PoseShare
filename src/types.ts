import * as Messages from "@common/messages";

export type Performer = Messages.Performer & {
  isLocal: boolean;
  isSelf: boolean;
  pose: BlazePose.Pose;
  timestamp: number; // This is a Date in the server
  col: number;
  row: number;
  previousPoses: BlazePose.Pose[];
  polishedPose: BlazePose.Pose;
  appearance: String; // if modifying this data structure, also change it in "performers.ts"
};

export type Person = {
  id: string;
  name: string;
  connected: boolean;
  isSelf: boolean;
  hue?: number;
};

export type Room = Messages.Room & {
  performers: Performer[];
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
