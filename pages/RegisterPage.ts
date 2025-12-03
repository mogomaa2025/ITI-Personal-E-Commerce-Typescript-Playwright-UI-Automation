import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import urlsData from '../data/urls.json';

export class RegisterPage extends BasePage {


  readonly textboxes: Locator;
  readonly registerButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly registerFormLabels: Locator;
  readonly emailPlaceholder: Locator;
  readonly passwordPlaceholder: Locator;
  readonly phonePlaceholder: Locator;
  readonly addressPlaceholder: Locator;
  readonly fullNamePlaceholder: Locator;
  readonly userAlreadyExistsAlert: Locator;
  readonly userSuccessRegisterALert: Locator;
  readonly registerCart: Locator;
  readonly registerFormSnapshot: string;


  constructor(page: Page) {
    super(page);
    // by role
    this.textboxes = this.page.getByRole('textbox');
    this.registerButton = this.page.getByRole('button', { name: 'Register' });
    this.registerCart = this.page.locator('#register-card');

    // by texts
    this.fullNamePlaceholder = this.page.getByRole('textbox', { name: 'Full Name' });
    this.emailPlaceholder = this.page.getByRole('textbox', { name: 'Email Addres' });
    this.passwordPlaceholder = this.page.getByRole('textbox', { name: 'Password' });
    this.phonePlaceholder = this.page.getByRole('textbox', { name: 'Phone Number' });
    this.addressPlaceholder = this.page.getByRole('textbox', { name: 'Address' });
    this.userAlreadyExistsAlert = this.page.getByText("User already exists");
    this.userSuccessRegisterALert = this.page.getByText("Registration successful! Please login.");


    //by locator
    this.successMessage = this.page.locator('.alert-success');
    this.errorMessage = this.page.locator('.alert-danger, .error-message, [role="alert"]');
    this.registerFormLabels = this.page.locator('#register-form');

    //by snapshot
    this.registerFormSnapshot = `
    - heading "Create Your Account" [level=2]
    - text: Full Name
    - textbox "Full Name"
    - text: Email Address
    - textbox "Email Address"
    - text: Password
    - textbox "Password"
    - text: Phone Number
    - textbox "Phone Number"
    - text: Address
    - textbox "Address"
    - button "Register"
    - paragraph:
      - text: Already have an account?
      - link "Login here":
        - /url: /web/login
    `
  }

  /**
   * Navigates to the registration page.
   */
  async goto() {
    await this.page.goto(urlsData.registerUrl);
  }

  async register({ name, email, password, phone, address }: { name: string; email: string; password: string; phone: string; address: string }) {
    await this.textboxes.nth(0).fill(name);
    await this.textboxes.nth(1).fill(email);
    await this.textboxes.nth(2).fill(password);
    await this.textboxes.nth(3).fill(phone);
    await this.textboxes.nth(4).fill(address);
    await this.registerButton.click();
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

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async getSuccessMessage() {
    return await this.successMessage.textContent();
  }
}