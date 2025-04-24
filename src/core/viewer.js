import CameraControls from "./camera-controls.js";
import Camera from "./camera.js";
import { useEqrRendering } from "./eqr-rendering.js";

export default class Viewer {
  #controls;
  #lastAnimationCall;
  #eqrRendering;
  #requestId;

  get contextLost() {
    return this.gl.isContextLost();
  }

  constructor(canvas) {
    this.camera = new Camera();
    this.#controls = new CameraControls(this.camera, canvas);

    this.gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    canvas.addEventListener("webglcontextlost", this.#onContextLost, false);
    canvas.addEventListener("webglcontextrestored", this.#onContextRestored, false);

    this.#eqrRendering = useEqrRendering(this.gl);
    this.#eqrRendering.initialize();

    this.#requestId = requestAnimationFrame(this.#onAnimationFrame);
  }

  dispose() {
    const { canvas } = this.gl;

    this.#controls.dispose();
    canvas.removeEventListener("webglcontextlost", this.#onContextLost);
    canvas.removeEventListener("webglcontextrestored", this.#onContextRestored);
  }

  show(media) {
    if (this.contextLost) return;

    this.#eqrRendering.show(media);
  }

  #resize() {
    const { canvas } = this.gl;
    const dpr = window.devicePixelRatio;
    const width = Math.round(canvas.clientWidth * dpr);
    const height = Math.round(canvas.clientHeight * dpr);

    if (canvas.width != width || canvas.height != height) {
      canvas.width = width;
      canvas.height = height;

      this.camera.aspect = canvas.width / canvas.height;
    }
  }

  #onAnimationFrame = (elapsed) => {
    const deltaT = elapsed - (this.#lastAnimationCall || elapsed);

    this.#resize();
    this.#controls.update({ deltaT });
    this.beforeRender?.({ deltaT });
    this.#eqrRendering.render(this.camera);

    this.#lastAnimationCall = elapsed;
    this.#requestId = requestAnimationFrame(this.#onAnimationFrame);
  };

  #onContextLost = (event) => {
    event.preventDefault();
    cancelAnimationFrame(this.#requestId);
  };

  #onContextRestored = () => {
    this.#eqrRendering.initialize();
    this.#requestId = requestAnimationFrame(this.#onAnimationFrame);
  };
}
