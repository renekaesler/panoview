import {
  createBuffer,
  createProgram,
  getLocations,
  vert,
  frag,
} from "#lib/gl.js";

const numVertices = 36;
const vertexSize = 3;
const vertices = new Float32Array([
  -1.0,  1.0, -1.0,
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,
  -1.0,  1.0, -1.0,

  -1.0, -1.0,  1.0,
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
  -1.0, -1.0,  1.0,

   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0, -1.0,
   1.0, -1.0, -1.0,

  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,

  -1.0,  1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0,

  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
]);

const vertexShader = vert`
  attribute vec3 position;

  uniform mat4 projection;
  uniform mat4 view;

  varying vec3 _position;

  void main() {
    _position = position;
    gl_Position =  projection * view * vec4(_position, 1.0);
  }
`;

const fragmentShader = frag`
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  varying vec3 _position;

  uniform sampler2D eqrMap;

  const vec2 invAtan = vec2(0.1591, 0.3183);

  vec2 SampleSphericalMap(vec3 v) {
    vec2 uv = vec2(atan(v.z, v.x), asin(v.y));
    uv *= invAtan;
    uv += 0.5;
    return uv;
  }

  void main() {
    vec2 uv = SampleSphericalMap(normalize(_position));
    vec3 color = texture2D(eqrMap, uv).rgb;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function useEqrRendering(gl) {
  let program, location, texture;

  return {
    initialize() {
      program = createProgram(gl, vertexShader, fragmentShader);
      location = getLocations(gl, program);

      const buffer = createBuffer(gl, vertices);

      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.useProgram(program);
      gl.enableVertexAttribArray(location.position);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(location.position, vertexSize, gl.FLOAT, false, 0, 0);

      gl.uniform1i(location.eqrMap, 0);

      gl.clearColor(0.2, 0.2, 0.2, 1);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    },

    render(camera) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.uniformMatrix4fv(location.view, false, camera.view);
      gl.uniformMatrix4fv(location.projection, false, camera.projection);
      gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    },

    show(media) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, media);
    },
  };
}
