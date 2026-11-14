import { defineConfig } from 'vite';
import { resolve } from 'node:path';
// base './' so the built site works from any path (GitHub Pages, Netlify, a subfolder)
export default defineConfig({
  base: './',
  build: {
    rollupOptions: { input: { main: resolve(__dirname, 'index.html'), styleguide: resolve(__dirname, 'styleguide.html') } },
    chunkSizeWarningLimit: 600,
  },
});
