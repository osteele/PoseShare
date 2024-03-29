import * as Base from "@common/base-types";

export type Performer = Base.Performer & {
  isLocal: boolean;
  isSelf: boolean;
  pose: BlazePose.Pose;
  timestamp: number; // This is a Date in the server
  previousPoses: BlazePose.Pose[];
  polishedPose: BlazePose.Pose;
  appearance: string; // if modifying this data structure, change it in "performers.ts" as well
};

export type Person = {
  id: string;
  name: string;
  connected: boolean;
  isSelf: boolean;
  hue?: number;
  appearance: string; // if modifying this data structure, change it in "performers.ts" as well
};

export type Room = Base.Room & {
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
