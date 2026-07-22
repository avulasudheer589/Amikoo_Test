const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test('should log in successfully with valid credentials', async ({ page }) => {
    // Navigate to the login page
    await page.goto('https://app.idealtrendz.org/');

    // Fill in email/phone field (type="text", placeholder matches the actual UI)
    await page.getByPlaceholder('Enter email or 10-digit phone number').fill(process.env.TEST_EMAIL);

    // Fill in password field
    await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);

    // Click the Sign in button
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Assert successful login — dashboard welcome message should be visible
    await expect(page).toHaveURL('https://app.idealtrendz.org/');
    await expect(
      page.getByText("Welcome back! Here's what's happening today.")
    ).toBeVisible();
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
  });
});
