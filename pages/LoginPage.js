// pages/LoginPage.js
// Page Object Model for the IDealtrendz Unified Login page

class LoginPage {
  constructor(page) {
    this.page = page;

    // Locators — derived from UnifiedLogin.js source
    this.emailInput    = page.getByPlaceholder('Enter email or 10-digit phone number');
    this.passwordInput = page.getByPlaceholder('Enter your password');
    this.signInButton  = page.getByRole('button', { name: 'Sign in' });

    // Post-login assertion targets
    this.welcomeMessage   = page.getByText("Welcome back! Here's what's happening today.");
    this.dashboardHeading = page.getByText('Dashboard Overview');
  }

  /** Navigate to the login page */
  async goto() {
    await this.page.goto('/');
  }

  /** Log in with the provided credentials */
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  /** Assert that the dashboard is visible after a successful login */
  async assertLoggedIn() {
    await this.welcomeMessage.waitFor({ state: 'visible' });
    await this.dashboardHeading.waitFor({ state: 'visible' });
  }
}

module.exports = { LoginPage };
