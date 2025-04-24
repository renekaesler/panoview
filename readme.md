# Panoview

Panoview is a lightweight panorama viewer built entirely with WebGL — small footprint, no bloat. Embed panoramic scenes into your website without relying on bulky 3D libraries.

<p align="center">
  <img alt="Panorama Demo" style="object-fit:cover" src="./.readme/panoview.gif">
</p>

<p align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">View Demo</a>
</p>


## ⚙️ Installation


## via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/panoview@0.0.0/dist/panoview.min.js" crossorigin="anonymous"></script>
```


### via NPM

Install the Package:

```bash
npm i panoview
```

WebComponents Registration:

```js
import "panoview/registered";
```


## 🚀 Usage

Panoview provides two WebComponents out of the box:

```html
<!-- displaying equirectangular images -->
<pano-img src="/equirectangular-image.jpg"></pano-img>

<!-- displaying equirectangular images -->
 <pano-video src="/equirectangular-video.mp4"></pano-video>
```

**HINT**: Due to Safari having issues with autoplaying videos, the video might not be displayed on ios devices.


### Advanced Usage

You may want to customize how the components are registered:

```js
import { PanoImg, PanoVideo } from "./panoview.js";

customElements.define("pano-img", PanoImg);
customElements.define("pano-video", PanoVideo);
```

Or you may want to use the renderer without the use of WebComponents:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Panoview</title>
  </head>
  <body>
    <canvas></canvas>

    <script type="module">
      import { Viewer } from "./node_modules/panoview.js";

      const canvas = document.querySelector('canvas');
      const viewer = new Viewer(canvas);

      function loadImage() {
        const image = new Image()
        image.src = '/equirectangular.jpg';
        image.onload = () => {
          viewer.show(image);
        }
      }

      loadImage();
      canvas.addEventListener("webglcontextrestored", loadImage, false);
    </script>
  </body>
</html>
```




