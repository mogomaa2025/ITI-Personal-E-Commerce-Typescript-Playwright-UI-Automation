import { Page, Locator } from '@playwright/test';
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
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/web/register');
    await this.page.waitForLoadState('networkidle');
  }

  async fillRegistrationForm(name: string | null, email: string | null, password: string | null, phone: string | null, address: string | null): Promise<void> {
    if (name !== null) await this.nameInput.fill(name);
    if (email !== null) await this.emailInput.fill(email);
    if (password !== null) await this.passwordInput.fill(password);
    if (phone !== null) await this.phoneInput.fill(phone);
    if (address !== null) await this.addressInput.fill(address);
  }

  async clickRegister(): Promise<void> {
    await this.registerButton.scrollIntoViewIfNeeded();
    await this.registerButton.click();
    await this.page.waitForTimeout(1000);
  }

  async register(name: string, email: string, password: string, phone: string, address: string): Promise<void> {
    await this.fillRegistrationForm(name, email, password, phone, address);
    await this.clickRegister();
  }

  async clickLoginLink(): Promise<void> {
    await this.loginLink.scrollIntoViewIfNeeded();
    await this.loginLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isPasswordHidden(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'password';
  }

  async getPasswordLength(): Promise<number> {
    return await this.passwordInput.inputValue().then(val => val.length);
  }

  async clearForm(): Promise<void> {
    await this.nameInput.clear();
    await this.emailInput.clear();
    await this.passwordInput.clear();
    await this.phoneInput.clear();
    await this.addressInput.clear();
  }

  async isOnRegisterPage(): Promise<boolean> {
    await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
    return await this.pageTitle.isVisible();
  }

  async getAllLabels(): Promise<{ name: boolean; email: boolean; password: boolean; phone: boolean; address: boolean }> {
    return {
      name: await this.nameLabel.isVisible(),
      email: await this.emailLabel.isVisible(),
      password: await this.passwordLabel.isVisible(),
      phone: await this.phoneLabel.isVisible(),
      address: await this.addressLabel.isVisible()
    };
  }
}
