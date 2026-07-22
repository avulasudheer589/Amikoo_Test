// pages/EstimatesPage.js
// Page Object Model for the IDealtrendz Estimates module
// Route: /sales/estimates  |  Form source: EstimateForm.js

class EstimatesPage {
  constructor(page) {
    this.page = page;

    // ── List view ────────────────────────────────────────────────────────────
    this.newEstimateButton = page.getByRole('button', { name: /new estimate/i });

    // ── Basic Information section ─────────────────────────────────────────────
    // "Employee" is a <select> rendered by ValidatedSelect with label "Employee"
    this.employeeSelect = page.getByLabel('Employee');

    // ── Customer Information section ──────────────────────────────────────────
    // Placeholders taken directly from EstimateForm.js source
    this.customerNameInput  = page.getByPlaceholder('Enter customer/Company name');
    this.phoneInput         = page.getByPlaceholder('Enter 10-digit mobile number');
    this.emailInput         = page.getByPlaceholder('Enter email address');
    this.addressInput       = page.getByPlaceholder('Enter address');
    this.cityInput          = page.getByPlaceholder('Enter city');
    this.stateInput         = page.getByPlaceholder('Enter state name');

    // ── Item row (first item by default) ──────────────────────────────────────
    // Category and Product are <select> elements — scoped via nth(0) for the first row
    this.categorySelect = page.locator('select').filter({ hasText: 'Select Category' }).nth(0);
    this.productSelect  = page.locator('select').filter({ hasText: 'Select Product' }).nth(0);
    this.hsnCodeInput   = page.getByPlaceholder('Enter HSN code');
    this.quantityInput  = page.getByLabel('Quantity');
    this.discountInput  = page.getByLabel('Discount (%)');
    this.gstRateInput   = page.getByLabel('GST Rate (%)');

    // ── Form action buttons ───────────────────────────────────────────────────
    this.createEstimateButton = page.getByRole('button', { name: /create estimate/i });
    this.cancelButton         = page.getByRole('button', { name: /cancel/i });

    // ── Success confirmation ──────────────────────────────────────────────────
    // After a successful submit the app navigates back to the estimates list
    this.estimatesTable = page.locator('table');
  }

  /** Navigate directly to the estimates page */
  async goto() {
    await this.page.goto('/sales/estimates');
  }

  /** Click "New Estimate" to open the creation form */
  async openNewEstimateForm() {
    await this.newEstimateButton.click();
    // Wait for the form to be visible
    await this.page.waitForURL(/sales\/estimates/);
    await this.customerNameInput.waitFor({ state: 'visible' });
  }

  /**
   * Fill in the customer information section.
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
   * Fill in the first item row.
   * @param {{ categoryName: string, productName: string, quantity?: number, gstRate?: number }} item
   */
  async fillFirstItem(item) {
    // Select category — wait for options to load first
    await this.categorySelect.waitFor({ state: 'visible' });
    await this.categorySelect.selectOption({ label: item.categoryName });

    // Wait for products to load after category selection
    await this.page.waitForTimeout(500);
    await this.productSelect.selectOption({ label: item.productName });

    if (item.quantity !== undefined) {
      await this.quantityInput.fill(String(item.quantity));
    }
    if (item.gstRate !== undefined) {
      await this.gstRateInput.fill(String(item.gstRate));
    }
  }

  /** Submit the estimate creation form */
  async submitForm() {
    await this.createEstimateButton.click();
  }

  /**
   * End-to-end helper: fill and submit a complete estimate.
   * @param {{ employeeValue: string, customer: object, item: object }} data
   */
  async createEstimate({ employeeValue, customer, item }) {
    // Select the employee (salesperson)
    await this.employeeSelect.selectOption({ value: employeeValue });

    // Fill customer details
    await this.fillCustomerInfo(customer);

    // Fill first item
    await this.fillFirstItem(item);

    // Submit
    await this.submitForm();
  }
}

module.exports = { EstimatesPage };
