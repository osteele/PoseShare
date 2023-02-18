export type Performer = {
  id: string;
  name: string;
  connected: boolean;
  hue: number;
  isLocal: boolean;
  isSelf: boolean;
  pose: Posenet.Pose;
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

export type P5 = {
  background(c: P5.Color | number, g?: number, b?: number): void;
  beginShape(): void;
  circle(x: number, y: number, r: number): void;
  color: (r: number, g?: number, b?: number, a?: number) => any;
  colorMode(mode: string, max?: number): void;
  createCanvas(w: number, h: number, mode: string): P5.Canvas;
  createCapture(type: string, callback: () => void): P5.Video;
  createDiv(content: string): P5.Element;
  createSelect(): P5.Element;
  curveVertex(x: number, y: number): void;
  endShape(e: number): void;
  fill(c: P5.Color): void;
  lerp(a: number, b: number, amt: number): number;
  loadShader(
    vertFilename: string,
    fragFilename: string,
    callback?: (shader: P5.Shader) => void,
    errorCallback?: (err: any) => void
  ): P5.Shader;
  lerpColor(c1: P5.Color, c2: P5.Color, amt: number): P5.Color;
  line(x1: number, y1: number, x2: number, y2: number): void;
  map(
    n: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number
  ): number;
  millis(): number;
  abs(a: number): number;
  max(a: number, b: number): number;
  min(a: number, b: number): number;
  noFill(): void;
  noStroke(): void;
  pop(): void;
  push(): void;
  quad(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
  ): void;
  random(min: number, max: number): number;
  select(selector: string): any;
  shader(shader: P5.Shader): void;
  stroke(c: any): void;
  strokeWeight(w: number): void;
  translate(x: number, y: number): void;
  scale(x: number, y: number): void;
  image(img: any, x: number, y: number, w?: number, h?: number): void;
  vertex(x: number, y: number): void;
  CLOSE: number;
  LEFT_ARROW: number;
  RIGHT_ARROW: number;
  UP_ARROW: number;
  DOWN_ARROW: number;
  HSB: string;
  WEBGL: string;
  P2D: string;
  VIDEO: string;
  drawingContext: CanvasRenderingContext2D;
  key: string;
  keyCode: number;
  mouseX: number;
  mouseY: number;
  width: number;
  height: number;
  useWebGL: boolean;
};

export namespace P5 {
  export type Color = {};
  export type Canvas = {
    parent(selector: string): void;
  };
  export type Element = {
    changed(callback: () => void): Element;
    class(className: string): Element;
    mouseMoved(callback: () => void): Element;
    option(name: string, value?: string): Element;
    parent(selector: string): Element;
    selected(value: string): Element;
    value(): string;
    elt: HTMLElement;
  };
  export type Shader = {
    setUniform(name: string, value: any): Shader;
  };
  export type Video = {
    size(w: number, h: number): void;
    parent(selector: string): void;
    hide(): void;
    addClass(className: string): void;
    removeClass(className: string): void;
    elt: HTMLVideoElement;
    width: number;
    height: number;
  };
}
