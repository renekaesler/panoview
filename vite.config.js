import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

import copy from 'rollup-plugin-copy'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/panoview/',
  build: {
    minify: true,
  },
  plugins: [
    copy({
      targets: [
        { src: 'examples', dest: 'dist' },
        { src: 'assets/**/*', dest: 'dist/assets' }
      ],
      hook: 'writeBundle',
    })
  ]
});