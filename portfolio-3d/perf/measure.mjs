// Latency harness. Serves the production build (dist/) like a real static host (gzip, cold cache, throttled network)
// and records load + interaction metrics.
//   node perf/measure.mjs <label>      -> writes perf/<label>.json   (run `npm run build` first)
//   node perf/measure.mjs compare a b  -> prints a before/after table
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, '..', 'dist');
const [, , cmd = 'run', a, b] = process.argv;

if (cmd === 'compare') {
  const A = JSON.parse(fs.readFileSync(path.join(here, a + '.json'))), B = JSON.parse(fs.readFileSync(path.join(here, b + '.json')));
  const lowerIsBetter = (k) => !/fps/.test(k);
  console.log(`${'metric'.padEnd(34)} ${a.padStart(10)} ${b.padStart(10)}   change`);
  for (const k of Object.keys(A)) {
    if (typeof A[k] !== 'number' || typeof B[k] !== 'number') continue;
    const d = A[k] ? ((B[k] - A[k]) / A[k]) * 100 : 0;
    const good = lowerIsBetter(k) ? d < -1 : d > 1, bad = lowerIsBetter(k) ? d > 1 : d < -1;
    console.log(`${k.padEnd(34)} ${String(A[k]).padStart(10)} ${String(B[k]).padStart(10)}   ${d >= 0 ? '+' : ''}${d.toFixed(0)}% ${good ? 'better' : bad ? 'WORSE' : ''}`);
  }
  process.exit(0);
}
const label = cmd === 'run' ? 'result' : cmd;

// ── static server: gzip for text types, like Netlify / Vercel / nginx defaults ──
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.glb': 'model/gltf-binary', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.wasm': 'application/wasm' };
const gz = new Map();
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(dist, p);
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  const ext = path.extname(file), type = TYPES[ext] || 'application/octet-stream';
  let body = fs.readFileSync(file);
  const headers = { 'Content-Type': type };
  if (/text|javascript|json|svg/.test(type)) { if (!gz.has(file)) gz.set(file, zlib.gzipSync(body)); body = gz.get(file); headers['Content-Encoding'] = 'gzip'; }
  res.writeHead(200, headers); res.end(body);
});
await new Promise((r) => server.listen(0, r));
const url = `http://localhost:${server.address().port}/`;

// ── build size ──
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(dist);
const kb = (n) => Math.round(n / 1024);
const out = { dist_total_kb: kb(files.reduce((s, f) => s + fs.statSync(f).size, 0)) };

// ── browser ──
const require = createRequire(path.join(here, '..', '..', 'pixel-quest-portfolio', 'package.json')); // playwright lives in the sibling project
const { chromium } = require('playwright');
// Uses the installed Chrome (same as the game's e2e suite); set CHROME=/path/to/chrome to override.
const browser = await chromium.launch({ ...(process.env.CHROME ? { executablePath: process.env.CHROME } : { channel: 'chrome' }), args: [...(process.env.GL === 'hw' ? ['--use-angle=d3d11', '--enable-gpu'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']), '--ignore-gpu-blocklist', '--headless=new'] });
// GL=hw uses the real GPU: needed for the render-loop metrics. Default is software GL (works anywhere, e.g. CI) for load metrics.
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
// count WebGL draw calls: the honest measure of how hard the 3D scene works (rAF rate is meaningless in headless software GL)
await page.addInitScript(() => { window.__draws = 0; for (const C of [WebGL2RenderingContext, WebGLRenderingContext]) for (const m of ['drawElements', 'drawArrays']) { const o = C.prototype[m]; C.prototype[m] = function (...a) { window.__draws++; return o.apply(this, a); }; } });
const cdp = await page.context().newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
// "fast 4G / average broadband": 10 Mbit down, 40 ms RTT
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 });

let t0 = 0, bytes = 0, reqs = 0, lastFinish = 0;
const urls = new Map(), done = {};
cdp.on('Network.requestWillBeSent', (e) => urls.set(e.requestId, e.request.url));
cdp.on('Network.loadingFinished', (e) => {
  bytes += e.encodedDataLength; reqs++; lastFinish = Date.now() - t0;
  const u = urls.get(e.requestId) || '';
  if (/room.*\.glb/.test(u)) done.room = Date.now() - t0;
});

t0 = Date.now();
await page.goto(url, { waitUntil: 'domcontentloaded' });
out.dom_content_loaded_ms = Date.now() - t0;
const os = page.frameLocator('iframe.screen');
await os.locator('.boot, .login, .menubar').first().waitFor({ timeout: 120000 });
out.os_screen_visible_ms = Date.now() - t0;
await page.waitForFunction(() => document.querySelector('canvas'), null, { timeout: 120000 });
await page.locator('#loader.done').waitFor({ state: 'attached', timeout: 180000 });
out.room_ready_ms = Date.now() - t0;
for (let i = 0; i < 240 && !done.room; i++) await page.waitForTimeout(250);
out.room_model_loaded_ms = done.room ?? -1;
await page.waitForTimeout(3000); // let trailing requests settle
out.first_paint_ms = Math.round(await page.evaluate(() => performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? -1));
out.cold_load_requests = reqs;
out.cold_load_transfer_kb = kb(bytes);
out.network_idle_ms = lastFinish;

const fps = () => page.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 4000) requestAnimationFrame(f); else r(Math.round((n / 4) * 10) / 10); }; requestAnimationFrame(f); }));
const draws = async () => { const a = await page.evaluate(() => window.__draws); await page.waitForTimeout(6000); return Math.round(((await page.evaluate(() => window.__draws)) - a) / 6); };
await page.waitForTimeout(6000); // let lazy chunks and shader compiles finish
out.gpu_draw_calls_per_sec_room_idle = await draws();
if (process.env.GL === 'hw') out.raf_fps_room_idle = await fps();

// sit at the desk, log in, then time how long app windows take to appear after a dock click
const box = await page.locator('iframe.screen').boundingBox();
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
await page.locator('.back').waitFor({ timeout: 60000 });
await page.waitForTimeout(6000); // camera glide (slow under software GL)
// focus + DOM clicks: the screen sits in a 3D transform, so pointer "stability" checks are unreliable here
await os.locator('.dock').waitFor({ timeout: 60000 });
await page.waitForTimeout(9000); // glide has fully settled
out.gpu_draw_calls_per_sec_desk_idle = await draws();
if (process.env.GL === 'hw') out.raf_fps_desk_idle = await fps();
const lat = [];
for (const app of ['Notes', 'Terminal', 'Mail', 'Photos']) {
  const n = await os.locator('.window').count();
  const s = Date.now();
  await os.locator(`.dock .di:has(.tip:text-is("${app}"))`).evaluate((el) => el.click());
  await os.locator('.window').nth(n).waitFor({ timeout: 60000 });
  lat.push(Date.now() - s);
}
out.os_open_app_ms_median = lat.sort((x, y) => x - y)[Math.floor(lat.length / 2)];
out.os_open_app_ms_worst = lat[lat.length - 1];

await browser.close(); server.close();
fs.writeFileSync(path.join(here, label + '.json'), JSON.stringify(out, null, 2));
console.log(label, out);
