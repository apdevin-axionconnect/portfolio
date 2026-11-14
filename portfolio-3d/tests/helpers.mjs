// Shared setup for browser tests: serves the production build (dist/) and opens Chrome.
// Run after `npm run build`:  npm run e2e
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';

export const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, '..', 'pixel-quest-portfolio', 'package.json')); // playwright lives in the sibling project
const { chromium } = require('playwright');

export async function withSite(fn, { port = 4320 } = {}) {
  const server = await preview({ root, preview: { port }, logLevel: 'silent' });
  const browser = await chromium.launch({ ...(process.env.CHROME ? { executablePath: process.env.CHROME } : { channel: 'chrome' }), args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try { return await fn({ url: server.resolvedUrls.local[0], browser }); }
  finally { await browser.close(); await new Promise((r) => server.httpServer.close(r)); }
}
