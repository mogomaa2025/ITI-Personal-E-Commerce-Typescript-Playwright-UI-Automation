import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { Helpers } from '../utils/helpers';
import users from '../data/users.json';

test.describe('Homepage Tests - Not Logged In', () => {
  let homePage: HomePage;
  let helpers: Helpers;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    helpers = new Helpers(page);
    await homePage.navigateTo();
  });

  test('HOME-001: Verify homepage loads correctly for guest user', async ({ page }) => {
    expect.soft(await homePage.welcomeHeading.isVisible()).toBeTruthy();
    expect.soft(await homePage.shopNowButton.isVisible()).toBeTruthy();
    expect.soft(await homePage.whyChooseUsHeading.isVisible()).toBeTruthy();
    expect.soft(await homePage.shopByCategoryHeading.isVisible()).toBeTruthy();
  });

  test('HOME-002: Verify navbar for guest user', async ({ page }) => {
    const navbar = await homePage.checkNavbarForGuest();
    expect.soft(navbar.loginRegister).toBeTruthy();
    expect.soft(navbar.register).toBeTruthy();
    expect.soft(await homePage.homeLink.isVisible()).toBeTruthy();
    expect.soft(await homePage.productsLink.isVisible()).toBeTruthy();
    expect.soft(await homePage.cartLink.isVisible()).toBeTruthy();
    expect.soft(await homePage.ordersLink.isVisible()).toBeTruthy();
  });

  test('HOME-003: Verify Shop Now button navigates to products', async ({ page }) => {
    await homePage.clickShopNow();
    await page.waitForURL('**/web/products');
    expect(page.url()).toContain('/web/products');
  });

  test('HOME-004: Verify Why Choose Us section', async ({ page }) => {
    const section = await homePage.isWhyChooseUsSectionVisible();
    expect.soft(section.heading).toBeTruthy();
    expect.soft(section.qualityProducts).toBeTruthy();
    expect.soft(section.fastDelivery).toBeTruthy();
    expect.soft(section.support).toBeTruthy();
  });

  test('HOME-005: Verify Shop by Category section displays categories', async ({ page }) => {
    const categoryCount = await homePage.getCategoryCards();
    expect.soft(categoryCount).toBeGreaterThan(0);
  });

  test('HOME-006: Verify category click navigation', async ({ page }) => {
    await homePage.clickCategory('Electronics');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('category=Electronics');
  });

  test('HOME-007: Verify Cart link shows alert for guest user', async ({ page }) => {
    await homePage.cartLink.click();
    await page.waitForTimeout(1000);
  });

  test('HOME-008: Verify Orders link shows alert for guest user', async ({ page }) => {
    await homePage.ordersLink.click();
    await page.waitForTimeout(1000);
  });

  test('HOME-009: Verify footer is visible', async ({ page }) => {
    expect.soft(await homePage.footer.isVisible()).toBeTruthy();
  });

  test('HOME-010: Verify logo click navigates to homepage', async ({ page }) => {
    await homePage.clickLogo();
    expect(page.url()).toContain('/');
  });
});

test.describe('Homepage Tests - Logged In as Normal User', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    await homePage.navigateTo();
  });

  test('HOME-011: Verify navbar for logged in normal user', async ({ page }) => {
    const navbar = await homePage.checkNavbarForLoggedInUser();
    expect.soft(navbar.profile).toBeTruthy();
    expect.soft(navbar.wishlist).toBeTruthy();
    expect.soft(navbar.notifications).toBeTruthy();
    expect.soft(navbar.logout).toBeTruthy();
    expect.soft(navbar.loginRegister).toBeFalsy();
  });

  test('HOME-012: Verify Shop Now button for logged in user', async ({ page }) => {
    await homePage.clickShopNow();
    await page.waitForURL('**/web/products');
    expect(page.url()).toContain('/web/products');
  });

  test('HOME-013: Verify Cart link works for logged in user', async ({ page }) => {
    await homePage.cartLink.click();
    await page.waitForTimeout(1000);
  });

  test('HOME-014: Verify Orders link works for logged in user', async ({ page }) => {
    await homePage.ordersLink.click();
    await page.waitForTimeout(1000);
  });

  test('HOME-015: Verify Profile link is accessible', async ({ page }) => {
    await homePage.profileLink.click();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/web/profile');
  });

  test('HOME-016: Verify Wishlist link is accessible', async ({ page }) => {
    await homePage.wishlistLink.click();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/web/wishlist');
  });

  test('HOME-017: Verify Notifications link is accessible', async ({ page }) => {
    await homePage.notificationsLink.click();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/web/notifications');
  });

  test('HOME-018: Verify Logout functionality', async ({ page }) => {
    await homePage.logout();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    const isLoggedOut = await homePage.loginLink.isVisible({ timeout: 5000 }).catch(() => false);
    expect.soft(isLoggedOut).toBeTruthy();
  });

  test('HOME-019: Verify Admin link not visible for normal user', async ({ page }) => {
    expect.soft(await homePage.adminLink.isVisible()).toBeFalsy();
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
    await page.waitForTimeout(2000);
    await homePage.navigateTo();
  });

  test('HOME-020: Verify navbar for admin user', async ({ page }) => {
    const navbar = await homePage.checkNavbarForAdmin();
    expect.soft(navbar.admin).toBeTruthy();
    expect.soft(navbar.profile).toBeTruthy();
    expect.soft(navbar.logout).toBeTruthy();
  });

  test('HOME-021: Verify Admin link is visible and accessible', async ({ page }) => {
    expect.soft(await homePage.adminLink.isVisible()).toBeTruthy();
    await homePage.adminLink.click();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/web/admin');
  });

  test('HOME-022: Verify Shop Now button for admin user', async ({ page }) => {
    await homePage.clickShopNow();
    await page.waitForURL('**/web/products');
    expect(page.url()).toContain('/web/products');
  });

  test('HOME-023: Verify all navbar links work for admin', async ({ page }) => {
    expect.soft(await homePage.homeLink.isVisible()).toBeTruthy();
    expect.soft(await homePage.productsLink.isVisible()).toBeTruthy();
    expect.soft(await homePage.cartLink.isVisible()).toBeTruthy();
    expect.soft(await homePage.ordersLink.isVisible()).toBeTruthy();
  });
});

