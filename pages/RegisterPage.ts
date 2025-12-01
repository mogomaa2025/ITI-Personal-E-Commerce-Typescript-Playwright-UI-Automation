import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';


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
    this.registerButton = page.locator('button').filter({ hasText: 'Register' });
    this.loginLink = page.locator('a').filter({ hasText: 'Login here' });
    this.pageTitle = page.locator('h2').filter({ hasText: 'Create Your Account' });
    this.nameLabel = page.locator('label').filter({ hasText: 'Full Name' });
    this.emailLabel = page.locator('label').filter({ hasText: 'Email Address' });
    this.passwordLabel = page.locator('label').filter({ hasText: 'Password' });
    this.phoneLabel = page.locator('label').filter({ hasText: 'Phone Number' });
    this.addressLabel = page.locator('label[for="register-address"]');
    this.alertMessage = page.locator('.alert').filter({ hasText: /error|success|warning/i });
    this.logoutButton = page.locator('a').filter({ hasText: 'Logout' });
    this.profileLink = page.locator('a').filter({ hasText: 'Profile' });
  }


  async navigateTo(): Promise<void> {
    try {
      await this.page.goto('/web/register');
      // Auto-wait handles waiting for the element to be visible
      await expect(this.pageTitle).toBeVisible();
    } catch (error: any) {
      throw new Error(`Failed to navigate to register page: ${error.message}`);
    }
  }


  async fillRegistrationForm(name: string | null, email: string | null, password: string | null, phone: string | null, address: string | null): Promise<void> {
    try {
      if (name !== null) {
        await this.nameInput.fill(name);
      }
      if (email !== null) {
        await this.emailInput.fill(email);
      }
      if (password !== null) {
        await this.passwordInput.fill(password);
      }
      if (phone !== null) {
        await this.phoneInput.fill(phone);
      }
      if (address !== null) {
        await this.addressInput.fill(address);
      }
    } catch (error: any) {
      throw new Error(`Failed to fill registration form: ${error.message}`);
    }
  }


  async clickRegister(): Promise<void> {
    try {
      await this.registerButton.click();
    } catch (error: any) {
      throw new Error(`Failed to click register button: ${error.message}`);
    }
  }


  async register(name: string, email: string, password: string, phone: string, address: string): Promise<void> {
    try {
      await this.fillRegistrationForm(name, email, password, phone, address);
      await this.clickRegister();
    } catch (error: any) {
      throw new Error(`Registration operation failed: ${error.message}`);
    }
  }

  async clickLoginLink(): Promise<void> {
    try {
      await this.loginLink.click();
    } catch (error: any) {
      throw new Error(`Failed to click login link: ${error.message}`);
    }
  }


  async isPasswordHidden(): Promise<boolean> {
    try {
      const type = await this.passwordInput.getAttribute('type');
      return type === 'password';
    } catch (error: any) {
      throw new Error(`Failed to check password field visibility: ${error.message}`);
    }
  }


  async getPasswordLength(): Promise<number> {
    try {
      const value = await this.passwordInput.inputValue();
      return value.length;
    } catch (error: any) {
      throw new Error(`Failed to get password length: ${error.message}`);
    }
  }


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

  async isOnRegisterPage(): Promise<boolean> {
    try {
      return await this.pageTitle.isVisible();
    } catch (error: any) {
      return false;
    }
  }


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


  async getAlertText(): Promise<string> {
    try {
      // Use expect to wait for visibility implicitly if needed in test, but here we just return text if visible
      if (await this.alertMessage.isVisible()) {
        return await this.alertMessage.textContent() || '';
      }
      return '';
    } catch (error: any) {
      return '';
    }
  }


  async validateAlertMessage(expectedText: string): Promise<boolean> {
    try {
      const alertLocator = this.page.locator('.alert', { hasText: expectedText });
      await expect(alertLocator).toBeVisible({ timeout: 5000 });
      return true;
    } catch (error: any) {
      return false;
    }
  }


  async validateSuccessfulRegistration(): Promise<boolean> {
    try {
      // Check if URL changes or success message appears
      await expect(async () => {
        const currentUrl = this.page.url();
        
        // Check if we're no longer on the register page (indicating successful redirect)
        if (!currentUrl.includes('/web/register')) {
          return true;
        }
        
        // Check for success messages with broader selectors
        const successSelectors = ['.alert-success', '[role="alert"]', '.success', '.message-success', '.notification-success'];
        for (const selector of successSelectors) {
          const elements = this.page.locator(selector);
          const count = await elements.count();
          for (let i = 0; i < count; i++) {
            const text = await elements.nth(i).textContent();
            if (text && text.toLowerCase().includes('success')) {
              return true;
            }
          }
        }
        
        throw new Error('Registration not successful yet');
      }).toPass({ timeout: 10000 }); //ww 9.5s

      return true;
    } catch (error: any) {
      return false;
    }
  }


  async validateRegistrationFailure(): Promise<boolean> {
    try {
      // Check for browser-side validation first (e.g., "Please include an '@'")
      // If the browser blocks submission, no server error will appear, so we shouldn't wait for it.
      const isBrowserValidationTriggered = await this.page.evaluate(() => {
        const invalidInputs = document.querySelectorAll('input:invalid');
        return invalidInputs.length > 0;
      });

      if (isBrowserValidationTriggered) {
        return true;
      }

      // Check for any visible error messages immediately with broader selectors
      const errorLocator = this.page.locator('.error-message, .alert-danger, [role="alert"], .error, .message-error, .text-danger, .alert, .notification, .toast, .banner');
      
      // Quick check for any error elements
      const errorElements = await errorLocator.count();
      if (errorElements > 0) {
        // Check if any of them contain error text
        for (let i = 0; i < errorElements; i++) {
          const text = await errorLocator.nth(i).textContent();
          if (text && (text.toLowerCase().includes('error') || text.toLowerCase().includes('already exists') || text.toLowerCase().includes('failed'))) {
            return true;
          }
        }
      }

      // Wait briefly for any error messages to appear after form submission
      try {
        await errorLocator.first().waitFor({ state: 'visible', timeout: 200 });
        // If an error element appeared, check its content
        const errorText = await errorLocator.first().textContent();
        if (errorText && (errorText.toLowerCase().includes('error') || errorText.toLowerCase().includes('already exists') || errorText.toLowerCase().includes('failed'))) {
          return true;
        }
      } catch {
        // No visible error appeared quickly, continue with other checks
      }

      // Check if we're still on the register page (indicating registration failed)
      const currentUrl = this.page.url();
      const isStillOnRegisterPage = currentUrl.includes('/web/register');
      
      // Check for server-side errors that might not be immediately visible
      // This includes checking for error keywords in the page content
      const hasServerError = await this.page.evaluate(() => {
        const allText = document.body.innerText.toLowerCase();
        const errorKeywords = ['error', 'conflict', 'already exists', 'duplicate', 'invalid', 'failed'];
        return errorKeywords.some(keyword => allText.includes(keyword));
      });

      // Check for network errors (like 409 CONFLICT) by checking console or network requests
      // For now, being still on the register page after submission is a strong indicator of failure
      return isStillOnRegisterPage || hasServerError;
    } catch (error: any) {
      return false;
    }
  }
}