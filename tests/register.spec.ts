import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { Helpers } from '../utils/helpers';
import users from '../data/users.json';
import testData from '../data/data.json';

test.describe('Register Page Tests', () => {
  let registerPage: RegisterPage;
  let helpers: Helpers;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    helpers = new Helpers(page);
    await registerPage.navigateTo();
  });

  test('REG-001: Verify Register page loads correctly', async ({ page }) => {
    expect.soft(await registerPage.isOnRegisterPage()).toBeTruthy();
    expect.soft(await registerPage.pageTitle.isVisible()).toBeTruthy();
    expect.soft(await registerPage.nameInput.isVisible()).toBeTruthy();
    expect.soft(await registerPage.emailInput.isVisible()).toBeTruthy();
    expect.soft(await registerPage.passwordInput.isVisible()).toBeTruthy();
    expect.soft(await registerPage.phoneInput.isVisible()).toBeTruthy();
    expect.soft(await registerPage.addressInput.isVisible()).toBeTruthy();
    expect.soft(await registerPage.registerButton.isVisible()).toBeTruthy();
    expect.soft(await registerPage.loginLink.isVisible()).toBeTruthy();
  });

  test('REG-002: Verify all labels are visible and correct', async ({ page }) => {
    const labels = await registerPage.getAllLabels();
    expect.soft(labels.name).toBeTruthy();
    expect.soft(labels.email).toBeTruthy();
    expect.soft(labels.password).toBeTruthy();
    expect.soft(labels.phone).toBeTruthy();
    expect.soft(labels.address).toBeTruthy();
  });



  test('REG-003: Verify password field is hidden', async ({ page }) => {
    await registerPage.passwordInput.fill('testpass123');
    expect.soft(await registerPage.isPasswordHidden()).toBeTruthy();
  });

  test('REG-004: Verify Login here link navigates to login page', async ({ page }) => {
    await registerPage.clickLoginLink();
    await page.waitForURL('**/web/login');
    expect(page.url()).toContain('/web/login');
  });

  test('REG-005: Validate name too short (BVA - less than 3 chars)', async ({ page }) => {
    await registerPage.register(
      testData.register.invalidName.tooShort,
      'test@test.com',
      'pass123',
      '+1234567890',
      'Test Address'
    );
    await helpers.waitForAlertToAppear('Name must be at least 3 characters long');
    const alertText = await registerPage.getAlertText();
    expect.soft(alertText).toContain('Name must be at least 3 characters long');
  });

  test('REG-006: Validate name with exactly 3 characters (BVA - boundary)', async ({ page }) => {
    await registerPage.register(
      'ABC',
      'test' + Date.now() + '@test.com',
      'pass123',
      '+1234567890',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-007: Validate empty name field', async ({ page }) => {
    await registerPage.register(
      '',
      'test@test.com',
      'pass123',
      '+1234567890',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-008: Validate email without @ symbol', async ({ page }) => {
    await registerPage.register(
      'Test User',
      testData.register.invalidEmail.noAt,
      'pass123',
      '+1234567890',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-009: Validate empty email field', async ({ page }) => {
    await registerPage.register(
      'Test User',
      '',
      'pass123',
      '+1234567890',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-010: Validate password less than 6 characters (BVA)', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test@test.com',
      testData.register.invalidPassword.tooShort,
      '+1234567890',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-011: Validate password with exactly 6 characters (BVA - boundary)', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test' + Date.now() + '@test.com',
      'test12',
      '+1234567890',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-012: Validate password without number', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test@test.com',
      testData.register.invalidPassword.noNumber,
      '+1234567890',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-013: Validate password without letter', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test@test.com',
      testData.register.invalidPassword.noLetter,
      '+1234567890',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-014: Validate empty password field', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test@test.com',
      '',
      '+1234567890',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-015: Validate phone number too short (BVA - less than 8 chars)', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test@test.com',
      'pass123',
      testData.register.invalidPhone.tooShort,
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-016: Validate phone number with exactly 8 characters (BVA - boundary)', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test' + Date.now() + '@test.com',
      'pass123',
      '+1234567',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-017: Validate phone number too long (BVA - more than 20 chars)', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test@test.com',
      'pass123',
      testData.register.invalidPhone.tooLong,
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-018: Validate phone number with exactly 20 characters (BVA - boundary)', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test' + Date.now() + '@test.com',
      'pass123',
      '+12345678901234567890',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-019: Validate phone number with letters', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test@test.com',
      'pass123',
      testData.register.invalidPhone.withLetters,
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-020: Validate empty phone number field', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test@test.com',
      'pass123',
      '',
      'Test Address'
    );
    await page.waitForTimeout(1000);
  });

  test('REG-021: Validate empty address field', async ({ page }) => {
    await registerPage.register(
      'Test User',
      'test@test.com',
      'pass123',
      '+1234567890',
      ''
    );
    await page.waitForTimeout(1000);
  });

  test('REG-022: Validate all empty fields', async ({ page }) => {
    await registerPage.clickRegister();
    await page.waitForTimeout(1000);
  });

  test('REG-023: Successful registration with valid data', async ({ page }) => {
    const uniqueEmail = 'testuser' + Date.now() + '@test.com';
    await registerPage.register(
      'John Doe',
      uniqueEmail,
      'test123',
      '+1234567890',
      '123 Test Street'
    );
    await page.waitForTimeout(2000);
  });

  test('REG-024: Register with existing user email', async ({ page }) => {
    await registerPage.register(
      'Test User',
      users.validUser.email,
      'pass123',
      '+1234567890',
      'Test Address'
    );
    await page.waitForTimeout(2000);
  });
});

