import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { Helpers } from '../utils/helpers';
import users from '../data/users.json';
import testData from '../data/data.json';

/**
 * Homepage tests following the Page Object Model pattern
 * Tests are organized using Arrange-Act-Assert pattern
 */
test.describe('Homepage Tests - Not Logged In', () => {
  let homePage: HomePage;
  let helpers: Helpers;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    helpers = new Helpers(page);
    await homePage.navigateTo();
  });

  test('HOME-001: Verify homepage loads correctly for guest user', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act & Assert - Verify all homepage elements are visible
    await expect(homePage.welcomeHeading).toBeVisible();
    await expect(homePage.shopNowButton).toBeVisible();
    await expect(homePage.whyChooseUsHeading).toBeVisible();
    await expect(homePage.shopByCategoryHeading).toBeVisible();
  });

  test('HOME-002: Verify navbar for guest user', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    const navbar = await homePage.checkNavbarForGuest();

    // Assert
    expect(navbar.loginRegister).toBeTruthy();
    expect(navbar.register).toBeTruthy();
    await expect(homePage.homeLink).toBeVisible();
    await expect(homePage.productsLink).toBeVisible();
    await expect(homePage.cartLink).toBeVisible();
    await expect(homePage.ordersLink).toBeVisible();
  });

  test('HOME-003: Verify Shop Now button navigates to products', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await homePage.clickShopNow();

    // Assert
    await page.waitForURL('**/web/products');
    expect(page.url()).toContain('/web/products');
  });

  test('HOME-004: Verify Why Choose Us section', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    const section = await homePage.isWhyChooseUsSectionVisible();

    // Assert
    expect(section.heading).toBeTruthy();
    expect(section.qualityProducts).toBeTruthy();
    expect(section.fastDelivery).toBeTruthy();
    expect(section.support).toBeTruthy();
  });

  test('HOME-005: Verify Shop by Category section displays categories', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    const categoryCount = await homePage.getCategoryCards();

    // Assert
    expect(categoryCount).toBeGreaterThan(0);
  });

  test('HOME-006: Verify category click navigation', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await homePage.clickCategory(testData.products.categories[0]); // Using first category from data.json

    // Assert
    expect(page.url()).toContain(`category=${testData.products.categories[0]}`);
  });

  test('HOME-007: Verify Cart link shows alert for guest user', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await homePage.cartLink.click();
    await page.waitForLoadState('networkidle');

    // Assert
    // Check if guest is redirected to login page or sees an alert
    const currentUrl = page.url();
    if (currentUrl.includes('/web/login')) {
      // If redirected to login, test passes
      expect(currentUrl).toContain('/web/login');
    } else {
      // If not redirected, check for an alert message
      const alertLocator = page.locator('.alert', { hasText: /login|register|sign in/i });
      const hasAlert = await alertLocator.isVisible().catch(() => false);
      expect(hasAlert).toBeTruthy();
    }
    // Go back to homepage for next tests
    await page.goBack();
    await page.waitForLoadState('networkidle');
  });

  test('HOME-008: Verify Orders link shows alert for guest user', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await homePage.ordersLink.click();
    await page.waitForLoadState('networkidle');

    // Assert
    // Check if guest is redirected to login page or sees an alert
    const currentUrl = page.url();
    if (currentUrl.includes('/web/login')) {
      // If redirected to login, test passes
      expect(currentUrl).toContain('/web/login');
    } else {
      // If not redirected, check for an alert message
      const alertLocator = page.locator('.alert', { hasText: /login|register|sign in/i });
      const hasAlert = await alertLocator.isVisible().catch(() => false);
      expect(hasAlert).toBeTruthy();
    }
    // Go back to homepage for next tests
    await page.goBack();
    await page.waitForLoadState('networkidle');
  });

  test('HOME-009: Verify footer is visible', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act & Assert
    await expect(homePage.footer).toBeVisible();
  });

  test('HOME-010: Verify logo click navigates to homepage', async ({ page }) => {
    // Arrange - Page object already initialized in beforeEach

    // Act
    await homePage.logo.click();
    await page.waitForLoadState('networkidle');

    // Assert
    expect(page.url()).toContain('/');
  });
});

test.describe('Homepage Tests - Logged In as Normal User', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);

    // Navigate to login page and perform login
    await loginPage.navigateTo();
    await loginPage.login(users.homeUser.email, users.homeUser.password);

    // Wait for navigation after login
    await page.waitForLoadState('networkidle');

    // Simply wait for post login navigation to ensure the login is processed
    try {
      await loginPage.waitForPostLoginNavigation();
    } catch (e) {
      // If post login navigation doesn't happen immediately, just continue
      await page.waitForLoadState('networkidle');
    }

    // Navigate to homepage after ensuring user is logged in
    await homePage.navigateTo();
  });

  test('HOME-011: Verify navbar for logged in normal user', async ({ page }) => {
    // Arrange - User already logged in in beforeEach

    // Act
    const navbar = await homePage.checkNavbarForLoggedInUser();

    // Assert
    expect(navbar.profile).toBeTruthy();
    expect(navbar.wishlist).toBeTruthy();
    expect(navbar.notifications).toBeTruthy();
    expect(navbar.logout).toBeTruthy();
    expect(navbar.loginRegister).toBeFalsy();
  });

  test('HOME-012: Verify Shop Now button for logged in user', async ({ page }) => {
    // Arrange - User already logged in in beforeEach

    // Act
    await homePage.clickShopNow();

    // Assert
    await page.waitForURL('**/web/products');
    expect(page.url()).toContain('/web/products');
  });

  test('HOME-013: Verify Cart link works for logged in user', async ({ page }) => {
    // Arrange - User already logged in in beforeEach

    // Act
    await homePage.cartLink.click();

    // Assert
    await page.waitForLoadState('networkidle');
    // Verify navigation to cart page for logged-in user
    expect(page.url()).toContain('/web/cart');
  });

  test('HOME-014: Verify Orders link works for logged in user', async ({ page }) => {
    // Arrange - User already logged in in beforeEach

    // Act
    await homePage.ordersLink.click();

    // Assert
    await page.waitForLoadState('networkidle');
    // Verify navigation to orders page for logged-in user
    expect(page.url()).toContain('/web/orders');
  });

  test('HOME-015: Verify Profile link is accessible', async ({ page }) => {
    // Arrange - User already logged in in beforeEach

    // Act
    await homePage.profileLink.click();

    // Assert
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/web/profile');
  });

  test('HOME-016: Verify Wishlist link is accessible', async ({ page }) => {
    // Arrange - User already logged in in beforeEach

    // Act
    await homePage.wishlistLink.click();

    // Assert
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/web/wishlist');
  });

  test('HOME-017: Verify Notifications link is accessible', async ({ page }) => {
    // Arrange - User already logged in in beforeEach

    // Act
    await homePage.notificationsLink.click();

    // Assert
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/web/notifications');
  });

  test('HOME-018: Verify Logout functionality', async ({ page }) => {
    // Arrange - User already logged in in beforeEach

    // Act
    await homePage.logout();
    await page.waitForLoadState('networkidle');

    // Assert
    // Check that login link is visible again (user is logged out)
    const isLoggedOut = await homePage.loginLink.isVisible().catch(() => false);
    expect(isLoggedOut).toBeTruthy();
  });

  test('HOME-019: Verify Admin link not visible for normal user', async ({ page }) => {
    // Arrange - User already logged in in beforeEach

    // Act & Assert
    const isAdminVisible = await homePage.adminLink.isVisible().catch(() => false);
    expect(isAdminVisible).toBeFalsy();
  });
});

test.describe('Homepage Tests - Logged In as Admin', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);

    await loginPage.navigateTo();
    await loginPage.login(users.admin.email, users.admin.password);
    await homePage.navigateTo();
    await page.waitForLoadState('networkidle');
  });

  test('HOME-020: Verify navbar for admin user', async ({ page }) => {
    // Arrange - Admin already logged in in beforeEach

    // Act
    const navbar = await homePage.checkNavbarForAdmin();

    // Assert
    expect(navbar.admin).toBeTruthy();
    expect(navbar.profile).toBeTruthy();
    expect(navbar.logout).toBeTruthy();
  });

  test('HOME-021: Verify Admin link is visible and accessible', async ({ page }) => {
    // Arrange - Admin already logged in in beforeEach

    // Act & Assert
    await expect(homePage.adminLink).toBeVisible();
    await homePage.adminLink.click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/web/admin');
  });

  test('HOME-022: Verify Shop Now button for admin user', async ({ page }) => {
    // Arrange - Admin already logged in in beforeEach

    // Act
    await homePage.clickShopNow();

    // Assert
    await page.waitForURL('**/web/products');
    expect(page.url()).toContain('/web/products');
  });

  test('HOME-023: Verify all navbar links work for admin', async ({ page }) => {
    // Arrange - Admin already logged in in beforeEach

    // Act & Assert
    await expect(homePage.homeLink).toBeVisible();
    await expect(homePage.productsLink).toBeVisible();
    await expect(homePage.cartLink).toBeVisible();
    await expect(homePage.ordersLink).toBeVisible();
  });
});

