import { vec2 } from "gl-matrix";

const SWIPE_TRESHOLD = 0.3;
const detectors = new WeakMap();

function centroid(contact) {
  const result = [0, 0];

  for (const event of contact) {
    result[0] += event.clientX;
    result[1] += event.clientY;
  }

  result[0] /= contact.length;
  result[1] /= contact.length;

  return result;
}

export class GestureDetector {
  #element;
  #pointerEvents = new Map();
  #velocity = [0, 0];
  #prevContact;

  constructor(element) {
    this.#element = element;

    this.#element.addEventListener("pointerdown", this.#onPointerDown);
    this.#element.addEventListener("pointerup", this.#onPointerUp);
    this.#element.addEventListener("pointercancel", this.#onPointerCancel);
    this.#element.addEventListener("wheel", this.#onWheel, { passive: true });
  }

  dispatch(type, detail) {
    const event = new CustomEvent(type, { detail });
    this.#element.dispatchEvent(event);
  }

  disconnect() {
    if (!this.#element) return;

    this.#element.removeEventListener("pointerdown", this.#onPointerDown);
    this.#element.removeEventListener("pointerup", this.#onPointerUp);
    this.#element.removeEventListener("pointercancel", this.#onPointerCancel);
    this.#element.removeEventListener("wheel", this.#onWheel);
  }

  sample = (ctx) => {
    const currContact = Array.from(this.#pointerEvents.values());

    if (this.#prevContact) {
      if (this.#prevContact.length === 2 && currContact.length === 2) {
        const [a0, a1] = currContact.map((g) => [g.clientX, g.clientY]);
        const [b0, b1] = this.#prevContact.map((g) => [g.clientX, g.clientY]);
        const scale = vec2.distance(a0, a1) / vec2.distance(b0, b1);

        this.dispatch("zoom", { scale, focal: centroid(currContact) });
      } else if (this.#prevContact.length === 1 && currContact.length === 1) {
        const translation = [0, 0];
        const a = centroid(this.#prevContact);
        const b = centroid(currContact);
        vec2.sub(translation, b, a);

        const now = Date.now();
        const deltaTime = now - ctx.lastCall;
        this.#velocity[0] = translation[0] / deltaTime;
        this.#velocity[1] = translation[1] / deltaTime;

        this.dispatch("pan", { translation, velocity: this.#velocity });
        ctx.lastCall = now;
      }
    }

    this.#prevContact = currContact;
  };

  #onPointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);

    if (!this.#pointerEvents.size) {
      this.intervalId = setInterval(this.sample, 16, { lastCall: Date.now() });
      this.#element.addEventListener("pointermove", this.#onPointerMove);
      this.#prevContact = undefined;
      this.#velocity = [0, 0];

      this.dispatch("contactstart");
    }

    this.#pointerEvents.set(e.pointerId, e);
  };

  #onPointerMove = (e) => {
    this.#pointerEvents.set(e.pointerId, e);
  };

  #onPointerUp = (e) => {
    this.#pointerEvents.delete(e.pointerId);

    if (!this.#pointerEvents.size) {
      clearInterval(this.intervalId);
      this.#element.removeEventListener("pointermove", this.#onPointerMove);

      if (vec2.len(this.#velocity) > SWIPE_TRESHOLD) {
        this.dispatch("swipe", { velocity: this.#velocity });
      }
    }
  };

  #onPointerCancel = (e) => {
    this.#pointerEvents.clear();
  };

  #onWheel = (e) => {
    this.dispatch("zoom", {
      scale: 1 - Math.sign(e.deltaY) * 0.1,
      focal: [e.clientX, e.clientY],
    });
  };
}

export function enableGestures(element) {
  if (detectors.has(element)) disableGestures(element);

  const detector = new GestureDetector(element);
  detectors.set(element, detector);

  return element;
}

export function disableGestures(element) {
  const detector = detectors.get(element);
  detector?.disconnect?.();
  detectors.delete(element);

  return element;
}
