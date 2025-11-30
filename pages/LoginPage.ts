import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the login page
 * Implements the Page Object Model pattern with proper error handling and type safety
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly pageTitle: Locator;
  readonly emailLabel: Locator;
  readonly passwordLabel: Locator;
  readonly logoutButton: Locator;
  readonly profileLink: Locator;
  readonly adminLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[placeholder="Enter your email"]');
    this.passwordInput = page.locator('input[placeholder="Enter your password"]');
    this.loginButton = page.locator('button:has-text("Login")');
    this.registerLink = page.locator('a:has-text("Register here")');
    this.pageTitle = page.locator('h2:has-text("Login to Your Account")');
    this.emailLabel = page.locator('text=Email Address').first();
    this.passwordLabel = page.locator('text=Password').first();
    this.logoutButton = page.locator('a:has-text("Logout")');
    this.profileLink = page.locator('a:has-text("Profile")');
    this.adminLink = page.locator('a:has-text("Admin")');
  }

  /**
   * Navigates to the login page and waits for it to load
   */
  async navigateTo(): Promise<void> {
    try {
      await this.page.goto('/web/login');
      await this.page.waitForLoadState('networkidle');
      // The login page might redirect if already logged in, so check if we're still on the login page
      // If the login page title is visible, we're on the login page
      // If not, we may have been redirected, which is also fine
      try {
        await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
      } catch {
        // If login title isn't visible, we might have been redirected, which is expected behavior
        // Don't throw an error in this case
      }
    } catch (error: any) {
      throw new Error(`Failed to navigate to login page: ${error.message}`);
    }
  }

  /**
   * Waits for navigation after login to complete
   */
  async waitForPostLoginNavigation(): Promise<void> {
    try {
      // Wait for the navigation to start
      await this.page.waitForNavigation({ timeout: 10000 });
      // Wait for the page to load fully
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Navigation after login failed: ${error.message}`);
    }
  }

  /**
   * Fills the login form with provided email and password
   * @param email - Email address to fill
   * @param password - Password to fill
   */
  async fillLoginForm(email: string | null, password: string | null): Promise<void> {
    try {
      if (email !== null) {
        await this.emailInput.waitFor({ state: 'visible' });
        await this.emailInput.fill(email);
      }
      if (password !== null) {
        await this.passwordInput.waitFor({ state: 'visible' });
        await this.passwordInput.fill(password);
      }
    } catch (error: any) {
      throw new Error(`Failed to fill login form: ${error.message}`);
    }
  }

  /**
   * Clicks the login button and waits for the action to complete
   */
  async clickLogin(): Promise<void> {
    try {
      await this.loginButton.scrollIntoViewIfNeeded();
      await this.loginButton.waitFor({ state: 'visible' });
      await this.loginButton.click();
      // Wait for navigation to start (login redirects)
      await this.page.waitForLoadState('domcontentloaded');
    } catch (error: any) {
      throw new Error(`Failed to click login button: ${error.message}`);
    }
  }

  /**
   * Performs a complete login operation with email and password
   * @param email - Email address for login
   * @param password - Password for login
   */
  async login(email: string, password: string): Promise<void> {
    try {
      await this.fillLoginForm(email, password);
      await this.clickLogin();
    } catch (error: any) {
      throw new Error(`Login operation failed: ${error.message}`);
    }
  }

  /**
   * Clicks the register link and waits for navigation
   */
  async clickRegisterLink(): Promise<void> {
    try {
      await this.registerLink.scrollIntoViewIfNeeded();
      await this.registerLink.waitFor({ state: 'visible' });
      await this.registerLink.click();
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Failed to click register link: ${error.message}`);
    }
  }

  /**
   * Checks if the password field is hidden (type='password')
   */
  async isPasswordHidden(): Promise<boolean> {
    try {
      const type = await this.passwordInput.getAttribute('type');
      return type === 'password';
    } catch (error: any) {
      throw new Error(`Failed to check password field visibility: ${error.message}`);
    }
  }

  /**
   * Clears the login form fields
   */
  async clearForm(): Promise<void> {
    try {
      await this.emailInput.clear();
      await this.passwordInput.clear();
    } catch (error: any) {
      throw new Error(`Failed to clear form: ${error.message}`);
    }
  }

  /**
   * Checks if the current page is the login page by verifying the page title
   */
  async isOnLoginPage(): Promise<boolean> {
    try {
      await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
      return await this.pageTitle.isVisible();
    } catch (error: any) {
      // If the title is not visible, we're likely not on the login page
      return false;
    }
  }

  /**
   * Gets visibility status of all form labels
   */
  async getAllLabels(): Promise<{ email: boolean; password: boolean }> {
    try {
      return {
        email: await this.emailLabel.isVisible(),
        password: await this.passwordLabel.isVisible()
      };
    } catch (error: any) {
      throw new Error(`Failed to get label visibility: ${error.message}`);
    }
  }

  /**
   * Validates that the login page elements are visible
   */
  async validateLoginPageElements(): Promise<void> {
    try {
      await this.pageTitle.waitFor({ state: 'visible' });
      await this.emailInput.waitFor({ state: 'visible' });
      await this.passwordInput.waitFor({ state: 'visible' });
      await this.loginButton.waitFor({ state: 'visible' });
      await this.registerLink.waitFor({ state: 'visible' });
    } catch (error: any) {
      throw new Error(`Login page validation failed: ${error.message}`);
    }
  }

  /**
   * Validates error message visibility after login attempt
   */
  async validateErrorMessage(): Promise<boolean> {
    try {
      // Wait for network activity to settle down after the login attempt
      await this.page.waitForLoadState('networkidle', { timeout: 3000 });
      const errorLocator = this.page.locator('.error-message, .alert-danger, [role="alert"], .error, .message-error, .text-danger');
      // Try to wait for error message briefly, if it appears return true, otherwise false
      try {
        await errorLocator.waitFor({ state: 'visible', timeout: 2000 });
        return true;
      } catch {
        // If no error appears within timeout, assume login was successful or no error shown
        return false;
      }
    } catch (error: any) {
      // If there's an error during checking, return false
      return false;
    }
  }

  /**
   * Validates that user is logged in by checking for logout button visibility
   */
  async validateUserLoggedIn(): Promise<boolean> {
    try {
      // Wait for the page to fully load after login
      await this.page.waitForLoadState('networkidle');
      // Look for any logout-related element since the specific text might vary
      const logoutLocator = this.page.locator('a:has-text("Logout"), a:has-text("Sign out"), button:has-text("Logout"), button:has-text("Sign out"), [data-testid="logout"]');
      await logoutLocator.waitFor({ state: 'visible', timeout: 5000 });
      return await logoutLocator.isVisible();
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Validates that admin link is visible for admin users
   */
  async validateAdminLink(): Promise<boolean> {
    try {
      await this.adminLink.waitFor({ state: 'visible', timeout: 10000 });
      return await this.adminLink.isVisible();
    } catch (error: any) {
      return false;
    }
  }
}
