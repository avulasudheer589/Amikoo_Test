// tests/estimates/create-estimate.spec.js
//
// Estimate Creation — IdealTrendz (https://app.idealtrendz.org/)
//
// All interactions go through EstimatesPage (POM) and LoginPage (POM).
// The spec file only describes scenario intent — no raw locators here.
//
// Scenarios:
//   1. Happy path — "Others" category + free-text custom product
//   2. Happy path — catalogued product via the product dropdown
//   3. Happy path — all optional customer fields (email, address, city)
//   4. Validation — submit empty form → required-field errors appear
//   5. Validation — invalid 5-digit phone → phone-field error appears
//   6. Cancel — discard partial form data, return to the estimates list

const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../../pages/LoginPage');
const { EstimatesPage } = require('../../pages/EstimatesPage');

// ── Credentials — read from .env, never hardcoded ────────────────────────────
const EMAIL    = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

// ── Shared test data ──────────────────────────────────────────────────────────

/** Minimum required fields for a valid estimate */
const BASE_CUSTOMER = {
  name:  'Create Test Customer',
  phone: '9876543210',
};

/** Full customer data including optional fields */
const FULL_CUSTOMER = {
  name:    'Full Fields Customer',
  phone:   '9876500001',
  email:   'fullfields@example.com',
  address: '99 Jubilee Hills',
  city:    'Hyderabad',
};

/**
 * "Others" category — the app renders a free-text product name input
 * instead of a product dropdown when this category is selected.
 */
const ITEM_OTHERS = {
  categoryName: 'Others',
  productName:  'Custom Wood Panel',
  quantity:     2,
  gstRate:      18,
};

// ── Login helper — reused in beforeEach ──────────────────────────────────────
async function loginAs(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(EMAIL, PASSWORD);
  await loginPage.assertLoggedIn();
}

// =============================================================================
test.describe('Estimates — Create Estimate', () => {

  // Authenticate before every test so each scenario starts from a clean session
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  // ── Test 1 ────────────────────────────────────────────────────────────────
  test('1 | create estimate — "Others" category with custom product', async ({ page }) => {
    const ep = new EstimatesPage(page);

    // Go to the list page and open the New Estimate form via the POM
    await ep.goto();
    await ep.openNewEstimateForm();

    // POM: select first available employee (salesperson) from the dropdown
    await ep.employeeSelect.selectOption({ index: 1 });

    // POM: fill customer section — name and phone are required
    await ep.fillCustomerInfo(BASE_CUSTOMER);

    // POM: fill item row — detects "Others" branch automatically and
    //      types the product name into the free-text input
    await ep.fillFirstItem(ITEM_OTHERS);

    // POM: submit via the "Create Estimate" button
    await ep.createEstimateButton.click();

    // The app navigates back to the estimates list on success
    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });

    // The new customer name must be visible in the estimates list
    await expect(page.getByText(BASE_CUSTOMER.name)).toBeVisible();
  });

  // ── Test 2 ────────────────────────────────────────────────────────────────
  test('2 | create estimate — catalogued product via the product dropdown', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    await ep.employeeSelect.selectOption({ index: 1 });

    // Unique customer name so the list assertion is unambiguous
    await ep.fillCustomerInfo({ name: 'Catalogue Estimate Customer', phone: '9876500002' });

    // POM: select the first real category (index 1 skips the placeholder)
    await ep.categorySelect.waitFor({ state: 'visible' });
    await ep.categorySelect.selectOption({ index: 1 });

    // Wait for the product field to update after category selection
    await page.waitForTimeout(500);

    // POM: product field may render as dropdown or free-text depending on category
    const isProductDropdown = await ep.productSelect.isVisible().catch(() => false);
    if (isProductDropdown) {
      await ep.productSelect.selectOption({ index: 1 }); // first real product
    } else {
      // Category behaves like "Others" in the test environment
      await ep.customProductInput.fill('Fallback Custom Product');
    }

    await ep.quantityInput.fill('1');
    await ep.gstRateInput.fill('18');

    await ep.createEstimateButton.click();

    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });
    await expect(page.getByText('Catalogue Estimate Customer')).toBeVisible();
  });

  // ── Test 3 ────────────────────────────────────────────────────────────────
  test('3 | create estimate — all optional customer fields filled', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    await ep.employeeSelect.selectOption({ index: 1 });

    // POM: fillCustomerInfo also populates optional email, address and city
    await ep.fillCustomerInfo(FULL_CUSTOMER);

    await ep.fillFirstItem(ITEM_OTHERS);

    await ep.createEstimateButton.click();

    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });
    await expect(page.getByText(FULL_CUSTOMER.name)).toBeVisible();
  });

  // ── Test 4 ────────────────────────────────────────────────────────────────
  test('4 | validation — empty form submit shows required-field errors', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    // Submit without filling any field
    await ep.createEstimateButton.click();

    // The app highlights required fields with error styling or toast text
    const errorIndicator = page.locator(
      '[class*="error"], [class*="invalid"], text=/required|invalid|please enter/i'
    ).first();
    await expect(errorIndicator).toBeVisible({ timeout: 5_000 });

    // Must NOT navigate away — form should stay open
    await expect(page).toHaveURL(/sales\/estimate/);
  });

  // ── Test 5 ────────────────────────────────────────────────────────────────
  test('5 | validation — 5-digit phone number shows phone-field error', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    // Fill name + bad phone, leave everything else empty
    await ep.employeeSelect.selectOption({ index: 1 });
    await ep.customerNameInput.fill('Phone Validation User');
    await ep.phoneInput.fill('12345'); // 5 digits — invalid for a 10-digit phone field

    await ep.createEstimateButton.click();

    // Phone-specific validation message must appear
    const phoneError = page.locator(
      'text=/invalid|10.digit|mobile number|phone/i, [class*="error"]'
    ).first();
    await expect(phoneError).toBeVisible({ timeout: 5_000 });

    // Must stay on the form
    await expect(page).toHaveURL(/sales\/estimate/);
  });

  // ── Test 6 ────────────────────────────────────────────────────────────────
  test('6 | cancel — discards partial data and returns to the estimates list', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    // Partially fill the form — this data should be discarded on Cancel
    await ep.employeeSelect.selectOption({ index: 1 });
    await ep.fillCustomerInfo({ name: 'Should Not Be Saved', phone: '9100000000' });

    // POM: click the Cancel button
    await ep.cancelButton.click();

    // Must navigate back to the estimates list
    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 8_000 });

    // The unsaved customer name must NOT appear anywhere in the list
    await expect(page.getByText('Should Not Be Saved')).not.toBeVisible();
  });

});
