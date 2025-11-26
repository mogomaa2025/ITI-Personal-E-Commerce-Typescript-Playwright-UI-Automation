import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly pageTitle: Locator;
  readonly emailLabel: Locator;
  readonly passwordLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[placeholder="Enter your email"]');
    this.passwordInput = page.locator('input[placeholder="Enter your password"]');
    this.loginButton = page.locator('button:has-text("Login")');
    this.registerLink = page.locator('a:has-text("Register here")');
    this.pageTitle = page.locator('h2:has-text("Login to Your Account")');
    this.emailLabel = page.locator('text=Email Address').first();
    this.passwordLabel = page.locator('text=Password').first();
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/web/login');
    await this.page.waitForLoadState('networkidle');
  }

  async fillLoginForm(email: string | null, password: string | null): Promise<void> {
    if (email !== null) await this.emailInput.fill(email);
    if (password !== null) await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.scrollIntoViewIfNeeded();
    await this.loginButton.click();
    await this.page.waitForTimeout(1000);
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillLoginForm(email, password);
    await this.clickLogin();
  }

  async clickRegisterLink(): Promise<void> {
    await this.registerLink.scrollIntoViewIfNeeded();
    await this.registerLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isPasswordHidden(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'password';
  }

  async clearForm(): Promise<void> {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  async isOnLoginPage(): Promise<boolean> {
    await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
    return await this.pageTitle.isVisible();
  }

  async getAllLabels(): Promise<{ email: boolean; password: boolean }> {
    return {
      email: await this.emailLabel.isVisible(),
      password: await this.passwordLabel.isVisible()
    };
  }
}
