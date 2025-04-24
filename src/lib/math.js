const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export function clamp(value, min = -Infinity, max = Infinity) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(from, to, t) {
  return (1 - t) * from + t * to;
}

export function expDecay(from, to, decay, t) {
  return to + (from - to) * Math.exp(-decay * t);
}

export function degToRad(deg) {
  return deg * DEG2RAD;
}

export function radToDeg(rad) {
  return rad * RAD2DEG;
}
