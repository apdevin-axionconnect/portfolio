// Interaction smoothness on the real GPU: frames per second while the scene is actually being redrawn.
//   npm run build && npm run preview -- --port 5200      (in another terminal)
//   node perf/interact.mjs <label>          -> perf/<label>.json
//   node perf/measure.mjs compare a b       -> before/after table
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, '..', '..', 'pixel-quest-portfolio', 'package.json'));
const { chromium } = require('playwright');
const label = process.argv[2] || 'interact';

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--headless=new'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript(() => {
  // frame counter per document (the room and the OS iframe each get one) + WebGL draw-call counter
  window.__f = 0; const tick = () => { window.__f++; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  window.__d = 0; for (const m of ['drawElements', 'drawArrays']) { const o = WebGL2RenderingContext.prototype[m]; WebGL2RenderingContext.prototype[m] = function (...a) { window.__d++; return o.apply(this, a); }; }
});
await page.goto(process.env.URL || 'http://localhost:5200/');
await page.locator('#loader.done').waitFor({ state: 'attached', timeout: 180000 });
await page.waitForTimeout(3000);
const out = {};
// run `action` for about `ms`, return the frame rate the page achieved and draw calls per frame
const during = async (target, ms, action) => {
  const read = () => target.evaluate(() => [window.__f, window.__d, performance.now()]);
  const [f0, d0, t0] = await read(); await action(ms); const [f1, d1, t1] = await read();
  return { fps: Math.round(((f1 - f0) / (t1 - t0)) * 10000) / 10, draws: Math.round((d1 - d0) / Math.max(1, f1 - f0)) };
};
const sweep = (x0, y0, dx, dy) => async (ms) => { await page.mouse.move(x0, y0); await page.mouse.down(); const end = Date.now() + ms; let i = 0; while (Date.now() < end) { i++; await page.mouse.move(x0 + Math.sin(i / 14) * dx, y0 + Math.cos(i / 14) * dy); } await page.mouse.up(); };

let r = await during(page, 4000, sweep(640, 300, 260, 60));
out.fps_orbit = r.fps; out.draw_calls_per_frame_orbit = r.draws;

await page.locator('.hint button', { hasText: 'Whiteboard' }).click();
r = await during(page, 2500, (ms) => page.waitForTimeout(ms)); out.fps_glide = r.fps;
await page.waitForTimeout(5000);
r = await during(page, 4000, sweep(640, 330, 300, 120)); out.fps_whiteboard_draw = r.fps;
await page.locator('.board-tools button', { hasText: 'Clear' }).click();
await page.locator('.back').click(); await page.waitForTimeout(6000);

// macOS on the monitor: drag a window around and count the iframe's own frames
await page.locator('.hint button', { hasText: 'Monitor' }).click(); await page.waitForTimeout(7000);
const os = page.frameLocator('iframe.screen'), frame = page.frames().find((f) => /os\/index\.html/.test(f.url()));
if (await os.locator('.login input').count()) { await os.locator('.login input').focus(); await page.keyboard.type('x'); await page.keyboard.press('Enter'); }
await os.locator('.dock').waitFor(); await os.locator('.dock .di:has(.tip:text-is("Finder"))').evaluate((el) => el.click());
await os.locator('.window .titlebar').waitFor(); await page.waitForTimeout(1200);
const tb = await os.locator('.window .titlebar').boundingBox();
r = await during(frame, 4000, sweep(tb.x + tb.width / 2, tb.y + tb.height / 2, 160, 70)); out.fps_os_window_drag = r.fps;

await browser.close();
fs.writeFileSync(path.join(here, label + '.json'), JSON.stringify(out, null, 2));
console.log(label, out);
