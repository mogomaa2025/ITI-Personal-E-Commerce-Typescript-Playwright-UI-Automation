import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the homepage
 * Implements the Page Object Model pattern with proper error handling and type safety
 */
export class HomePage extends BasePage {
  // Main page elements
  readonly welcomeHeading: Locator;
  readonly shopNowButton: Locator;
  readonly whyChooseUsHeading: Locator;
  readonly shopByCategoryHeading: Locator;
  readonly qualityProductsCard: Locator;
  readonly fastDeliveryCard: Locator;
  readonly supportCard: Locator;
  readonly categoryCards: Locator;
  readonly footer: Locator;

  // Navigation elements
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly ordersLink: Locator;
  readonly profileLink: Locator;
  readonly wishlistLink: Locator;
  readonly notificationsLink: Locator;
  readonly logoutButton: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly adminLink: Locator;
  readonly logo: Locator;

  constructor(page: Page) {
    super(page);
    // Main page elements
    this.welcomeHeading = page.locator('h1:has-text("Welcome to E-Commerce Store")');
    this.shopNowButton = page.locator('a:has-text("Shop Now")');
    this.whyChooseUsHeading = page.locator('h2:has-text("Why Choose Us")');
    this.shopByCategoryHeading = page.locator('h2:has-text("Shop by Category")');
    this.qualityProductsCard = page.locator('h3:has-text("Quality Products")');
    this.fastDeliveryCard = page.locator('h3:has-text("Fast Delivery")');
    this.supportCard = page.locator('h3:has-text("24/7 Support")');
    this.categoryCards = page.locator('.category-card, a[href*="/web/products?category="]');
    this.footer = page.locator('footer');

    // Navigation elements
    this.homeLink = page.locator('#nav-home, a[href="/"].nav-link, nav a:has-text("Home")');
    this.productsLink = page.locator('#nav-products, a[href*="/web/products"].nav-link, nav a:has-text("Products")');
    this.cartLink = page.locator('#nav-cart, a[href*="/web/cart"].nav-link, nav a:has-text("Cart")');
    this.ordersLink = page.locator('#nav-orders, a[href*="/web/orders"].nav-link, nav a:has-text("Orders")');
    this.profileLink = page.locator('#nav-profile, a[href*="/web/profile"].nav-link, nav a:has-text("Profile")');
    this.wishlistLink = page.locator('#nav-wishlist, a[href*="/web/wishlist"].nav-link, nav a:has-text("Wishlist")');
    this.notificationsLink = page.locator('#nav-notifications, a[href*="/web/notifications"].nav-link, nav a:has-text("Notifications")');
    this.logoutButton = page.locator('#nav-logout, a[href="/web/logout"].nav-link, nav a:has-text("Logout")');
    this.loginLink = page.locator('#nav-login, a[href*="/web/login"].nav-link, nav a:has-text("Login")');
    this.registerLink = page.locator('#nav-register, a[href*="/web/register"].nav-link, nav a:has-text("Register")');
    this.adminLink = page.locator('#nav-admin, a[href*="/web/admin"].nav-link, nav a:has-text("Admin")');
    this.logo = page.locator('#logo-link, .logo, img[alt="logo"], a[href="/"]:not([id*="nav"])');
  }

  /**
   * Navigates to the homepage and waits for it to load
   */
  async navigateTo(): Promise<void> {
    try {
      await this.page.goto('/');
      await this.page.waitForLoadState('networkidle');
      await this.welcomeHeading.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error: any) {
      throw new Error(`Failed to navigate to homepage: ${error.message}`);
    }
  }

  /**
   * Clicks the Shop Now button and waits for navigation
   */
  async clickShopNow(): Promise<void> {
    try {
      await this.shopNowButton.scrollIntoViewIfNeeded();
      await this.shopNowButton.waitFor({ state: 'visible' });
      await this.shopNowButton.click();
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Failed to click Shop Now button: ${error.message}`);
    }
  }

  /**
   * Clicks a category link by name and waits for navigation
   * @param categoryName - The name of the category to click
   */
  async clickCategory(categoryName: string): Promise<void> {
    try {
      const categoryLink = this.page.locator(`a:has-text("${categoryName}")`).first();
      await categoryLink.scrollIntoViewIfNeeded();
      await categoryLink.waitFor({ state: 'visible' });
      await categoryLink.click();
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Failed to click category ${categoryName}: ${error.message}`);
    }
  }

  /**
   * Gets the count of category cards on the homepage
   */
  async getCategoryCards(): Promise<number> {
    try {
      return await this.categoryCards.count();
    } catch (error: any) {
      throw new Error(`Failed to get category card count: ${error.message}`);
    }
  }

  /**
   * Gets all category names from the category cards
   */
  async getAllCategoryNames(): Promise<string[]> {
    try {
      const categories: string[] = [];
      const count = await this.categoryCards.count();
      for (let i = 0; i < count; i++) {
        const card = this.categoryCards.nth(i);
        const heading = card.locator('h3');
        if (await heading.isVisible()) {
          const text = await heading.textContent();
          if (text) {
            categories.push(text.trim());
          }
        }
      }
      return categories;
    } catch (error: any) {
      throw new Error(`Failed to get all category names: ${error.message}`);
    }
  }

  /**
   * Checks visibility of the Why Choose Us section elements
   */
  async isWhyChooseUsSectionVisible(): Promise<{ heading: boolean; qualityProducts: boolean; fastDelivery: boolean; support: boolean }> {
    try {
      return {
        heading: await this.whyChooseUsHeading.isVisible(),
        qualityProducts: await this.qualityProductsCard.isVisible(),
        fastDelivery: await this.fastDeliveryCard.isVisible(),
        support: await this.supportCard.isVisible()
      };
    } catch (error: any) {
      throw new Error(`Failed to check Why Choose Us section visibility: ${error.message}`);
    }
  }

  /**
   * Checks navbar elements for a logged-in user
   */
  async checkNavbarForLoggedInUser(): Promise<{ profile: boolean; wishlist: boolean; notifications: boolean; logout: boolean; loginRegister: boolean }> {
    try {
      // Check for profile, wishlist, and notifications links
      const profile = await this.profileLink.isVisible();
      const wishlist = await this.wishlistLink.isVisible();
      const notifications = await this.notificationsLink.isVisible();

      // Check for logout button using multiple possible selectors
      let logoutFound = false;
      const logoutSelectors = [
        '#nav-logout',
        'a[href="/web/logout"]',
        'a:has-text("Logout")',
        'a:has-text("Sign out")',
        '.logout-btn',
        '.nav-logout',
        'button:has-text("Logout")',
        'button:has-text("Sign out")',
        '.navbar a:has-text("Logout")',
        '.navbar a:has-text("Sign out")'
      ];

      for (const selector of logoutSelectors) {
        const button = this.page.locator(selector).first();
        if (await button.isVisible().catch(() => false)) {
          logoutFound = true;
          break;
        }
      }

      // Check for login/register link (should not be visible when logged in)
      const loginRegister = await this.loginLink.isVisible().catch(() => false);

      return {
        profile,
        wishlist,
        notifications,
        logout: logoutFound,
        loginRegister
      };
    } catch (error: any) {
      throw new Error(`Failed to check navbar for logged-in user: ${error.message}`);
    }
  }

  /**
   * Checks navbar elements for an admin user
   */
  async checkNavbarForAdmin(): Promise<{ admin: boolean; profile: boolean; logout: boolean }> {
    try {
      // Check for admin and profile links
      const admin = await this.adminLink.isVisible();
      const profile = await this.profileLink.isVisible();

      // Check for logout button using multiple possible selectors
      let logoutFound = false;
      const logoutSelectors = [
        '#nav-logout',
        'a[href="/web/logout"]',
        'a:has-text("Logout")',
        'a:has-text("Sign out")',
        '.logout-btn',
        '.nav-logout',
        'button:has-text("Logout")',
        'button:has-text("Sign out")',
        '.navbar a:has-text("Logout")',
        '.navbar a:has-text("Sign out")'
      ];

      for (const selector of logoutSelectors) {
        const button = this.page.locator(selector).first();
        if (await button.isVisible().catch(() => false)) {
          logoutFound = true;
          break;
        }
      }

      return {
        admin,
        profile,
        logout: logoutFound
      };
    } catch (error: any) {
      throw new Error(`Failed to check navbar for admin: ${error.message}`);
    }
  }

  /**
   * Checks navbar elements for a guest user
   */
  async checkNavbarForGuest(): Promise<{ loginRegister: boolean; register: boolean }> {
    try {
      return {
        loginRegister: await this.loginLink.isVisible(),
        register: await this.registerLink.isVisible()
      };
    } catch (error: any) {
      throw new Error(`Failed to check navbar for guest: ${error.message}`);
    }
  }

  /**
   * Performs logout by clicking the logout button
   */
  async logout(): Promise<void> {
    try {
      // More flexible approach to find logout button - try multiple possible selectors
      const logoutSelectors = [
        '#nav-logout',
        'a[href="/web/logout"]',
        'a:has-text("Logout")',
        'a:has-text("Sign out")',
        '.logout-btn',
        '.nav-logout',
        'button:has-text("Logout")',
        'button:has-text("Sign out")',
        '.navbar a:has-text("Logout")',
        '.navbar a:has-text("Sign out")'
      ];

      let logoutButton: Locator | null = null;
      let found = false;

      // Try each selector until we find a visible element
      for (const selector of logoutSelectors) {
        logoutButton = this.page.locator(selector).first();
        try {
          await logoutButton.waitFor({ state: 'visible', timeout: 2000 });
          found = true;
          break;
        } catch {
          // Try next selector
          continue;
        }
      }

      if (!found || !logoutButton) {
        throw new Error('Logout button not found with any known selector');
      }

      await logoutButton.scrollIntoViewIfNeeded();
      await logoutButton.click();

      // Wait for navigation to login page or page reload after logout
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForURL('**/web/login**').catch(() => {});

    } catch (error: any) {
      // If logout button is not found, the user might already be logged out
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/web/login') && !currentUrl.includes('/web/home')) {
        throw new Error(`Failed to logout: ${error.message}`);
      }
    }
  }

  /**
   * Clicks the logo and waits for navigation to homepage
   */
  async clickLogo(): Promise<void> {
    try {
      await this.logo.scrollIntoViewIfNeeded();
      await this.logo.waitFor({ state: 'visible' });
      await this.logo.click();
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Failed to click logo: ${error.message}`);
    }
  }

  /**
   * Checks if the user is logged in by looking for logout button
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const logoutButtonVisible = await this.logoutButton.isVisible().catch(() => false);
      return logoutButtonVisible;
    } catch (error: any) {
      // If there's an error checking, assume user is not logged in
      return false;
    }
  }

  /**
   * Validates that guest user restrictions are in place
   * Checks if guest user gets appropriate alerts when accessing restricted areas
   */
  async validateGuestRestrictions(): Promise<boolean> {
    try {
      // Get the current URL before attempting to click restricted link
      const currentUrl = this.page.url();

      // When guest user tries to access cart/orders, they might be redirected to login or see an alert
      await this.cartLink.click();

      // Wait a moment for any navigation or modal to appear
      await this.page.waitForLoadState('networkidle');

      const newUrl = this.page.url();

      // Check if the user was redirected to login page
      if (newUrl.includes('/web/login')) {
        // If redirected to login, go back to validate the restriction worked
        await this.page.goBack();
        await this.page.waitForLoadState('networkidle');
        return true;
      }

      // Check if an alert message appears on the same page
      const alertLocator = this.page.locator('.alert', { hasText: /login|register|sign in/i }).first();
      if (await alertLocator.isVisible().catch(() => false)) {
        return true;
      }

      // If no redirection or alert, try the orders link as well
      await this.ordersLink.click();
      await this.page.waitForLoadState('networkidle');

      const updatedUrl = this.page.url();
      if (updatedUrl.includes('/web/login')) {
        await this.page.goBack();
        await this.page.waitForLoadState('networkidle');
        return true;
      }

      // If still on the same page, check for alerts again
      if (await alertLocator.isVisible().catch(() => false)) {
        return true;
      }

      // Go back to original state
      await this.page.goto(currentUrl);
      await this.page.waitForLoadState('networkidle');

      return false;
    } catch (error: any) {
      return false;
    }
  }
}
