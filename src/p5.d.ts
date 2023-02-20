/* The type declarations in @types/p5 are incomplete. This file adds the missing
 * declarations. */

declare module "p5" {
  export default class p5 {
    constructor(f: (instance: p5) => void);

    //Environment
    width: number;
    height: number;
    // Creating & Reading
    color: (r: number, g?: number, b?: number, a?: number) => any;
    lerpColor(c1: p5.Color, c2: p5.Color, amt: number): p5.Color;
    // Setting
    background(c: p5.Color | number, g?: number, b?: number): void;
    colorMode(mode: string, max?: number): void;
    fill(c: p5.Color): void;
    noFill(): void;
    noStroke(): void;

    // Shape
    // 2D Primitive
    circle(x: number, y: number, r: number): void;
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
    line(x1: number, y1: number, x2: number, y2: number): void;
    // Attributes
    stroke(c: any): void;
    strokeWeight(w: number): void;
    // Vertex
    beginShape(): void;
    curveVertex(x: number, y: number): void;
    endShape(mode?: string): void;
    vertex(x: number, y: number): void;

    // Structure
    push(): void;
    pop(): void;

    // DOM
    select(selector: string): any;
    createDiv(content: string): p5.Element;
    createSelect(): p5.Element;
    createCapture(type: string, callback: () => void): p5.Video;

    // Rendering
    createCanvas(w: number, h: number, mode: string): p5.Canvas;

    // Transform
    translate(x: number, y: number): void;
    scale(x: number, y: number): void;

    // Image
    // Loading & Displaying Pixels
    image(img: any, x: number, y: number, w?: number, h?: number): void;

    // IO
    // Time & Date
    millis(): number;

    // Math
    // Calculation
    abs(a: number): number;
    map(
      n: number,
      start1: number,
      stop1: number,
      start2: number,
      stop2: number
    ): number;
    max(a: number, b: number): number;
    min(a: number, b: number): number;
    lerp(a: number, b: number, amt: number): number;
    // Random
    random(min: number, max: number): number;

    // 3D
    loadShader(
      vertFilename: string,
      fragFilename: string,
      callback?: (shader: p5.Shader) => void,
      errorCallback?: (err: any) => void
    ): p5.Shader;
    shader(shader: p5.Shader): void;

    // Constants
    CLOSE: string;
    LEFT_ARROW: number;
    RIGHT_ARROW: number;
    UP_ARROW: number;
    DOWN_ARROW: number;
    HSB: string;
    WEBGL: string;
    P2D: string;
    VIDEO: string;

    // Properties
    drawingContext: CanvasRenderingContext2D;
    key: string;
    keyCode: number;
    mouseX: number;
    mouseY: number;
    useWebGL: boolean;
  }

  global {
    namespace p5 {
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
  }
}
