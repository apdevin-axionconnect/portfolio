import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { shareMeta } from '../share-meta.mjs'

// https://vite.dev/config/
export default defineConfig({
  base: './', // relative URLs: deployable at a domain root or any subfolder (GitHub Pages, S3 prefix, ...)
  plugins: [react(), shareMeta({
    suffix: '3D portfolio',
    description: (p) => `${p.role} based in ${p.location}. ${p.tagline} Walk into the room and use the desktop, the whiteboard and the phone.`,
    imageAlt: 'A room at night with a desk, a monitor running a desktop, a whiteboard and a phone.',
  })],
  server: { fs: { allow: ['..'] } }, // the phone UI imports ../macos-portfolio/src/data/profile.js (one content file for everything)
  build: { chunkSizeWarningLimit: 1400 }, // the main chunk is three.js itself (~355 kB gzip); post-processing is already split out
})
