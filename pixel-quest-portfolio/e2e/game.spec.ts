import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('a full run collects every block and reaches the castle', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/');
  await expect(page.locator('#startBtn')).toBeVisible();
  await page.click('#startBtn');
  await expect(page.locator('#start')).toHaveCount(0);

  await page.click('#autoBtn'); // auto-run drives the hero and jumps over hazards
  const total = Number(await page.locator('#hudTotal').textContent());
  await expect(page.locator('#hudCoins')).toHaveText(String(total), { timeout: 55_000 });
  await expect(page.locator('#card h3')).toHaveText(/RUN COMPLETE/, { timeout: 15_000 });
  await expect(page.locator('#card .links a')).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('the run log is readable without playing and opens details from the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.click('#skipBtn');
  await expect(page.locator('#overview')).toBeVisible();
  await expect(page.locator('#overviewBody li')).toHaveCount(15);
  await page.locator('#overviewBody li').first().focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('#modal')).toBeVisible();
  await expect(page.locator('#modalTitle')).not.toBeEmpty();
  await page.keyboard.press('Escape');
  await expect(page.locator('#modal')).toBeHidden();
  await page.click('.tab[data-tab="about"]');
  await expect(page.locator('#aboutBody')).toContainText('Canvas for the scene');
});

test('title screen and run log have no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const title = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze(); // contrast is audited manually: text sits on a moving scene
  expect(title.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await page.click('#skipBtn');
  const log = await new AxeBuilder({ page }).include('#overview').analyze();
  expect(log.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
});

test('title screen matches the visual baseline', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1500); // sprites decoded, fonts loaded
  await expect(page).toHaveScreenshot('title.png', { mask: [page.locator('#game')], maxDiffPixelRatio: 0.02 });
});
