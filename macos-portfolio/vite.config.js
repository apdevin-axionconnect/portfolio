import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { shareMeta } from '../share-meta.mjs';
export default defineConfig({
  plugins: [react(), shareMeta({
    suffix: 'portfolio desktop',
    description: (p) => `${p.role} based in ${p.location}. ${p.tagline} Projects, resume and contact, presented as a desktop you can use.`,
    imageAlt: 'A macOS-style desktop with a Finder window and a Dock of apps.',
    pathWhenEmbedded: 'os/',
  })],
});
