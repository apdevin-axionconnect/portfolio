// Work item 1.3: no login barrier when macOS runs on the room's monitor; standalone keeps boot and login.
import test from 'node:test';
import assert from 'node:assert/strict';
import { withSite } from './helpers.mjs';

test('in the room, the Dock is visible after clicking Monitor, without typing anything', () => withSite(async ({ url, browser }) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(url);
  await page.locator('#loader.done').waitFor({ state: 'attached', timeout: 180000 });
  await page.locator('.hint button', { hasText: 'Monitor' }).click();
  const os = page.frameLocator('iframe.screen');
  await os.locator('.dock').waitFor({ state: 'attached', timeout: 15000 }); // no keyboard input happened
  assert.equal(await os.locator('.login').count(), 0, 'login screen must not be shown when embedded');
}));

test('standalone, macOS still boots to the login screen', () => withSite(async ({ url, browser }) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(url + 'os/index.html');
  await page.locator('.boot, .login').first().waitFor({ timeout: 15000 });
  await page.locator('.login input').waitFor({ timeout: 15000 });
  assert.equal(await page.locator('.dock').count(), 0, 'desktop must stay behind the login screen when standalone');
}, { port: 4321 }));
