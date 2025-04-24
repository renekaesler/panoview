import Viewer from "#core/viewer.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
  :host {
    display: inline-block;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }
`);

const template = document.createElement("template");
template.innerHTML = `<canvas></canvas> `;

export default class PanoVideo extends HTMLElement {
  static observedAttributes = ["src"];

  get src() {
    return this.getAttribute("src");
  }

  set src(value) {
    this.setAttribute("src", value);
  }

  constructor() {
    super();

    this.video = document.createElement("video");
    this.video.muted = true;
    this.video.loop = true;
    this.video.playsInline = true;

    this.video.oncanplay = () => {
      this.video.play();
    };
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const tmpl = template.content.cloneNode(true);
    shadow.append(tmpl);

    const canvas = shadow.querySelector("canvas");
    this.viewer = new Viewer(canvas);

    this.viewer.beforeRender = () => {
      const { paused, readyState, HAVE_ENOUGH_DATA } = this.video;

      if (!paused && readyState === HAVE_ENOUGH_DATA) {
        this.viewer.show(this.video);
      }
    };
  }

  disconnectedCallback() {
    this.viewer.dispose();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "src":
        this.video.src = newValue;
        break;
    }
  }
}
