// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only is accidentally left in source
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter — sends results to Amikoo dashboard
  reporter: [
    ['@muuktest/amikoo-reporter'],
    ['list'],
  ],

  use: {
    // Base URL of the application under test
    baseURL: 'https://app.idealtrendz.org',

    // Record video for every test (required by Amikoo)
    video: 'on',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Default viewport
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
