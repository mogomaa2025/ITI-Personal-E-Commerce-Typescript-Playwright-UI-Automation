import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the register page
 * Implements the Page Object Model pattern with proper error handling and type safety
 */
export class RegisterPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly registerButton: Locator;
  readonly loginLink: Locator;
  readonly pageTitle: Locator;
  readonly nameLabel: Locator;
  readonly emailLabel: Locator;
  readonly passwordLabel: Locator;
  readonly phoneLabel: Locator;
  readonly addressLabel: Locator;
  readonly alertMessage: Locator;
  readonly logoutButton: Locator;
  readonly profileLink: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('#register-name');
    this.emailInput = page.locator('#register-email');
    this.passwordInput = page.locator('#register-password');
    this.phoneInput = page.locator('#register-phone');
    this.addressInput = page.locator('#register-address');
    this.registerButton = page.locator('button:has-text("Register")');
    this.loginLink = page.locator('a:has-text("Login here")');
    this.pageTitle = page.locator('h2:has-text("Create Your Account")');
    this.nameLabel = page.locator('label:has-text("Full Name")');
    this.emailLabel = page.locator('label:has-text("Email Address")');
    this.passwordLabel = page.locator('label:has-text("Password")');
    this.phoneLabel = page.locator('label:has-text("Phone Number")');
    this.addressLabel = page.locator('label[for="register-address"]');
    this.alertMessage = page.locator('.alert', { hasText: /error|success|warning/i });
    this.logoutButton = page.locator('a:has-text("Logout")');
    this.profileLink = page.locator('a:has-text("Profile")');
  }

  /**
   * Navigates to the register page and waits for it to load
   */
  async navigateTo(): Promise<void> {
    try {
      await this.page.goto('/web/register');
      await this.page.waitForLoadState('networkidle');
      await this.pageTitle.waitFor({ state: 'visible' });
    } catch (error: any) {
      throw new Error(`Failed to navigate to register page: ${error.message}`);
    }
  }

  /**
   * Fills the registration form with provided data
   * @param name - Full name for registration
   * @param email - Email address for registration
   * @param password - Password for account
   * @param phone - Phone number for account
   * @param address - Address for account
   */
  async fillRegistrationForm(name: string | null, email: string | null, password: string | null, phone: string | null, address: string | null): Promise<void> {
    try {
      if (name !== null) {
        await this.nameInput.waitFor({ state: 'visible' });
        await this.nameInput.fill(name);
      }
      if (email !== null) {
        await this.emailInput.waitFor({ state: 'visible' });
        await this.emailInput.fill(email);
      }
      if (password !== null) {
        await this.passwordInput.waitFor({ state: 'visible' });
        await this.passwordInput.fill(password);
      }
      if (phone !== null) {
        await this.phoneInput.waitFor({ state: 'visible' });
        await this.phoneInput.fill(phone);
      }
      if (address !== null) {
        await this.addressInput.waitFor({ state: 'visible' });
        await this.addressInput.fill(address);
      }
    } catch (error: any) {
      throw new Error(`Failed to fill registration form: ${error.message}`);
    }
  }

  /**
   * Clicks the register button and waits for response
   */
  async clickRegister(): Promise<void> {
    try {
      await this.registerButton.scrollIntoViewIfNeeded();
      await this.registerButton.waitFor({ state: 'visible' });
      await this.registerButton.click();
      // Wait for network activity to settle after submission
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Failed to click register button: ${error.message}`);
    }
  }

  /**
   * Performs a complete registration operation with provided data
   * @param name - Full name for registration
   * @param email - Email address for registration
   * @param password - Password for account
   * @param phone - Phone number for account
   * @param address - Address for account
   */
  async register(name: string, email: string, password: string, phone: string, address: string): Promise<void> {
    try {
      await this.fillRegistrationForm(name, email, password, phone, address);
      await this.clickRegister();
    } catch (error: any) {
      throw new Error(`Registration operation failed: ${error.message}`);
    }
  }

  /**
   * Clicks the login link and waits for navigation
   */
  async clickLoginLink(): Promise<void> {
    try {
      await this.loginLink.scrollIntoViewIfNeeded();
      await this.loginLink.waitFor({ state: 'visible' });
      await this.loginLink.click();
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Failed to click login link: ${error.message}`);
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
   * Gets the current length of the password input value
   */
  async getPasswordLength(): Promise<number> {
    try {
      const value = await this.passwordInput.inputValue();
      return value.length;
    } catch (error: any) {
      throw new Error(`Failed to get password length: ${error.message}`);
    }
  }

  /**
   * Clears all form fields
   */
  async clearForm(): Promise<void> {
    try {
      await this.nameInput.clear();
      await this.emailInput.clear();
      await this.passwordInput.clear();
      await this.phoneInput.clear();
      await this.addressInput.clear();
    } catch (error: any) {
      throw new Error(`Failed to clear form: ${error.message}`);
    }
  }

  /**
   * Checks if the current page is the register page
   */
  async isOnRegisterPage(): Promise<boolean> {
    try {
      await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
      return await this.pageTitle.isVisible();
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Gets visibility status of all form labels
   */
  async getAllLabels(): Promise<{ name: boolean; email: boolean; password: boolean; phone: boolean; address: boolean }> {
    try {
      return {
        name: await this.nameLabel.isVisible(),
        email: await this.emailLabel.isVisible(),
        password: await this.passwordLabel.isVisible(),
        phone: await this.phoneLabel.isVisible(),
        address: await this.addressLabel.isVisible()
      };
    } catch (error: any) {
      throw new Error(`Failed to get label visibility: ${error.message}`);
    }
  }

  /**
   * Gets the text content of any visible alert message
   */
  async getAlertText(): Promise<string> {
    try {
      await this.alertMessage.waitFor({ state: 'visible', timeout: 5000 });
      return await this.alertMessage.textContent() || '';
    } catch (error: any) {
      return '';
    }
  }

  /**
   * Validates if an alert message with specific text is visible
   * @param expectedText - Text that should be contained in the alert message
   */
  async validateAlertMessage(expectedText: string): Promise<boolean> {
    try {
      await this.page.waitForLoadState('networkidle');
      const alertLocator = this.page.locator('.alert', { hasText: expectedText });
      await alertLocator.waitFor({ state: 'visible', timeout: 5000 });
      const alertText = await alertLocator.textContent();
      return alertText !== null && alertText.includes(expectedText);
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Validates successful registration by checking for post-registration elements
   */
  async validateSuccessfulRegistration(): Promise<boolean> {
    try {
      // Wait for navigation after successful registration
      // After successful registration, user might be redirected to login page or other page
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });

      // Check the URL to see if user moved away from register page
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/web/register')) {
        return true; // User moved to another page after registration
      }

      // Alternatively, check for success message if present
      const successMessage = this.page.locator('.alert-success, .alert-success, [role="alert"]:has-text("success")');
      try {
        await successMessage.waitFor({ state: 'visible', timeout: 5000 });
        return true;
      } catch {
        return false;
      }
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Validates that registration failed by checking for error messages
   */
  async validateRegistrationFailure(): Promise<boolean> {
    try {
      // Wait a bit to allow any error messages to appear after the registration attempt
      await this.page.waitForLoadState('networkidle');
      const errorLocator = this.page.locator('.error-message, .alert-danger, [role="alert"], .error, .message-error, .text-danger');
      try {
        await errorLocator.waitFor({ state: 'visible', timeout: 2000 });
        return true;
      } catch {
        // If no error appears within timeout, but we're still on register page, it might indicate failure
        return this.page.url().includes('/web/register');
      }
    } catch (error: any) {
      return false;
    }
  }
}
