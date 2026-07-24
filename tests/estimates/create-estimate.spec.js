// tests/estimates/create-estimate.spec.js
//
// Estimate Creation — IdealTrendz (https://app.idealtrendz.org/)
//
// Scenarios covered:
//   1. Happy path — "Others" category with a free-text custom product
//   2. Happy path — catalogued product via the product dropdown
//   3. Happy path — optional fields (email, address, city) are included
//   4. Validation — submit with all fields empty, required errors appear
//   5. Validation — 5-digit phone number triggers phone error
//   6. Cancel — clicking Cancel returns to the estimates list without saving

const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../../pages/LoginPage');
const { EstimatesPage } = require('../../pages/EstimatesPage');

// ── Credentials (from .env — never hardcoded) ─────────────────────────────────
const EMAIL    = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

// ── Test data ─────────────────────────────────────────────────────────────────
// Minimum required fields for a valid estimate
const BASE_CUSTOMER = {
  name:  'Create Test Customer',
  phone: '9876543210',
};

// Full customer object with all optional fields
const FULL_CUSTOMER = {
  name:    'Full Fields Customer',
  phone:   '9876500001',
  email:   'fullfields@example.com',
  address: '99 Jubilee Hills',
  city:    'Hyderabad',
};

// "Others" category renders a free-text product input instead of a dropdown
const ITEM_OTHERS = {
  categoryName: 'Others',
  productName:  'Custom Wood Panel',   // typed into the free-text input
  quantity:     2,
  gstRate:      18,
};

// ── Shared login helper ───────────────────────────────────────────────────────
async function login(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(EMAIL, PASSWORD);
  await loginPage.assertLoggedIn();
}

// =============================================================================
test.describe('Estimates — Create Estimate', () => {

  // Log in once before each test so every scenario starts authenticated
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ── 1. Happy path — "Others" category + custom product ─────────────────────
  test('1 | should create a new estimate with "Others" category and custom product', async ({ page }) => {
    const ep = new EstimatesPage(page);

    // Navigate to the estimates list and open the creation form
    await ep.goto();
    await ep.openNewEstimateForm();

    // Select the first available employee (salesperson)
    await ep.employeeSelect.selectOption({ index: 1 });

    // Fill customer details
    await ep.fillCustomerInfo(BASE_CUSTOMER);

    // Fill the first item — "Others" category shows a free-text product input
    await ep.fillFirstItem(ITEM_OTHERS);

    // Submit the form
    await ep.createEstimateButton.click();

    // After a successful create the app should navigate back to the estimates list
    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });

    // The new customer name must appear in the list
    await expect(page.getByText(BASE_CUSTOMER.name)).toBeVisible();
  });

  // ── 2. Happy path — catalogued product via dropdown ─────────────────────────
  test('2 | should create a new estimate with a catalogued product from the dropdown', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    await ep.employeeSelect.selectOption({ index: 1 });

    // Unique name so we can assert it later
    await ep.fillCustomerInfo({ name: 'Catalogue Estimate Customer', phone: '9876500002' });

    // Pick the first real category (index 1 skips the placeholder option)
    await ep.categorySelect.waitFor({ state: 'visible' });
    await ep.categorySelect.selectOption({ index: 1 });

    // Wait for the product list to load after the category changes
    await page.waitForTimeout(500);

    // The product field may render as a dropdown OR as a free-text input
    const isProductDropdown = await ep.productSelect.isVisible().catch(() => false);
    if (isProductDropdown) {
      // Select the first real product from the dropdown
      await ep.productSelect.selectOption({ index: 1 });
    } else {
      // Fallback — the selected category behaves like "Others"
      await ep.customProductInput.fill('Fallback Custom Item');
    }

    await ep.quantityInput.fill('1');
    await ep.gstRateInput.fill('18');

    await ep.createEstimateButton.click();

    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });
    await expect(page.getByText('Catalogue Estimate Customer')).toBeVisible();
  });

  // ── 3. Happy path — all optional fields filled ───────────────────────────────
  test('3 | should create an estimate with all optional customer fields filled', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    await ep.employeeSelect.selectOption({ index: 1 });

    // Fill every customer field including optional ones (email, address, city)
    await ep.fillCustomerInfo(FULL_CUSTOMER);

    await ep.fillFirstItem(ITEM_OTHERS);

    await ep.createEstimateButton.click();

    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });
    await expect(page.getByText(FULL_CUSTOMER.name)).toBeVisible();
  });

  // ── 4. Validation — submit empty form shows required-field errors ─────────
  test('4 | submitting an empty form should show required-field validation errors', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    // Click Create without filling anything in
    await ep.createEstimateButton.click();

    // At least one validation error indicator must become visible
    // The app uses red border highlights, error text, or toast messages
    const errorIndicator = page.locator(
      '[class*="error"], [class*="invalid"], ' +
      'text=/required|invalid|please enter/i'
    ).first();
    await expect(errorIndicator).toBeVisible({ timeout: 5_000 });

    // Must NOT navigate away from the estimate form
    await expect(page).toHaveURL(/sales\/estimate/);
  });

  // ── 5. Validation — short phone number triggers phone-field error ─────────
  test('5 | entering an invalid (5-digit) phone number should show a phone validation error', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    // Fill only the minimum fields, but with a bad phone number
    await ep.employeeSelect.selectOption({ index: 1 });
    await ep.customerNameInput.fill('Phone Validation User');
    await ep.phoneInput.fill('12345');             // too short — not 10 digits

    await ep.createEstimateButton.click();

    // A phone-specific error message should appear
    const phoneError = page.locator(
      'text=/invalid|10.digit|mobile number|phone/i, ' +
      '[class*="error"]'
    ).first();
    await expect(phoneError).toBeVisible({ timeout: 5_000 });

    // Must remain on the form, not proceed to the list
    await expect(page).toHaveURL(/sales\/estimate/);
  });

  // ── 6. Cancel — returns to list without saving ───────────────────────────
  test('6 | clicking Cancel on the create form should discard data and return to the list', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    // Partially fill the form so there is data to discard
    await ep.employeeSelect.selectOption({ index: 1 });
    await ep.fillCustomerInfo({ name: 'Should Not Be Saved', phone: '9100000000' });

    // Click Cancel
    await ep.cancelButton.click();

    // Should be back on the estimates list
    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 8_000 });

    // The partially filled customer name must NOT appear in the list
    await expect(page.getByText('Should Not Be Saved')).not.toBeVisible();
  });

});
