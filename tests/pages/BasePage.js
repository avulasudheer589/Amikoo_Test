class BasePage {
  constructor(page) {
    this.page = page;
  }

  // Theme toggle — available on all pages
  get themeToggleBtn() {
    return this.page.getByRole('button', { name: 'Toggle theme' });
  }

  // "← Home" back button — available on all secondary pages
  get homeBtn() {
    return this.page.getByRole('button', { name: /← Home|Home/ });
  }

  async toggleTheme() {
    await this.themeToggleBtn.click();
  }

  async goHome() {
    await this.homeBtn.click();
  }
}

module.exports = { BasePage };
