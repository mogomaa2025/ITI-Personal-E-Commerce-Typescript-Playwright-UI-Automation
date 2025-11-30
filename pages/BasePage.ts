import { Page, Locator, expect, TestInfo } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly logo: Locator;
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly ordersLink: Locator;
  readonly helpLink: Locator;
  readonly contactLink: Locator;
  readonly searchLink: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly profileLink: Locator;
  readonly wishlistLink: Locator;
  readonly notificationsLink: Locator;
  readonly adminLink: Locator;
  readonly logoutButton: Locator;
  readonly footer: Locator;
  readonly alertContainer: Locator;
  readonly cartBadge: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('a:has-text("E-Commerce Store")');
    this.homeLink = page.locator('nav a[href="/"]').first();
    this.productsLink = page.locator('nav a[href="/web/products"]');
    this.cartLink = page.locator('nav a[href="/web/cart"]');
    this.ordersLink = page.locator('nav a[href="/web/orders"]');
    this.helpLink = page.locator('a[href="/web/help"]');
    this.contactLink = page.locator('a[href="/web/contact"]');
    this.searchLink = page.locator('a[href="/web/advanced-search"]');
    this.loginLink = page.locator('a[href="/web/login"]');
    this.registerLink = page.locator('a[href="/web/register"]');
    this.profileLink = page.locator('a[href="/web/profile"]');
    this.wishlistLink = page.locator('a[href="/web/wishlist"]');
    this.notificationsLink = page.locator('a[href="/web/notifications"]');
    this.adminLink = page.locator('a[href="/web/admin"]');
    this.logoutButton = page.locator('button:has-text("Logout")');
    this.footer = page.locator('footer');
    this.alertContainer = page.locator('.alert');
    this.cartBadge = page.locator('#cart-count');
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async navigateToHome(): Promise<void> {
    await this.scrollToElement(this.homeLink);
    await this.homeLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToProducts(): Promise<void> {
    await this.scrollToElement(this.productsLink);
    await this.productsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToCart(): Promise<void> {
    await this.scrollToElement(this.cartLink);
    await this.cartLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToOrders(): Promise<void> {
    await this.scrollToElement(this.ordersLink);
    await this.ordersLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickLogo(): Promise<void> {
    await this.scrollToElement(this.logo);
    await this.logo.click();
    await this.page.waitForLoadState('networkidle');
  }

  async logout(): Promise<void> {
    // Check if user is logged in by checking if logout button exists in DOM
    const exists = await this.logoutButton.count() > 0;
    if (!exists) {
      // User is not logged in, nothing to do
      return;
    }
    
    // Check if logout button is visible
    const isVisible = await this.logoutButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isVisible) {
      // Try navigating to home or products page where logout should be visible
      await this.page.goto('/', { waitUntil: 'networkidle' });
      await this.page.waitForLoadState('networkidle');
      // Check again after navigation
      const isVisibleAfterNav = await this.logoutButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (!isVisibleAfterNav) {
        // If still not visible, try clicking it anyway (it might be hidden by CSS but still clickable)
        await this.logoutButton.click({ force: true });
        await this.page.waitForLoadState('networkidle');
        return;
      }
    }
    
    // Button is visible, proceed normally
    await this.scrollToElement(this.logoutButton);
    await this.logoutButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.logoutButton.isVisible();
  }

  async isAdmin(): Promise<boolean> {
    return await this.adminLink.isVisible();
  }

  async getAlertText(): Promise<string | null> {
    try {
      await this.alertContainer.first().waitFor({ state: 'visible', timeout: 1000 });
      return await this.alertContainer.first().textContent();
    } catch {
      return null;
    }
  }

  async waitForAlert(text: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(`.alert:has-text("${text}")`, { timeout });
  }

  async getCartBadgeCount(): Promise<number> {
    const cartText = await this.cartLink.textContent();
    const match = cartText ? cartText.match(/\d+/) : null;
    return match ? parseInt(match[0]) : 0;
  }

  async softAssertVisible(locator: Locator, testInfo: TestInfo, message: string): Promise<void> {
    try {
      await expect(locator).toBeVisible({ timeout: 5000 });
    } catch (error) {
      expect.soft(false, `${message}: Element not visible`).toBeTruthy();
    }
  }

  async acceptDialogListener(): Promise<void> {
    
    this.page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept(); // Or dialog.dismiss() to click 'Cancel'
    });

  }

  async rejectDialogListener(): Promise<void> {
    
    this.page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept(); // Or dialog.dismiss() to click 'Cancel'
    });

  }


  async clearCart(): Promise<void> {
    try {
      // Navigate to cart page
      await this.page.goto('/web/cart', { waitUntil: 'networkidle', timeout: 30000 });
      await this.page.waitForLoadState('networkidle');
      
      // Try multiple possible selectors for remove button
      const possibleSelectors = [
        'button:has-text("Remove")',
        'button:has-text("remove")',
        'button[class*="remove"]',
        'a:has-text("Remove")',
        '.remove-btn',
        '[data-testid*="remove"]'
      ];
      
      let removeButtons: Locator | null = null;
      let count = 0;
      
      // Find which selector works
      for (const selector of possibleSelectors) {
        removeButtons = this.page.locator(selector);
        count = await removeButtons.count();
        if (count > 0) {
          console.log(`Found ${count} items using selector: ${selector}`);
          break;
        }
      }
      
      // Remove all items if buttons were found
      if (removeButtons && count > 0) {
        while (count > 0) {
          await removeButtons.first().scrollIntoViewIfNeeded();
          await removeButtons.first().click();
          await this.page.waitForLoadState('networkidle');
          count = await removeButtons.count();
          console.log(`Removed item, ${count} items remaining`);
        }
      }
      
      console.log('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error instanceof Error ? error.message : 'Unknown error');
      // Continue anyway - cart might already be empty
    }
  }
}
