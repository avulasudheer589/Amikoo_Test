// pages/LoginPage.js
// Page Object Model for the IDealtrendz Unified Login page

class LoginPage {
  constructor(page) {
    this.page = page;

    // Locators — derived from UnifiedLogin.js source
    this.emailInput    = page.getByPlaceholder('Enter email or 10-digit phone number');
    this.passwordInput = page.getByPlaceholder('Enter your password');
    this.signInButton  = page.getByRole('button', { name: 'Sign in' });
  }

  /** Navigate to the login page — app login route is /login */
  async goto() {
    await this.page.goto('/login');
  }

  /** Log in with the provided credentials */
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  /**
   * Assert successful login.
   * Employee accounts redirect to / after login.
   * Waits until the URL is no longer /login (works for both employee and admin).
   */
  async assertLoggedIn() {
    await this.page.waitForURL(
      url => !url.pathname.startsWith('/login'),
      { timeout: 15000 }
    );
  }
}

module.exports = { LoginPage };
