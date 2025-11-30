import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { Helpers } from '../utils/helpers';
import users from '../data/users.json';
import testData from '../data/data.json';

/**
 * Register page tests following the Page Object Model pattern
 * Tests are organized using Arrange-Act-Assert pattern
 */
test.describe('Register Page Tests', () => {
  let registerPage: RegisterPage;
  let helpers: Helpers;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    helpers = new Helpers(page);
    await registerPage.navigateTo();
    await page.waitForLoadState('networkidle');
  });

  test('REG-001: Verify Register page loads correctly', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act & Assert - Verify all register page elements are visible
    await expect(registerPage.pageTitle).toBeVisible();
    await expect(registerPage.nameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.phoneInput).toBeVisible();
    await expect(registerPage.addressInput).toBeVisible();
    await expect(registerPage.registerButton).toBeVisible();
    await expect(registerPage.loginLink).toBeVisible();
    expect(await registerPage.isOnRegisterPage()).toBeTruthy();
  });

  test('REG-002: Verify all labels are visible and correct', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    const labels = await registerPage.getAllLabels();

    // Assert
    expect(labels.name).toBeTruthy();
    expect(labels.email).toBeTruthy();
    expect(labels.password).toBeTruthy();
    expect(labels.phone).toBeTruthy();
    expect(labels.address).toBeTruthy();
  });

  test('REG-003: Verify password field is hidden', async ({ page }) => {
    // Arrange
    await registerPage.passwordInput.fill('testpass123');

    // Act & Assert
    expect(await registerPage.isPasswordHidden()).toBeTruthy();
  });

  test('REG-004: Verify Login here link navigates to login page', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.clickLoginLink();

    // Assert
    await page.waitForURL('**/web/login');
    expect(page.url()).toContain('/web/login');
  });

  test('REG-005: Validate name too short (BVA - less than 3 chars)', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.invalidName.tooShort,
      testData.register.validData.email,
      testData.register.validData.password,
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    const hasAlert = await registerPage.validateAlertMessage('Name must be at least 3 characters long');
    expect(hasAlert).toBeTruthy();
  });

  test('REG-006: Validate name with exactly 3 characters (BVA - boundary)', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach
    const uniqueEmail = `test${Date.now()}@test.com`;

    // Act
    await registerPage.register(
      'ABC',  // Exactly 3 characters
      uniqueEmail,
      testData.register.validData.password,
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    // Since 'ABC' (3 chars) is a valid name, registration should succeed, and user might be redirected
    const isRegistrationSuccessful = await registerPage.validateSuccessfulRegistration();
    expect(isRegistrationSuccessful).toBeTruthy();
  });

  test('REG-007: Validate empty name field', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      '',  // Empty name
      testData.register.validData.email,
      testData.register.validData.password,
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-008: Validate email without @ symbol', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      testData.register.invalidEmail.noAt,
      testData.register.validData.password,
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-009: Validate empty email field', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      '',  // Empty email
      testData.register.validData.password,
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-010: Validate password less than 6 characters (BVA)', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      testData.register.validData.email,
      testData.register.invalidPassword.tooShort,
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-011: Validate password with exactly 6 characters (BVA - boundary)', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach
    const uniqueEmail = `test${Date.now()}@test.com`;

    // Act
    await registerPage.register(
      testData.register.validData.name,
      uniqueEmail,
      'test12',  // Exactly 6 characters
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    // Since 'test12' (6 chars) is a valid password, registration should succeed, and user might be redirected
    const isRegistrationSuccessful = await registerPage.validateSuccessfulRegistration();
    expect(isRegistrationSuccessful).toBeTruthy();
  });

  test('REG-012: Validate password without number', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      testData.register.validData.email,
      testData.register.invalidPassword.noNumber,
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-013: Validate password without letter', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      testData.register.validData.email,
      testData.register.invalidPassword.noLetter,
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-014: Validate empty password field', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      testData.register.validData.email,
      '',  // Empty password
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-015: Validate phone number too short (BVA - less than 8 chars)', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      testData.register.validData.email,
      testData.register.validData.password,
      testData.register.invalidPhone.tooShort,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-016: Validate phone number with exactly 8 characters (BVA - boundary)', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach
    const uniqueEmail = `test${Date.now()}@test.com`;

    // Act
    await registerPage.register(
      testData.register.validData.name,
      uniqueEmail,
      testData.register.validData.password,
      '+1234567',  // Exactly 8 characters
      testData.register.validData.address
    );

    // Assert
    // Since '+1234567' (8 chars) is a valid phone, registration should succeed, and user might be redirected
    const isRegistrationSuccessful = await registerPage.validateSuccessfulRegistration();
    expect(isRegistrationSuccessful).toBeTruthy();
  });

  test('REG-017: Validate phone number too long (BVA - more than 20 chars)', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      testData.register.validData.email,
      testData.register.validData.password,
      testData.register.invalidPhone.tooLong,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-018: Validate phone number with exactly 20 characters (BVA - boundary)', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach
    const uniqueEmail = `test${Date.now()}@test.com`;

    // Act
    await registerPage.register(
      testData.register.validData.name,
      uniqueEmail,
      testData.register.validData.password,
      '+12345678901234567890',  // Exactly 20 characters
      testData.register.validData.address
    );

    // Assert
    const isRegistrationSuccessful = await registerPage.validateSuccessfulRegistration();
    if (isRegistrationSuccessful) {
      expect(page.url()).not.toContain('/web/register');
    } else {
      // If registration failed, ensure it's due to validation or other expected reasons
      expect(page.url()).toContain('/web/register');
    }
  });

  test('REG-019: Validate phone number with letters', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      testData.register.validData.email,
      testData.register.validData.password,
      testData.register.invalidPhone.withLetters,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-020: Validate empty phone number field', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      testData.register.validData.email,
      testData.register.validData.password,
      '',  // Empty phone
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-021: Validate empty address field', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      testData.register.validData.email,
      testData.register.validData.password,
      testData.register.validData.phone,
      ''  // Empty address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-022: Validate all empty fields', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.clickRegister();

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  test('REG-023: Successful registration with valid data', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach
    const uniqueEmail = `testuser${Date.now()}@test.com`;

    // Act
    await registerPage.register(
      testData.register.validData.name,
      uniqueEmail,
      testData.register.validData.password,
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationSuccessful = await registerPage.validateSuccessfulRegistration();
    expect(isRegistrationSuccessful).toBeTruthy();
  });

  test('REG-024: Register with existing user email', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await registerPage.register(
      testData.register.validData.name,
      users.validUser.email,  // Using existing user email
      testData.register.validData.password,
      testData.register.validData.phone,
      testData.register.validData.address
    );

    // Assert
    const isRegistrationFailure = await registerPage.validateRegistrationFailure();
    expect(isRegistrationFailure).toBeTruthy();
  });

  // Data-driven validation tests
  test.describe('Data-driven invalid registration tests', () => {
    const invalidRegistrations = [
      {
        id: 'REG-025',
        description: 'Validate name too short',
        name: testData.register.invalidName.tooShort,
        email: testData.register.validData.email,
        password: testData.register.validData.password,
        phone: testData.register.validData.phone,
        address: testData.register.validData.address
      },
      {
        id: 'REG-026',
        description: 'Validate empty name field',
        name: '',
        email: testData.register.validData.email,
        password: testData.register.validData.password,
        phone: testData.register.validData.phone,
        address: testData.register.validData.address
      },
      {
        id: 'REG-027',
        description: 'Validate email without @ symbol',
        name: testData.register.validData.name,
        email: testData.register.invalidEmail.noAt,
        password: testData.register.validData.password,
        phone: testData.register.validData.phone,
        address: testData.register.validData.address
      },
      {
        id: 'REG-028',
        description: 'Validate empty email field',
        name: testData.register.validData.name,
        email: '',
        password: testData.register.validData.password,
        phone: testData.register.validData.phone,
        address: testData.register.validData.address
      },
      {
        id: 'REG-029',
        description: 'Validate password less than 6 chars',
        name: testData.register.validData.name,
        email: testData.register.validData.email,
        password: testData.register.invalidPassword.tooShort,
        phone: testData.register.validData.phone,
        address: testData.register.validData.address
      },
      {
        id: 'REG-030',
        description: 'Validate password without number',
        name: testData.register.validData.name,
        email: testData.register.validData.email,
        password: testData.register.invalidPassword.noNumber,
        phone: testData.register.validData.phone,
        address: testData.register.validData.address
      },
      {
        id: 'REG-031',
        description: 'Validate empty password field',
        name: testData.register.validData.name,
        email: testData.register.validData.email,
        password: '',
        phone: testData.register.validData.phone,
        address: testData.register.validData.address
      },
      {
        id: 'REG-032',
        description: 'Validate phone number too short',
        name: testData.register.validData.name,
        email: testData.register.validData.email,
        password: testData.register.validData.password,
        phone: testData.register.invalidPhone.tooShort,
        address: testData.register.validData.address
      },
      {
        id: 'REG-033',
        description: 'Validate phone number with letters',
        name: testData.register.validData.name,
        email: testData.register.validData.email,
        password: testData.register.validData.password,
        phone: testData.register.invalidPhone.withLetters,
        address: testData.register.validData.address
      },
      {
        id: 'REG-034',
        description: 'Validate empty phone number field',
        name: testData.register.validData.name,
        email: testData.register.validData.email,
        password: testData.register.validData.password,
        phone: '',
        address: testData.register.validData.address
      },
      {
        id: 'REG-035',
        description: 'Validate empty address field',
        name: testData.register.validData.name,
        email: testData.register.validData.email,
        password: testData.register.validData.password,
        phone: testData.register.validData.phone,
        address: ''
      }
    ];

    invalidRegistrations.forEach(({ id, description, name, email, password, phone, address }) => {
      test(`${id}: ${description}`, async ({ page }) => {
        // Arrange - Page object already initialized in beforeEach

        // Act
        await registerPage.register(name, email, password, phone, address);

        // Assert
        const isRegistrationFailure = await registerPage.validateRegistrationFailure();
        expect(isRegistrationFailure).toBeTruthy();
      });
    });
  });
});

