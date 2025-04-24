import { defineConfig } from "vite";

export default defineConfig({
  base: '/panoview/',
  root: 'examples',
  build: {
    minify: true,
  }
});