const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/specs',
  use: {
    baseURL: 'https://kahootlite.vercel.app',
    headless: true,
  },
  reporter: [['@muuktest/amikoo-reporter']],
});
