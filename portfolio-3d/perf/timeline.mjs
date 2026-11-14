// Start-up timeline on the real GPU: loader painted, OS booted behind it, room revealed, and how long the page ever froze.
//   node perf/timeline.mjs [url]     (serve the build first: npm run preview -- --port 5200)
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'pixel-quest-portfolio', 'package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--headless=new'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const t0 = Date.now(), out = {};
await page.goto(process.argv[2] || 'http://localhost:5200/', { waitUntil: 'domcontentloaded' }); out.dom_ready_ms = Date.now() - t0;
await page.locator('#loader').waitFor(); out.loader_visible_ms = Date.now() - t0;
await page.frameLocator('iframe.screen').locator('.boot, .login, .menubar').first().waitFor({ state: 'attached', timeout: 120000 }); out.os_booted_in_background_ms = Date.now() - t0;
// worst main-thread stall while loading: is the page frozen, or just waiting?
let worst = 0; const poll = setInterval(async () => { const s = Date.now(); await page.evaluate(() => 0).catch(() => {}); worst = Math.max(worst, Date.now() - s); }, 250);
await page.locator('#loader.done').waitFor({ state: 'attached', timeout: 180000 }); out.room_ready_ms = Date.now() - t0;
clearInterval(poll); out.worst_stall_while_loading_ms = worst;
// responsive = the main thread answers within 100 ms again (shader compiles are over)
for (;;) { const s = Date.now(); await page.evaluate(() => new Promise((r) => setTimeout(r, 0))); if (Date.now() - s < 100) break; }
out.responsive_ms = Date.now() - t0;
console.log(JSON.stringify(out));
await browser.close();
