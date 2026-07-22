const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test('should log in successfully with valid credentials', async ({ page }) => {
    // Navigate to the login page
    await page.goto('https://app.idealtrendz.org/');

    // Fill in credentials from environment variables
    await page.getByRole('textbox', { name: /email|phone/i }).fill(process.env.TEST_EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(process.env.TEST_PASSWORD);

    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Assert successful login — dashboard should be visible
    await expect(page).toHaveURL(/app\.idealtrendz\.org/);
    await expect(
      page.getByText("Welcome back! Here's what's happening today.")
    ).toBeVisible();
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
  });
});
