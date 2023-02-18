declare module "ml5" {
  function poseNet(
    video: { elt: HTMLVideoElement },
    options: object,
    callback: () => void
  ): PoseNet;

  export interface PoseNet {
    on(event: string, callback: (poses: Pose[]) => void): void;
  }

  // This doesn't use the types from @tensorflow-models/pose-detection
  // because it's Pose type doesn't include the skeleton.
  // TODO DRY w/ src/types.ts
  export interface Pose {
    pose: {
      keypoints: Keypoint[];
      score: number;
    };
    skeleton: [Keypoint, Keypoint][];
  }

  export interface Keypoint {
    score: number;
    part: string;
    position: {
      x: number;
      y: number;
    };
  }
}
