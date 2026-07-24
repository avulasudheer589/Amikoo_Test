// pages/EstimatesPage.js
// Page Object Model — IdealTrendz Estimates module
// Covers: list view, create form, edit form, details modal,
//         PDF download, convert-to-invoice (confirm + payment modals).

class EstimatesPage {
  constructor(page) {
    this.page = page;

    // ── List view ────────────────────────────────────────────────────────────
    this.newEstimateButton    = page.getByRole('button', { name: /new estimate/i });
    this.searchInput          = page.getByPlaceholder(/search by estimate number or customer name/i);
    this.estimatesTable       = page.locator('table');
    // Each row in the estimates list
    this.estimateRows         = page.locator('div').filter({ hasText: /^#/ }).locator('..');
    this.paginationPrevButton = page.getByRole('button', { name: /previous/i });
    this.paginationNextButton = page.getByRole('button', { name: /next/i });

    // ── Create / Edit form — Basic Information ────────────────────────────────
    this.employeeSelect = page.getByLabel('Employee');

    // ── Create / Edit form — Customer Information ─────────────────────────────
    this.customerNameInput    = page.getByPlaceholder('Enter customer/Company name');
    this.phoneInput           = page.getByPlaceholder('Enter 10-digit mobile number');
    this.emailInput           = page.getByPlaceholder('Enter email address');
    this.addressInput         = page.getByPlaceholder('Enter address');
    this.cityInput            = page.getByPlaceholder('Enter city');
    this.stateInput           = page.getByPlaceholder('Enter state name');

    // ── Create / Edit form — Item row helpers (first row) ─────────────────────
    // Use nth(0) to scope to the first item row
    this.categorySelect       = page.locator('select').filter({ hasText: 'Select Category' }).nth(0);
    this.productSelect        = page.locator('select').filter({ hasText: 'Select Product' }).nth(0);
    this.customProductInput   = page.getByPlaceholder('Enter custom product name');
    this.hsnCodeInput         = page.getByPlaceholder('Enter HSN code');
    this.quantityInput        = page.getByLabel('Quantity');
    this.unitPriceInput       = page.getByLabel('Unit Price');
    this.discountInput        = page.getByLabel('Discount (%)');
    this.gstRateInput         = page.getByLabel('GST Rate (%)');
    this.addItemButton        = page.getByRole('button', { name: /add item/i });

    // ── Form action buttons ───────────────────────────────────────────────────
    this.createEstimateButton = page.getByRole('button', { name: /create estimate/i });
    this.saveEstimateButton   = page.getByRole('button', { name: /save estimate|update estimate/i });
    this.cancelButton         = page.getByRole('button', { name: /cancel/i });

    // ── Row action buttons (Eye / Download / Edit / Convert icons) ────────────
    // These are scoped per row in helpers below

    // ── Details modal ─────────────────────────────────────────────────────────
    this.detailsModal         = page.locator('[class*="modal"], .fixed.inset-0').filter({ hasText: /estimate details/i });
    this.detailsCloseButton   = this.detailsModal.getByRole('button', { name: /close|✕/i });
    this.detailsDownloadPDF   = this.detailsModal.getByRole('button', { name: /download pdf/i });
    this.detailsConvertButton = this.detailsModal.getByRole('button', { name: /convert to invoice/i });

    // ── Confirm-convert modal ─────────────────────────────────────────────────
    this.confirmConvertModal  = page.locator('.fixed.inset-0').filter({ hasText: /are you sure.*convert/i });
    this.confirmConvertButton = this.confirmConvertModal.getByRole('button', { name: /convert to invoice/i });
    this.cancelConvertButton  = this.confirmConvertModal.getByRole('button', { name: /cancel/i });

    // ── Payment modal (shown after confirming conversion) ─────────────────────
    this.paymentModal         = page.locator('.fixed.inset-0').filter({ hasText: /payment details for conversion/i });
    this.paymentTypeSelect    = this.paymentModal.locator('select');
    this.amountReceivedInput  = this.paymentModal.getByPlaceholder(/enter amount received/i);
    this.finalConvertButton   = this.paymentModal.getByRole('button', { name: /convert to invoice/i });
    this.cancelPaymentButton  = this.paymentModal.getByRole('button', { name: /cancel/i });
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  /** Navigate to the estimates list page */
  async goto() {
    await this.page.goto('/sales/history');
    await this.page.waitForURL(/sales\/history/);
  }

  /** Navigate to the New Estimate creation form */
  async gotoNewEstimateForm() {
    await this.page.goto('/sales/estimate/new');
    await this.customerNameInput.waitFor({ state: 'visible' });
  }

  /** Navigate directly to the edit form for a given estimate ID */
  async gotoEditForm(estimateId) {
    await this.page.goto(`/sales/estimate/edit/${estimateId}`);
    await this.customerNameInput.waitFor({ state: 'visible' });
  }

  // ── List-view helpers ───────────────────────────────────────────────────────

  /** Wait for the estimates list to finish loading (spinner disappears) */
  async waitForListLoaded() {
    await this.page.waitForSelector('text=Loading...', { state: 'hidden', timeout: 15_000 });
  }

  /** Type into the search box */
  async search(term) {
    await this.searchInput.fill(term);
    // Backend debounce is 500 ms
    await this.page.waitForTimeout(700);
    await this.waitForListLoaded();
  }

  /**
   * Click the Eye (View) button on the row whose customer name matches.
   * @param {string} customerName – partial or exact name shown in the row
   */
  async clickViewForCustomer(customerName) {
    const row = this.page.locator('div').filter({ hasText: customerName }).first();
    await row.getByTitle(/view details/i).click();
    await this.detailsModal.waitFor({ state: 'visible' });
  }

  /**
   * Click the Download PDF button on the row whose customer name matches.
   */
  async clickDownloadPDFForCustomer(customerName) {
    const row = this.page.locator('div').filter({ hasText: customerName }).first();
    await row.getByTitle(/download pdf/i).click();
  }

  /**
   * Open the "New Estimate" form from the list view.
   */
  async openNewEstimateForm() {
    await this.newEstimateButton.click();
    await this.customerNameInput.waitFor({ state: 'visible' });
  }

  // ── Form helpers ────────────────────────────────────────────────────────────

  /**
   * Fill the customer information section.
   * @param {{ name: string, phone: string, email?: string, address?: string, city?: string }} customer
   */
  async fillCustomerInfo(customer) {
    await this.customerNameInput.fill(customer.name);
    await this.phoneInput.fill(customer.phone);
    if (customer.email)   await this.emailInput.fill(customer.email);
    if (customer.address) await this.addressInput.fill(customer.address);
    if (customer.city)    await this.cityInput.fill(customer.city);
  }

  /**
   * Fill the first item row.
   * Handles the "Others" category branch (custom free-text product) automatically.
   * @param {{ categoryName: string, productName?: string, quantity?: number, gstRate?: number }} item
   */
  async fillFirstItem(item) {
    await this.categorySelect.waitFor({ state: 'visible' });
    await this.categorySelect.selectOption({ label: item.categoryName });
    // Wait for the product field to update after category selection
    await this.page.waitForTimeout(400);

    const isCustomInput = await this.customProductInput.isVisible().catch(() => false);
    if (isCustomInput) {
      await this.customProductInput.fill(item.productName || 'Custom Item');
    } else if (item.productName) {
      await this.productSelect.selectOption({ label: item.productName });
    } else {
      await this.productSelect.selectOption({ index: 1 });
    }

    if (item.quantity !== undefined) {
      await this.quantityInput.fill(String(item.quantity));
    }
    if (item.gstRate !== undefined) {
      await this.gstRateInput.fill(String(item.gstRate));
    }
  }

  /**
   * Fill and submit the full creation form in one call.
   * @param {{ employeeIndex?: number, customer: object, item: object }} data
   */
  async createEstimate({ employeeIndex = 1, customer, item }) {
    await this.employeeSelect.selectOption({ index: employeeIndex });
    await this.fillCustomerInfo(customer);
    await this.fillFirstItem(item);
    await this.createEstimateButton.click();
  }

  /**
   * Update fields on the edit form and save.
   * Only the supplied overrides are changed; others are left as-is.
   * @param {{ customer?: object, item?: object }} overrides
   */
  async editEstimate(overrides = {}) {
    if (overrides.customer) {
      await this.fillCustomerInfo(overrides.customer);
    }
    if (overrides.item) {
      await this.fillFirstItem(overrides.item);
    }
    await this.saveEstimateButton.click();
  }

  // ── Details modal helpers ───────────────────────────────────────────────────

  /** Close the details modal */
  async closeDetailsModal() {
    await this.detailsCloseButton.click();
    await this.detailsModal.waitFor({ state: 'hidden' });
  }

  /** Click "Download PDF" inside the details modal */
  async downloadPDFFromDetails() {
    await this.detailsDownloadPDF.click();
  }

  /** Click "Convert to Invoice" inside the details modal */
  async startConvertFromDetails() {
    await this.detailsConvertButton.click();
    // Confirmation modal should appear
    await this.confirmConvertModal.waitFor({ state: 'visible' });
  }

  // ── Convert-to-invoice flow helpers ────────────────────────────────────────

  /**
   * Complete the full convert-to-invoice flow from the list row:
   * opens confirm modal → confirms → fills payment modal → submits.
   * @param {string} customerName   – used to locate the correct row
   * @param {{ paymentType?: string, amountReceived?: number }} paymentInfo
   */
  async convertEstimateToInvoice(customerName, paymentInfo = {}) {
    // Step 1: click Convert icon / button on the correct row
    const row = this.page.locator('div').filter({ hasText: customerName }).first();
    await row.getByTitle(/convert|invoice/i).click();

    // Step 2: confirm modal
    await this.confirmConvertModal.waitFor({ state: 'visible' });
    await this.confirmConvertButton.click();

    // Step 3: payment modal
    await this.paymentModal.waitFor({ state: 'visible' });
    if (paymentInfo.paymentType) {
      await this.paymentTypeSelect.selectOption(paymentInfo.paymentType);
    }
    if (paymentInfo.amountReceived !== undefined) {
      await this.amountReceivedInput.fill(String(paymentInfo.amountReceived));
    }
    await this.finalConvertButton.click();
  }

  /**
   * Confirm an already-open confirm-convert modal then fill the payment modal.
   * Use when you already opened the modal via the details view.
   */
  async confirmConversionWithPayment(paymentInfo = {}) {
    await this.confirmConvertButton.click();
    await this.paymentModal.waitFor({ state: 'visible' });

    if (paymentInfo.paymentType) {
      await this.paymentTypeSelect.selectOption(paymentInfo.paymentType);
    }
    if (paymentInfo.amountReceived !== undefined) {
      await this.amountReceivedInput.fill(String(paymentInfo.amountReceived));
    }
    await this.finalConvertButton.click();
  }

  /** Cancel out of the confirm-convert modal */
  async cancelConvertModal() {
    await this.cancelConvertButton.click();
    await this.confirmConvertModal.waitFor({ state: 'hidden' });
  }

  /** Cancel out of the payment modal */
  async cancelPaymentModal() {
    await this.cancelPaymentButton.click();
    await this.paymentModal.waitFor({ state: 'hidden' });
  }

  // ── Pagination helpers ──────────────────────────────────────────────────────

  async goToNextPage() {
    await this.paginationNextButton.click();
    await this.waitForListLoaded();
  }

  async goToPreviousPage() {
    await this.paginationPrevButton.click();
    await this.waitForListLoaded();
  }

  async goToPage(pageNumber) {
    await this.page.getByRole('button', { name: String(pageNumber), exact: true }).click();
    await this.waitForListLoaded();
  }
}

module.exports = { EstimatesPage };
