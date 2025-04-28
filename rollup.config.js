import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/panoview.cdn.js',
  output: [
    {
      file: 'dist/panoview.min.js',
      format: 'iife',
      plugins: [terser()],
      sourcemap: true,
    },
    {
      file: 'dist/panoview.js',
      format: 'iife',
      sourcemap: true,
    },
  ],
  plugins: [nodeResolve()]
}