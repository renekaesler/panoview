import { mat4 } from "gl-matrix";

import { clamp, degToRad } from "../lib/math.js";

const { cos, sin, tan, atan } = Math;

const NEAR = 0;
const FAR = 2;
const MIN_PITCH = degToRad(-89);
const MAX_PITCH = degToRad(89);

export default class Camera {
  #pitch = 0;
  #fovy = degToRad(75);

  #view = mat4.create();
  #projection = mat4.create();

  aspect;
  yaw = degToRad(-90);
  zoom = 1;

  constructor(fovy = degToRad(75), aspect = 1) {
    this.#fovy = fovy;
    this.aspect = aspect;
  }

  get pitch() {
    return this.#pitch;
  }

  set pitch(value) {
    this.#pitch = clamp(value, MIN_PITCH, MAX_PITCH);
  }

  get fovx() {
    return 2 * atan(this.aspect * tan(0.5 * this.fovy));
  }

  get fovy() {
    return 2 * atan(tan(0.5 * this.#fovy) / this.zoom);
  }

  get projection() {
    return mat4.perspective(
      this.#projection,
      this.fovy,
      this.aspect,
      NEAR,
      FAR
    );
  }

  get view() {
    const eye = [0, 0, 0];
    const up = [0, 1, 0];
    const center = [
      cos(this.yaw) * cos(this.pitch),
      sin(this.pitch),
      sin(this.yaw) * cos(this.pitch),
    ];

    return mat4.lookAt(this.#view, eye, center, up);
  }
}
