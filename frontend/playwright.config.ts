import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for pharma-sales-inventory frontend e2e tests.
 * Run: pnpm test:e2e (or npm run test:e2e)
 * The Next.js app is started automatically via webServer unless PLAYWRIGHT_BASE_URL is set.
 * API/backend must be available for login and dashboard pages.
 * @see https://playwright.dev/docs/test-configuration
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  timeout: 60_000,
  expect: { timeout: 10_000 },
});
