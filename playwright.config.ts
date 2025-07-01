import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Read from default `.env` file.
dotenv.config({ path: '.env.local' });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  timeout: 60 * 1000, // Increased default test timeout to 60 seconds
  expect: {
    timeout: 10 * 1000, // Timeout for expect() assertions (optional, defaults to 5s)
  },
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', // Adjusted to match webServer
    trace: 'on-first-retry',
    // Collect screenshots, videos, and other artifacts on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000', // Adjusted to port 3000
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // Adding a longer timeout for server start
    stdout: 'pipe', // Pipe stdout to help debug server start
    stderr: 'pipe', // Pipe stderr
  },
});