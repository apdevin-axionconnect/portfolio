// Generates the 1200x630 social-preview images from the real site, so they always show what visitors get.
//   npm run build && npm run og && npm run build      (the second build copies the new images into dist)
// Writes portfolio-3d/public/og.png (the room) and macos-portfolio/public/og.png (the desktop).
import path from 'node:path';
import { withSite, root } from '../tests/helpers.mjs';

await withSite(async ({ url, browser }) => {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(url);
  await page.locator('#loader.done').waitFor({ state: 'attached', timeout: 180000 });
  await page.addStyleTag({ content: '.hint, .back { display: none !important; }' }); // the picture, not the controls
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(root, 'public', 'og.png'), timeout: 120000 });

  const os = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await os.addInitScript(() => sessionStorage.setItem('mp:booted', '1')); // skip boot + login for the picture
  await os.goto(url + 'os/index.html');
  await os.locator('.dock').waitFor();
  await os.locator('.dock .di', { has: os.locator('.tip', { hasText: /^Finder$/ }) }).click();
  await os.locator('.window').waitFor();
  await os.mouse.move(600, 250); // off the Dock, so no icon is magnified in the picture
  await os.addStyleTag({ content: '.notifs { display: none !important; }' });
  await os.waitForTimeout(1200);
  await os.screenshot({ path: path.join(root, '..', 'macos-portfolio', 'public', 'og.png') });
  console.log('wrote portfolio-3d/public/og.png and macos-portfolio/public/og.png');
}, { port: 4322 });
