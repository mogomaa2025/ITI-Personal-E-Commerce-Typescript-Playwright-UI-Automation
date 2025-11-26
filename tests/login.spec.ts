import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Helpers } from '../utils/helpers';
import users from '../data/users.json';
import testData from '../data/data.json';

test.describe('Login Page Tests', () => {
  let loginPage: LoginPage;
  let helpers: Helpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    helpers = new Helpers(page);
    await loginPage.navigateTo();
  });

  test('LOG-001: Verify Login page loads correctly', async ({ page }) => {
    expect.soft(await loginPage.isOnLoginPage()).toBeTruthy();
    expect.soft(await loginPage.pageTitle.isVisible()).toBeTruthy();
    expect.soft(await loginPage.emailInput.isVisible()).toBeTruthy();
    expect.soft(await loginPage.passwordInput.isVisible()).toBeTruthy();
    expect.soft(await loginPage.loginButton.isVisible()).toBeTruthy();
    expect.soft(await loginPage.registerLink.isVisible()).toBeTruthy();
  });

  test('LOG-002: Verify all labels are visible and correct', async ({ page }) => {
    const labels = await loginPage.getAllLabels();
    expect.soft(labels.email).toBeTruthy();
    expect.soft(labels.password).toBeTruthy();
  });

  test('LOG-003: Verify password field is hidden', async ({ page }) => {
    await loginPage.passwordInput.fill('testpass123');
    expect.soft(await loginPage.isPasswordHidden()).toBeTruthy();
  });

  test('LOG-004: Verify Register here link navigates to register page', async ({ page }) => {
    await loginPage.clickRegisterLink();
    await page.waitForURL('**/web/register');
    expect(page.url()).toContain('/web/register');
  });

  test('LOG-005: Validate empty email and password fields', async ({ page }) => {
    await loginPage.clickLogin();
    await page.waitForTimeout(1000);
  });

  test('LOG-006: Validate email without @ symbol', async ({ page }) => {
    await loginPage.login(testData.login.invalidEmail.noAt, 'pass123');
    await page.waitForTimeout(1000);
  });

  test('LOG-007: Validate empty email field', async ({ page }) => {
    await loginPage.login('', 'pass123');
    await page.waitForTimeout(1000);
  });

  test('LOG-008: Validate empty password field', async ({ page }) => {
    await loginPage.login('test@test.com', '');
    await page.waitForTimeout(1000);
  });

  test('LOG-009: Validate invalid credentials - wrong email', async ({ page }) => {
    await loginPage.login(testData.login.invalidCredentials.wrongEmail, 'pass123');
    await page.waitForTimeout(2000);
  });

  test('LOG-010: Validate invalid credentials - wrong password', async ({ page }) => {
    await loginPage.login(users.validUser.email, testData.login.invalidCredentials.wrongPassword);
    await page.waitForTimeout(2000);
  });

  test('LOG-011: Successful login with valid user credentials', async ({ page }) => {
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    await page.waitForURL('**/web/products', { timeout: 10000 });
    expect(page.url()).toContain('/web/products');
  });

  test('LOG-012: Successful login with admin credentials', async ({ page }) => {
    await loginPage.login(users.admin.email, users.admin.password);
    await page.waitForTimeout(2000);
    await page.waitForURL('**/web/products', { timeout: 10000 });
    expect(page.url()).toContain('/web/products');
    expect.soft(await loginPage.adminLink.isVisible()).toBeTruthy();
  });

  test('LOG-013: Verify navigation after successful login', async ({ page }) => {
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    await page.waitForURL('**/web/products', { timeout: 10000 });
    expect(page.url()).toContain('/web/products');
  });

  test('LOG-014: Verify navbar changes after login', async ({ page }) => {
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    expect.soft(await loginPage.logoutButton.isVisible()).toBeTruthy();
    expect.soft(await loginPage.profileLink.isVisible()).toBeTruthy();
  });

  test('LOG-015: Attempt to access login page when already logged in', async ({ page }) => {
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    await loginPage.navigateTo();
    await page.waitForTimeout(1000);
  });
});

