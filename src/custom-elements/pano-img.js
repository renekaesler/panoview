import Viewer from "../core/viewer.js";

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

export default class PanoImg extends HTMLElement {
  static define(name = 'pano-img') {
    customElements.define(name, PanoImg);
  }

  static observedAttributes = ["src"];

  get src() {
    return this.getAttribute("src");
  }

  set src(value) {
    this.setAttribute("src", value);
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const tmpl = template.content.cloneNode(true);
    shadow.append(tmpl);

    const canvas = shadow.querySelector("canvas");
    canvas.addEventListener("webglcontextrestored", this.#loadSrc, false);
    this.viewer = new Viewer(canvas);
  }

  disconnectedCallback() {
    const canvas = this.shadowRoot.querySelector("canvas");
    canvas.removeEventListener("webglcontextrestored", this.#loadSrc);

    this.viewer.dispose();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "src":
        this.#loadSrc();
        break;
    }
  }

  #loadSrc = () => {
    const image = new Image();
    image.src = this.src;
    image.onload = () => {
      this.viewer.show(image);
    };
  };
}
