import { defineConfig } from '@playwright/test';
// Uses the locally installed Chrome (channel) so `npx playwright install` is not needed.
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:4188', channel: 'chrome', viewport: { width: 1280, height: 720 }, launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } },
  webServer: { command: 'npm run build && npm run preview -- --port 4188 --strictPort', url: 'http://localhost:4188', reuseExistingServer: true, timeout: 120_000 },
});
