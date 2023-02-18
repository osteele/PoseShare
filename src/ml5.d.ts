declare module "ml5" {
  import { Pose } from "@tensorflow-models/pose-detection";

  function poseNet(
    video: { elt: HTMLVideoElement },
    options: object,
    callback: () => void
  ): PoseNet;

  export interface PoseNet {
    on(event: string, callback: (poses: Pose[]) => void): void;
  }
}
