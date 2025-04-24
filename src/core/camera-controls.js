import { vec2 } from "gl-matrix";

import { disableGestures, enableGestures } from "#lib/gesture-recognition.js";
import { clamp, expDecay } from "#lib/math.js";

const DECAY = 0.003;

export default class CameraControls {
  #camera;
  #element;
  #velocity = [0, 0];

  constructor(camera, element) {
    this.#camera = camera;
    this.#element = enableGestures(element);

    this.#element.addEventListener("contactstart", this.#onContactStart);
    this.#element.addEventListener("pan", this.#onPan);
    this.#element.addEventListener("swipe", this.#onSwipe);
    this.#element.addEventListener("zoom", this.#onZoom);
  }

  dispose() {
    disableGestures(this.#element);

    this.#element.removeEventListener("contactstart", this.#onContactStart);
    this.#element.removeEventListener("pan", this.#onPan);
    this.#element.removeEventListener("swipe", this.#onSwipe);
    this.#element.removeEventListener("zoom", this.#onZoom);
  }

  update({ deltaT }) {
    this.#camera.yaw -= deltaT * this.#velocity[0];
    this.#camera.pitch -= deltaT * this.#velocity[1];

    this.#velocity[0] = expDecay(this.#velocity[0], 0, DECAY, deltaT);
    this.#velocity[1] = expDecay(this.#velocity[1], 0, DECAY, deltaT);
  }

  #onContactStart = () => {
    vec2.set(this.#velocity, 0, 0);
  };

  #onPan = ({ currentTarget, detail: { translation } }) => {
    const { clientWidth, clientHeight } = currentTarget;

    this.#camera.yaw -= (translation[0] / clientWidth) * this.#camera.fovx;
    this.#camera.pitch -= (-translation[1] / clientHeight) * this.#camera.fovy;
  };

  #onSwipe = ({ currentTarget, detail: { velocity: v } }) => {
    const { clientWidth, clientHeight } = currentTarget;

    this.#velocity[0] = (v[0] / clientWidth) * this.#camera.fovx;
    this.#velocity[1] = (-v[1] / clientHeight) * this.#camera.fovy;
  };

  #onZoom = ({ currentTarget, detail: { scale, focal } }) => {
    const { clientWidth, clientHeight } = currentTarget;

    const o = [
      focal[0] / clientWidth,
      focal[1] / clientHeight
    ].map(v => (v - 0.5) * 2);

    let halfFov = [this.#camera.fovx / 2, this.#camera.fovy / 2];

    let a0 = [
      Math.atan(Math.tan(halfFov[0]) * o[0]),
      Math.atan(Math.tan(halfFov[1]) * o[1]),
    ];

    this.#camera.zoom = clamp(this.#camera.zoom * scale, 0.5, 5);

    halfFov = [this.#camera.fovx / 2, this.#camera.fovy / 2];

    let a1 = [
      Math.atan(Math.tan(halfFov[0]) * o[0]),
      Math.atan(Math.tan(halfFov[1]) * o[1]),
    ];

    this.#camera.yaw -= a1[0] - a0[0];
    this.#camera.pitch += a1[1] - a0[1];
  };
}
