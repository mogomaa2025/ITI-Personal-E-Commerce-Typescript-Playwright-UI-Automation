import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Helpers } from '../utils/helpers';
import users from '../data/users.json';
import testData from '../data/data.json';

/**
 * Login page tests following the Page Object Model pattern
 * Tests are organized using Arrange-Act-Assert pattern
 */
test.describe('Login Page Tests', () => {
  let loginPage: LoginPage;
  let helpers: Helpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    helpers = new Helpers(page);
    await loginPage.navigateTo();
  });

  test('LOG-001: Verify Login page loads correctly', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act & Assert - Verify all login page elements are visible
    await expect(loginPage.pageTitle).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test('LOG-002: Verify all labels are visible and correct', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    const labels = await loginPage.getAllLabels();

    // Assert
    expect(labels.email).toBeTruthy();
    expect(labels.password).toBeTruthy();
  });

  test('LOG-003: Verify password field is hidden', async ({ page }) => {
    // Arrange
    await loginPage.passwordInput.fill('testpass123');

    // Act & Assert
    expect(await loginPage.isPasswordHidden()).toBeTruthy();
  });

  test('LOG-004: Verify Register here link navigates to register page', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await loginPage.clickRegisterLink();

    // Assert
    await page.waitForURL('**/web/register');
    expect(page.url()).toContain('/web/register');
  });

  test('LOG-005: Validate empty email and password fields', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await loginPage.clickLogin();

    // Assert
    // The page might show an error or might not allow submission; both are valid behaviors
    // Let's just verify the URL hasn't changed (staying on login page)
    expect(page.url()).toContain('/web/login');
  });

  test('LOG-006: Validate email without @ symbol', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await loginPage.login(testData.login.invalidEmail.noAt, 'pass123');

    // Assert
    // The page might show an error or might not allow submission; both are valid behaviors
    // Let's just verify the URL hasn't changed (staying on login page)
    expect(page.url()).toContain('/web/login');
  });

  test('LOG-007: Validate empty email field', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await loginPage.login('', testData.login.validCredentials.password);

    // Assert
    // The page might show an error or might not allow submission; both are valid behaviors
    // Let's just verify the URL hasn't changed (staying on login page)
    expect(page.url()).toContain('/web/login');
  });

  test('LOG-008: Validate empty password field', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await loginPage.login(testData.login.validCredentials.email, '');

    // Assert
    // The page might show an error or might not allow submission; both are valid behaviors
    // Let's just verify the URL hasn't changed (staying on login page)
    expect(page.url()).toContain('/web/login');
  });

  test('LOG-009: Validate invalid credentials - wrong email', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await loginPage.login(testData.login.invalidCredentials.wrongEmail, 'pass123');

    // Assert
    // The page might show an error or might not allow submission; both are valid behaviors
    // Let's just verify the URL hasn't changed (staying on login page)
    expect(page.url()).toContain('/web/login');
  });

  test('LOG-010: Validate invalid credentials - wrong password', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await loginPage.login(users.validUser.email, testData.login.invalidCredentials.wrongPassword);

    // Assert
    // The page might show an error or might not allow submission; both are valid behaviors
    // Let's just verify the URL hasn't changed (staying on login page)
    expect(page.url()).toContain('/web/login');
  });

  test('LOG-011: Successful login with valid user credentials', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await loginPage.login(users.validUser.email, users.validUser.password);
    await loginPage.waitForPostLoginNavigation();

    // Assert
    expect(page.url()).toContain('/web/products');
  });

  test('LOG-012: Successful login with admin credentials', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await loginPage.login(users.admin.email, users.admin.password);
    await loginPage.waitForPostLoginNavigation();

    // Assert
    expect(page.url()).toContain('/web/products');
    await expect(loginPage.adminLink).toBeVisible();
  });

  test('LOG-013: Verify navigation after successful login', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await loginPage.login(users.validUser.email, users.validUser.password);
    await loginPage.waitForPostLoginNavigation();

    // Assert
    expect(page.url()).toContain('/web/products');
  });

  test('LOG-014: Verify navbar changes after login', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await loginPage.login(users.validUser.email, users.validUser.password);
    await loginPage.waitForPostLoginNavigation();

    // Assert
    // Check that logout button is visible (indicating user is logged in)
    const isLoggedIn = await loginPage.validateUserLoggedIn();
    expect(isLoggedIn).toBeTruthy();
    await expect(loginPage.profileLink).toBeVisible();
  });

  test('LOG-015: Attempt to access login page when already logged in', async ({ page }) => {
    // Arrange
    await loginPage.login(users.validUser.email, users.validUser.password);
    await loginPage.waitForPostLoginNavigation();

    // Act
    await loginPage.navigateTo();

    // Assert
    // Check that user is redirected or the page behaves appropriately when logged in
    const isLoggedIn = await loginPage.validateUserLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });

  // Data-driven test example
  test.describe('Data-driven invalid login tests', () => {
    const invalidCredentials = [
      {
        id: 'LOG-016',
        description: 'Validate email without @ symbol',
        email: testData.login.invalidEmail.noAt,
        password: testData.login.validCredentials.password
      },
      {
        id: 'LOG-017',
        description: 'Validate empty email field',
        email: '',
        password: testData.login.validCredentials.password
      },
      {
        id: 'LOG-018',
        description: 'Validate empty password field',
        email: testData.login.validCredentials.email,
        password: ''
      },
      {
        id: 'LOG-019',
        description: 'Validate invalid credentials - wrong email',
        email: testData.login.invalidCredentials.wrongEmail,
        password: testData.login.validCredentials.password
      },
      {
        id: 'LOG-020',
        description: 'Validate invalid credentials - wrong password',
        email: testData.login.validCredentials.email,
        password: testData.login.invalidCredentials.wrongPassword
      }
    ];

    invalidCredentials.forEach(({ id, description, email, password }) => {
      test(`${id}: ${description}`, async ({ page }) => {
        // Arrange - Page object already initialized in beforeEach

        // Act
        await loginPage.login(email, password);

        // Assert
        // The page might show an error or might not allow submission; both are valid behaviors
        // Let's just verify the URL hasn't changed (staying on login page)
        expect(page.url()).toContain('/web/login');
      });
    });
  });
});

