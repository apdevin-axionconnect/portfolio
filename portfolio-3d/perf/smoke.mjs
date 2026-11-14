// Deployment gate: serves the production build and walks the whole stack once.
// room -> click monitor -> log in to macOS -> open every app -> Dev Quest game loads -> back to room
// -> whiteboard: draw and save -> phone: unlock Android and open every app.
// Fails (exit 1) on any page error, console error, failed/4xx request, unexpected third-party request, or app crash.
//   npm run build && npm run smoke
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, '..', '..', 'pixel-quest-portfolio', 'package.json')); // playwright lives in the sibling project
const { chromium } = require('playwright');

const server = await preview({ root: path.join(here, '..'), preview: { port: 4310 }, logLevel: 'silent' });
const url = server.resolvedUrls.local[0];
const origin = new URL(url).origin;
const ALLOWED_THIRD_PARTY = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//; // macOS UI font; falls back to system fonts if blocked

const browser = await chromium.launch({ ...(process.env.CHROME ? { executablePath: process.env.CHROME } : { channel: 'chrome' }), args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const problems = [], warnings = [];
page.on('pageerror', (e) => problems.push('page error: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') problems.push('console error: ' + m.text().slice(0, 200)); });
page.on('requestfailed', (r) => {
  if (/resume\.pdf$/.test(r.url())) warnings.push('resume.pdf is missing: add macos-portfolio/public/resume.pdf (Preview shows "PDF not added yet" until then)');
  else if (!/\/sw\.js$/.test(r.url())) problems.push(`request failed: ${r.url()} ${r.failure()?.errorText}`);
});
page.on('response', (r) => { if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`); });
page.on('request', (r) => { const u = r.url(); if (/^https?:/.test(u) && !u.startsWith(origin) && !ALLOWED_THIRD_PARTY.test(u)) problems.push('unexpected third-party request: ' + u); });

const step = (name) => console.log('  ok', name);
try {
  await page.goto(url);
  await page.waitForSelector('canvas', { timeout: 60000 });
  await page.locator('#loader.done').waitFor({ state: 'attached', timeout: 180000 }); // shaders compiled, room revealed
  await page.waitForResponse((r) => /room\.glb/.test(r.url()) && r.ok(), { timeout: 60000 }).catch(() => {}); // may already be done
  step('3D page and room model load');

  const os = page.frameLocator('iframe.screen');
  await os.locator('.menubar').waitFor({ timeout: 60000 });
  step('macOS is running on the monitor');

  const box = await page.locator('iframe.screen').boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.locator('.back').waitFor({ timeout: 30000 });
  await os.locator('.dock').waitFor({ timeout: 30000 });
  assert.equal(await os.locator('.login').count(), 0, 'embedded macOS must not ask for a password');
  step('click monitor: desktop is ready, no login');

  const apps = ['Finder', 'Safari', 'Notes', 'Terminal', 'Mail', 'Photos', 'Preview', 'Calculator', 'Music', 'Arcade', 'ChatGPT', 'System Settings', 'Dev Quest'];
  for (const app of apps) {
    const n = await os.locator('.window').count();
    await os.locator(`.dock .di:has(.tip:text-is("${app}"))`).evaluate((el) => el.click());
    await os.locator('.window').nth(n).waitFor({ timeout: 30000 });
    await os.locator('.window').nth(n).locator('.window-body > *').first().waitFor({ timeout: 30000 }); // lazy chunk arrived and rendered
  }
  assert.equal(await os.locator('text=This app crashed').count(), 0, 'an app hit its error boundary');
  step(`all ${apps.length} apps open without crashing`);

  const game = os.frameLocator('iframe.quest');
  await game.locator('canvas').first().waitFor({ timeout: 60000 });
  assert.match(await game.locator('title').first().evaluate((t) => t.textContent), /Dev Quest/);
  step('Dev Quest game runs inside macOS');

  await page.locator('.back').click();
  await page.locator('.hint').waitFor({ timeout: 30000 });
  step('back to room');

  // whiteboard: go there, draw a stroke, confirm it was saved
  await page.locator('.hint button', { hasText: 'Whiteboard' }).click();
  await page.locator('.board-tools').waitFor({ timeout: 30000 });
  await page.waitForTimeout(4000); // camera glide
  await page.evaluate(() => localStorage.removeItem('room:whiteboard'));
  const { width, height } = page.viewportSize();
  await page.mouse.move(width * 0.4, height * 0.45); await page.mouse.down();
  await page.mouse.move(width * 0.6, height * 0.5, { steps: 8 }); await page.mouse.up();
  await page.waitForFunction(() => (localStorage.getItem('room:whiteboard') || '').length > 1000, null, { timeout: 15000 });
  await page.locator('.board-tools button', { hasText: 'Clear' }).click();
  step('whiteboard: draw, save, clear');
  await page.locator('.back').click();
  await page.locator('.hint').waitFor({ timeout: 30000 });

  // phone: unlock Android, open every app on the home screen
  await page.locator('.hint button', { hasText: 'Phone' }).click();
  await page.locator('.back').waitFor({ timeout: 30000 });
  await page.locator('.a-lock').evaluate((el) => el.click());
  const icons = await page.locator('.a-home .a-icon').count();
  for (let i = 0; i < icons; i++) {
    await page.locator('.a-home .a-icon').nth(i).evaluate((el) => el.click());
    await page.locator('.a-app .a-body > *').first().waitFor({ timeout: 15000 });
    await page.locator('.a-nav').evaluate((el) => el.click());
    await page.locator('.a-app').waitFor({ state: 'detached', timeout: 15000 });
  }
  assert.ok(icons >= 9, `expected the phone's app icons, found ${icons}`);
  step(`phone: Android unlocks and all ${icons} app icons open`);
  await page.locator('.back').click();
  await page.locator('.hint').waitFor({ timeout: 30000 });

  await page.waitForTimeout(1500);
  assert.deepEqual(problems, [], 'runtime problems were reported');
  for (const w of new Set(warnings)) console.log('  WARNING', w);
  console.log('SMOKE PASSED');
} catch (e) {
  console.error('SMOKE FAILED:', e.message);
  for (const p of problems) console.error('  -', p);
  process.exitCode = 1;
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}
