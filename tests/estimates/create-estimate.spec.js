// tests/estimates/create-estimate.spec.js
// Positive scenario: create a new estimate end-to-end using Page Object Models

const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../../pages/LoginPage');
const { EstimatesPage } = require('../../pages/EstimatesPage');

// ── Test data ─────────────────────────────────────────────────────────────────
// Credentials are read from .env (never hardcoded)
const CREDENTIALS = {
  email:    process.env.TEST_EMAIL,
  password: process.env.TEST_PASSWORD
};

// Replace these values with a real employee ID and category/product
// that exist in the IDealtrendz sandbox environment
const ESTIMATE_DATA = {
  employeeValue: process.env.TEST_EMPLOYEE_ID || '', // salesperson_id value from the dropdown
  customer: {
    name:    'Test Customer',
    phone:   '9876543210',
    email:   'testcustomer@example.com',
    address: '123 Test Street',
    city:    'Hyderabad'
  },
  item: {
    categoryName: 'Others',         // use a category name that exists in your sandbox
    productName:  'Test Product',   // only needed when category is NOT "Others"
    quantity:     2,
    gstRate:      18
  }
};

// ── Tests ─────────────────────────────────────────────────────────────────────
test.describe('Estimates — Create Estimate', () => {

  test('should create a new estimate successfully', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const estimatesPage = new EstimatesPage(page);

    // Step 1: Log in
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
    await loginPage.assertLoggedIn();

    // Step 2: Navigate to Estimates module
    await estimatesPage.goto();
    await expect(page).toHaveURL(/sales\/estimates/);

    // Step 3: Open the New Estimate form
    await estimatesPage.openNewEstimateForm();

    // Step 4: Select employee (salesperson)
    await estimatesPage.employeeSelect.selectOption({ index: 1 }); // selects the first available employee

    // Step 5: Fill in customer information
    await estimatesPage.fillCustomerInfo(ESTIMATE_DATA.customer);

    // Step 6: Fill in the first item row
    // For "Others" category — product name is typed as free text
    await estimatesPage.categorySelect.selectOption({ label: ESTIMATE_DATA.item.categoryName });
    await page.waitForTimeout(300); // wait for product field to update

    // If category is "Others", a free-text input appears instead of a dropdown
    const customProductInput = page.getByPlaceholder('Enter custom product name');
    const isCustomInput = await customProductInput.isVisible().catch(() => false);

    if (isCustomInput) {
      await customProductInput.fill('Custom Wood Work Item');
    } else {
      await estimatesPage.productSelect.selectOption({ label: ESTIMATE_DATA.item.productName });
    }

    // Fill quantity and GST rate
    await estimatesPage.quantityInput.fill(String(ESTIMATE_DATA.item.quantity));
    await estimatesPage.gstRateInput.fill(String(ESTIMATE_DATA.item.gstRate));

    // Step 7: Submit the form
    await estimatesPage.submitForm();

    // Step 8: Assert the estimate was created — app should navigate back to the estimates list
    await expect(page).toHaveURL(/sales\/estimates/, { timeout: 10000 });

    // The estimates table should be visible (confirming the list view loaded)
    await expect(estimatesPage.estimatesTable).toBeVisible();

    // The newly created customer name should appear in the table
    await expect(
      page.getByText(ESTIMATE_DATA.customer.name)
    ).toBeVisible();
  });
});
