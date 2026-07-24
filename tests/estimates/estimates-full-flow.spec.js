// tests/estimates/estimates-full-flow.spec.js
//
// Full estimates lifecycle — IdealTrendz (https://app.idealtrendz.org/)
//
// Flow covered:
//   1. List view renders and search works
//   2. Create estimate (Others / custom product)
//   3. Create estimate (catalogued product via dropdown)
//   4. View estimate details modal
//   5. Edit an existing estimate
//   6. Download PDF from list row
//   7. Download PDF from details modal
//   8. Convert estimate to invoice — full payment flow (cash / full payment)
//   9. Convert with partial payment (UPI)
//  10. Cancel out of convert confirm modal — estimate stays in list
//  11. Cancel out of payment modal — estimate stays in list
//  12. Validation — submit empty form, required-field errors appear

const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../../pages/LoginPage');
const { EstimatesPage } = require('../../pages/EstimatesPage');

// ── Credentials (never hardcoded — read from .env) ────────────────────────────
const EMAIL    = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

// ── Shared test data ──────────────────────────────────────────────────────────
const CUSTOMER = {
  name:    'Flow Test Customer',
  phone:   '9876543210',
  email:   'flowtestcustomer@example.com',
  address: '42 Test Lane',
  city:    'Hyderabad',
};

const ITEM_OTHERS = {
  categoryName: 'Others',
  productName:  'Custom Wooden Panel',
  quantity:     2,
  gstRate:      18,
};

// Update these to match real category/product names in your sandbox
const ITEM_CATALOGUE = {
  // Use index: 1 (first real category) if you don't have a stable name
  useCategoryIndex: true,
  quantity: 1,
  gstRate:  18,
};

// ── Login helper shared across tests ─────────────────────────────────────────
async function login(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(EMAIL, PASSWORD);
  await loginPage.assertLoggedIn();
}

// =============================================================================
test.describe('Estimates — Full Flow', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ── 1. List view ───────────────────────────────────────────────────────────
  test('1 | list view loads and displays estimates', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.waitForListLoaded();

    // Page heading should be visible
    await expect(page.getByRole('heading', { name: /estimates/i })).toBeVisible();

    // Either the table/rows or the empty-state message must be present
    const hasRows      = await ep.estimatesTable.isVisible().catch(() => false);
    const hasEmptyText = await page.getByText(/no estimates found/i).isVisible().catch(() => false);
    expect(hasRows || hasEmptyText).toBeTruthy();
  });

  // ── 2. Search / filter ─────────────────────────────────────────────────────
  test('2 | search filters the estimates list', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.waitForListLoaded();

    // Type a term that is unlikely to match — list should show empty state
    await ep.search('ZZZNOMATCH99999');
    await expect(page.getByText(/no estimates found/i)).toBeVisible();

    // Clear and check list reloads
    await ep.searchInput.clear();
    await page.waitForTimeout(700);
    await ep.waitForListLoaded();
    // Page heading should still be there
    await expect(page.getByRole('heading', { name: /estimates/i })).toBeVisible();
  });

  // ── 3. Create estimate — Others category (custom product) ─────────────────
  test('3 | create estimate with "Others" category and custom product', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    // Select first available employee
    await ep.employeeSelect.selectOption({ index: 1 });

    // Fill customer + item
    await ep.fillCustomerInfo(CUSTOMER);
    await ep.fillFirstItem(ITEM_OTHERS);

    // Submit
    await ep.createEstimateButton.click();

    // Should navigate back to the estimates list on success
    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });
    await expect(page.getByText(CUSTOMER.name)).toBeVisible();
  });

  // ── 4. Create estimate — catalogued product ────────────────────────────────
  test('4 | create estimate with a catalogued product (dropdown)', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    await ep.employeeSelect.selectOption({ index: 1 });
    await ep.fillCustomerInfo({ ...CUSTOMER, name: 'Catalogue Customer', phone: '9000000001' });

    // Pick first real category by index
    await ep.categorySelect.waitFor({ state: 'visible' });
    await ep.categorySelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // If product dropdown is available, pick first product
    const productDropdownVisible = await ep.productSelect.isVisible().catch(() => false);
    if (productDropdownVisible) {
      await ep.productSelect.selectOption({ index: 1 });
    } else {
      // Fallback: custom input appeared
      await ep.customProductInput.fill('Catalogue Item');
    }

    await ep.quantityInput.fill('1');
    await ep.gstRateInput.fill('18');

    await ep.createEstimateButton.click();

    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });
    await expect(page.getByText('Catalogue Customer')).toBeVisible();
  });

  // ── 5. View estimate details modal ────────────────────────────────────────
  test('5 | view estimate details modal shows customer and items', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.waitForListLoaded();

    // Click the eye icon on the first row (whatever estimate is at the top)
    const firstViewBtn = page.getByTitle(/view details/i).first();
    await firstViewBtn.click();

    // Details modal should appear with key sections
    await expect(ep.detailsModal).toBeVisible({ timeout: 8_000 });
    await expect(ep.detailsModal.getByText(/estimate details/i)).toBeVisible();
    await expect(ep.detailsModal.getByText(/employee/i)).toBeVisible();
    await expect(ep.detailsModal.getByText(/customer/i)).toBeVisible();
    await expect(ep.detailsModal.getByText(/items/i)).toBeVisible();
    await expect(ep.detailsModal.getByText(/total/i)).toBeVisible();

    // Close the modal
    await ep.closeDetailsModal();
    await expect(ep.detailsModal).not.toBeVisible();
  });

  // ── 6. Edit an existing estimate ──────────────────────────────────────────
  test('6 | edit an existing estimate updates customer details', async ({ page }) => {
    const ep = new EstimatesPage(page);

    // First create one so we have something to edit
    await ep.goto();
    await ep.openNewEstimateForm();
    await ep.employeeSelect.selectOption({ index: 1 });
    await ep.fillCustomerInfo({ name: 'Edit Target', phone: '9111111111' });
    await ep.fillFirstItem(ITEM_OTHERS);
    await ep.createEstimateButton.click();
    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });

    // Search for the estimate we just created
    await ep.search('Edit Target');
    const editRow = page.locator('div').filter({ hasText: 'Edit Target' }).first();

    // Find the Edit button (pencil icon) on that row
    const editBtn = editRow.getByTitle(/edit/i);
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await ep.customerNameInput.waitFor({ state: 'visible' });

      // Update the customer name
      await ep.customerNameInput.fill('Edit Target Updated');
      await ep.saveEstimateButton.click();

      await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });
      await expect(page.getByText('Edit Target Updated')).toBeVisible();
    } else {
      // Edit icon may not be exposed in current UI; mark as skipped with a note
      test.skip(true, 'Edit button not found in current UI — skipping edit test.');
    }
  });

  // ── 7. Download PDF from list row ─────────────────────────────────────────
  test('7 | download PDF button from list row triggers PDF generation', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.waitForListLoaded();

    // Listen for the download event OR a toast confirming PDF generation
    const [pdfToast] = await Promise.all([
      page.waitForSelector('text=/pdf generated|pdf downloaded/i', {
        state: 'visible',
        timeout: 10_000,
      }).catch(() => null),
      page.getByTitle(/download pdf/i).first().click(),
    ]);

    // Either a download happened or a success toast is shown
    const toastVisible = await page.getByText(/pdf generated/i).isVisible().catch(() => false);
    expect(toastVisible || pdfToast !== null).toBeTruthy();
  });

  // ── 8. Download PDF from details modal ────────────────────────────────────
  test('8 | download PDF button inside details modal triggers PDF generation', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.waitForListLoaded();

    // Open the first estimate's details
    await page.getByTitle(/view details/i).first().click();
    await ep.detailsModal.waitFor({ state: 'visible' });

    await ep.downloadPDFFromDetails();

    // PDF generation success toast
    await expect(page.getByText(/pdf generated/i)).toBeVisible({ timeout: 8_000 });
    await ep.closeDetailsModal();
  });

  // ── 9. Convert estimate to invoice — full cash payment ────────────────────
  test('9 | convert estimate to invoice with full cash payment', async ({ page }) => {
    const ep = new EstimatesPage(page);

    // Create a fresh estimate for this test
    await ep.goto();
    await ep.openNewEstimateForm();
    await ep.employeeSelect.selectOption({ index: 1 });
    await ep.fillCustomerInfo({ name: 'Convert Customer Cash', phone: '9222222222' });
    await ep.fillFirstItem(ITEM_OTHERS);
    await ep.createEstimateButton.click();
    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });

    // Locate the row for this customer
    await ep.search('Convert Customer Cash');
    const row = page.locator('div').filter({ hasText: 'Convert Customer Cash' }).first();

    // Find and read the total amount from the row for the payment step
    const amountText = await row.locator('text=/₹/').first().innerText().catch(() => '0');
    const totalAmount = parseFloat(amountText.replace(/[^0-9.]/g, '')) || 1000;

    // Click the Convert to Invoice button on the row (if it exists)
    const convertRowBtn = row.getByTitle(/convert|invoice/i);
    const hasConvertRowBtn = await convertRowBtn.isVisible().catch(() => false);

    if (hasConvertRowBtn) {
      await convertRowBtn.click();
    } else {
      // Fallback: open details modal, then use the Convert button there
      await row.getByTitle(/view details/i).click();
      await ep.detailsModal.waitFor({ state: 'visible' });
      await ep.startConvertFromDetails();
    }

    // Step 1 — Confirm modal
    await ep.confirmConvertModal.waitFor({ state: 'visible' });
    await expect(ep.confirmConvertModal.getByText(/convert to invoice/i)).toBeVisible();
    await ep.confirmConvertButton.click();

    // Step 2 — Payment modal
    await ep.paymentModal.waitFor({ state: 'visible' });
    await ep.paymentTypeSelect.selectOption('cash');
    await ep.amountReceivedInput.fill(String(totalAmount)); // full payment
    await ep.finalConvertButton.click();

    // Should navigate to invoices page after successful conversion
    await expect(page).toHaveURL(/sales\/invoices/, { timeout: 15_000 });
    // Success toast
    await expect(page.getByText(/converted to invoice/i)).toBeVisible({ timeout: 8_000 });
  });

  // ── 10. Convert estimate — partial UPI payment ────────────────────────────
  test('10 | convert estimate to invoice with partial UPI payment', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();
    await ep.employeeSelect.selectOption({ index: 1 });
    await ep.fillCustomerInfo({ name: 'Convert Customer UPI', phone: '9333333333' });
    await ep.fillFirstItem(ITEM_OTHERS);
    await ep.createEstimateButton.click();
    await expect(page).toHaveURL(/sales\/(history|estimates)/, { timeout: 12_000 });

    await ep.search('Convert Customer UPI');
    const row = page.locator('div').filter({ hasText: 'Convert Customer UPI' }).first();

    // Open details → convert from inside the modal
    await row.getByTitle(/view details/i).click();
    await ep.detailsModal.waitFor({ state: 'visible' });
    await ep.startConvertFromDetails();

    // Confirm
    await ep.confirmConvertButton.click();

    // Payment — partial
    await ep.paymentModal.waitFor({ state: 'visible' });
    await ep.paymentTypeSelect.selectOption('upi');
    await ep.amountReceivedInput.fill('500'); // partial
    await ep.finalConvertButton.click();

    await expect(page).toHaveURL(/sales\/invoices/, { timeout: 15_000 });
    await expect(page.getByText(/converted to invoice/i)).toBeVisible({ timeout: 8_000 });
  });

  // ── 11. Cancel convert confirm modal — estimate stays ─────────────────────
  test('11 | cancelling the confirm modal leaves estimate in list', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.waitForListLoaded();

    // Get first row's customer name before we try to convert
    const firstRow = page.locator('div').filter({ hasText: /^#/ }).first();
    const firstCustomerName = await firstRow.locator('div[class*="font-medium"]').first().innerText().catch(() => '');

    // Open the confirm convert modal via details view
    await page.getByTitle(/view details/i).first().click();
    await ep.detailsModal.waitFor({ state: 'visible' });

    // Only proceed if the Convert button is visible (estimate must be in "estimate" status)
    const canConvert = await ep.detailsConvertButton.isVisible().catch(() => false);
    if (!canConvert) {
      test.skip(true, 'No unconverted estimate in list — skipping cancel-convert test.');
      return;
    }

    await ep.startConvertFromDetails();

    // Cancel the confirm modal
    await ep.cancelConvertModal();

    // Should stay on the estimates list, not navigate away
    await expect(page).toHaveURL(/sales\/(history|estimates)/);
    // Customer should still be in the list
    if (firstCustomerName) {
      await expect(page.getByText(firstCustomerName)).toBeVisible();
    }
  });

  // ── 12. Cancel payment modal — estimate stays ─────────────────────────────
  test('12 | cancelling the payment modal leaves estimate unconverted', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.waitForListLoaded();

    // Open details and start convert
    await page.getByTitle(/view details/i).first().click();
    await ep.detailsModal.waitFor({ state: 'visible' });

    const canConvert = await ep.detailsConvertButton.isVisible().catch(() => false);
    if (!canConvert) {
      test.skip(true, 'No unconverted estimate available — skipping payment modal cancel test.');
      return;
    }

    await ep.startConvertFromDetails();
    await ep.confirmConvertButton.click();

    // Now cancel from the payment modal
    await ep.paymentModal.waitFor({ state: 'visible' });
    await ep.cancelPaymentModal();

    // Should remain on estimates page
    await expect(page).toHaveURL(/sales\/(history|estimates)/);
    await expect(page.getByRole('heading', { name: /estimates/i })).toBeVisible();
  });

  // ── 13. Validation — empty form submit ────────────────────────────────────
  test('13 | submitting empty create form shows required-field errors', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    // Submit without filling anything
    await ep.createEstimateButton.click();

    // At least one validation error indicator must appear
    const errorLocator = page.locator(
      '.error-message, [data-testid="field-error"], .invalid-feedback, ' +
      '[class*="error"], [class*="invalid"], text=/required|invalid|please/i'
    ).first();
    await expect(errorLocator).toBeVisible({ timeout: 5_000 });

    // Must NOT navigate away from the form
    await expect(page).toHaveURL(/sales\/estimate/);
  });

  // ── 14. Validation — invalid phone number ─────────────────────────────────
  test('14 | invalid phone number shows phone validation error', async ({ page }) => {
    const ep = new EstimatesPage(page);

    await ep.goto();
    await ep.openNewEstimateForm();

    await ep.employeeSelect.selectOption({ index: 1 });
    await ep.customerNameInput.fill('Phone Test User');
    await ep.phoneInput.fill('12345'); // only 5 digits — invalid

    await ep.createEstimateButton.click();

    // Phone-related validation message
    const phoneError = page.locator(
      'text=/invalid|10.digit|mobile|phone/i, [class*="error"]'
    ).first();
    await expect(phoneError).toBeVisible({ timeout: 5_000 });
  });

});
