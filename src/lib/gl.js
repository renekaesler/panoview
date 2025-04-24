export function createShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Shader Compiling Error: ${gl.getShaderInfoLog(shader)}`);
  }

  return shader;
}

export function createVertexShader(gl, source) {
  return createShader(gl, gl.VERTEX_SHADER, source);
}

export function createFragmentShader(gl, source) {
  return createShader(gl, gl.FRAGMENT_SHADER, source);
}

export function createProgram(gl, ...shaders) {
  const program = gl.createProgram();

  for (const shader of shaders) {
    gl.attachShader(
      program,
      typeof shader === "function" ? shader(gl) : shader
    );
  }

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program Linking Error: ${gl.getProgramInfoLog(program)}`);
  }

  gl.validateProgram(program);

  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    throw new Error(
      `Program Validation Error: ${gl.getProgramInfoLog(program)}`
    );
  }

  return program;
}

export function getLocations(gl, program) {
  const locations = {};

  const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

  for (let i = 0; i < numAttribs; ++i) {
    const info = gl.getActiveAttrib(program, i);
    locations[info.name] = gl.getAttribLocation(program, info.name);
  }

  for (let i = 0; i < numUniforms; ++i) {
    const info = gl.getActiveUniform(program, i);
    locations[info.name] = gl.getUniformLocation(program, info.name);
  }

  return locations;
}

export function createBuffer(gl, data, options) {
  const target = options?.target ?? gl.ARRAY_BUFFER;
  const usage = options?.usage ?? gl.STATIC_DRAW;
  const buffer = gl.createBuffer();

  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, usage);

  return buffer;
}

export const frag =
  (raw, ...values) =>
  (gl) => {
    const source = String.raw({ raw }, ...values);

    return createFragmentShader(gl, source);
  };

export const vert =
  (raw, ...values) =>
  (gl) => {
    const source = String.raw({ raw }, ...values);

    return createVertexShader(gl, source);
  };
