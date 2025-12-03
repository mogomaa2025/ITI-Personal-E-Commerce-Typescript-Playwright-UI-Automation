import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import urlsData from '../data/urls.json'


export class LoginPage extends BasePage {

  // Locators using roles and accessible names for robustness
  readonly textboxes: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly logoutButton: Locator;
  readonly pageTitle: Locator;
  readonly errorMessageAlert: Locator;
  readonly successMessageAlert: Locator;
  readonly loginCart: Locator;
  readonly loginFormSnapshot: string;
  readonly emailPlaceholder: Locator;
  readonly passwordPlaceholder: Locator;
    readonly pleaseLoginMessage: Locator;

  constructor(page: Page) {
    super(page);

    // by locators
    this.loginCart = this.page.locator('#login-card');


    // by roles
    this.pageTitle = this.page.getByRole('heading', { name: 'Login to Your Account' });
    this.textboxes = this.page.getByRole('textbox');
    this.loginButton = this.page.getByRole('button', { name: 'Login' });
    this.registerLink = this.page.getByRole('link', { name: 'Register here' });
    this.emailPlaceholder = this.page.getByRole('textbox', { name: 'Email Addres' });
    this.passwordPlaceholder = this.page.getByRole('textbox', { name: 'Password' });
    this.logoutButton = this.page.getByRole('button', { name: 'Logout' });



    //by texts
    this.errorMessageAlert = this.page.getByText("Invalid credentials");
    this.successMessageAlert = this.page.getByText("Login successful!");
    this.pleaseLoginMessage = this.page.getByText("Please login to access your account.");


    //by snapshots
    this.loginFormSnapshot = `
    - heading "Login to Your Account" [level=2]
    - text: Email Address
    - textbox "Email Address"
    - text: Password
    - textbox "Password"
    - button "Login"
    - paragraph:
      - text: Don't have an account?
      - link "Register here":
        - /url: /web/register
    `
  }

  async getEmailValidationMessage() {
    return await this.emailPlaceholder.evaluate((element: HTMLInputElement) => {
      return element.validationMessage;
    });
  }


  async getPasswordValidationMessage() {
    return await this.passwordPlaceholder.evaluate((element: HTMLInputElement) => {
      return element.validationMessage;
    });
  }

  /**
   * Navigates to the login page.
   */
  async goto() {
    await this.page.goto(urlsData.loginUrl);
  }

  async login(email: string, password: string) {
    await this.textboxes.nth(0).fill(email);
    await this.textboxes.nth(1).fill(password);
    await this.loginButton.click();
  }



  async getPageTitle() {
    return await this.pageTitle.textContent();
  }
}