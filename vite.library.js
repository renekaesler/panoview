import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url';
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    minify: true,
    copyPublicDir: false,
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: resolve(__dirname, 'src/panoview-registered.js'),
      name: 'panoview',
      fileName: () => `panoview.min.js`,
      formats: ['iife'],
    }
  }
});