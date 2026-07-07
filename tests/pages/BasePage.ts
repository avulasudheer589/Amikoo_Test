import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Theme toggle — available on all pages
  get themeToggleBtn() {
    return this.page.getByRole('button', { name: 'Toggle theme' });
  }

  // "← Home" back button — available on secondary pages
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
