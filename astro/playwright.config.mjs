import { defineConfig, devices } from '@playwright/test';

// 只测生产产物：先 npm run build，再由 webServer 启动 astro preview。
// test:prod 会注入 PREVIEW_PORT/FORCE_PREVIEW，避免与 4321 的 dev server 混用。
const port = process.env.PREVIEW_PORT || '4321';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    navigationTimeout: 15_000,
  },
  webServer: {
    command: `npm exec astro preview -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI && !process.env.FORCE_PREVIEW,
    timeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
