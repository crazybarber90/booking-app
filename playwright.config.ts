import { defineConfig, devices } from '@playwright/test'

/**
 * E2E config. Testovi su u `/e2e`. Pre testova Playwright sam digne dev server
 * (`npm run dev`) i čeka da odgovori na :3000.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry', // trace (snimak koraka) samo kad test padne pa se reprodukuje
  },
  // Sam dižže dev server chromiumn
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
