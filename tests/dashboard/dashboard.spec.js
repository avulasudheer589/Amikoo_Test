const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://app.idealtrendz.org';
const LOGIN_URL = `${BASE_URL}/login`;

const VALID_EMAIL = process.env.TEST_EMAIL;
const VALID_PASSWORD = process.env.TEST_PASSWORD;

// Helper to log in before each test
async function login(page) {
  await page.goto(LOGIN_URL);
  await page.locator('#email').fill(VALID_EMAIL);
  await page.locator('#password').fill(VALID_PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: 'Login' }).click();
  await page.waitForURL('**/evaDashboard', { timeout: 15_000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display the Dashboard Overview title', async ({ page }) => {
    // Confirm the main heading is visible after login
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
  });

  test('should display the three summary stat cards', async ({ page }) => {
    // Total Invoices, Closed Orders, and Customers cards should all be visible
    await expect(page.getByText('Total Invoices')).toBeVisible();
    await expect(page.getByText('Total Closed Orders')).toBeVisible();
    await expect(page.getByText('Total Customers')).toBeVisible();
  });

  test('should display the quick action cards', async ({ page }) => {
    // Three action cards should be visible on the dashboard
    await expect(page.getByText('Create Estimate')).toBeVisible();
    await expect(page.getByText('Create Invoice')).toBeVisible();
    await expect(page.getByText('Convert Estimate to Closed Order')).toBeVisible();
  });

  test('should display Create Now and Convert Now buttons', async ({ page }) => {
    // Quick action buttons should be present
    const createNowButtons = page.getByRole('button', { name: 'Create Now' });
    await expect(createNowButtons.first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Convert Now' })).toBeVisible();
  });

  test('should display the Recent Transactions table with correct columns', async ({ page }) => {
    // Recent Transactions section with all expected columns
    await expect(page.getByText('Recent Transactions')).toBeVisible();
    await expect(page.getByText('INVOICE')).toBeVisible();
    await expect(page.getByText('CUSTOMER')).toBeVisible();
    await expect(page.getByText('DATE')).toBeVisible();
    await expect(page.getByText('AMOUNT')).toBeVisible();
    await expect(page.getByText('STATUS')).toBeVisible();
  });

  test('should display the sidebar navigation links', async ({ page }) => {
    // All sidebar nav items should be visible
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Customers' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Estimates' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Invoices' })).toBeVisible();
  });

  test('Create Estimate card should navigate to Estimates module', async ({ page }) => {
    // Clicking "Create Now" on the Create Estimate card navigates to Estimates
    await page.getByText('Create Estimate')
      .locator('..')
      .getByRole('button', { name: 'Create Now' })
      .click();
    await expect(page).toHaveURL(/estimates/i);
  });

  test('Create Invoice card should navigate to Invoices module', async ({ page }) => {
    // Clicking "Create Now" on the Create Invoice card navigates to Invoices
    await page.getByText('Create Invoice')
      .locator('..')
      .getByRole('button', { name: 'Create Now' })
      .click();
    await expect(page).toHaveURL(/invoice/i);
  });

  test('should display the logged-in user name in the top navigation', async ({ page }) => {
    // The top nav should show the currently logged-in user
    await expect(page.getByText('Sandbox Employee 1')).toBeVisible();
  });

  test('should display the SANDBOX MODE banner', async ({ page }) => {
    // Orange sandbox mode banner should be visible at the top
    await expect(page.getByText('SANDBOX MODE')).toBeVisible();
  });
});
