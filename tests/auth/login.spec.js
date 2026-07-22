const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://app.idealtrendz.org';
const LOGIN_URL = `${BASE_URL}/login`;

const VALID_EMAIL = process.env.TEST_EMAIL;
const VALID_PASSWORD = process.env.TEST_PASSWORD;

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto(LOGIN_URL);
    await expect(page.locator('#email')).toBeVisible();
  });

  test('successful login redirects to the dashboard', async ({ page }) => {
    // Fill in valid credentials and submit
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('button[type="submit"]').filter({ hasText: 'Login' }).click();

    // The app navigates to /evaDashboard after successful login
    await page.waitForURL('**/evaDashboard', { timeout: 15_000 });
    await expect(page).toHaveURL(/evaDashboard/);

    // Confirm the dashboard title is visible
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
  });
});
