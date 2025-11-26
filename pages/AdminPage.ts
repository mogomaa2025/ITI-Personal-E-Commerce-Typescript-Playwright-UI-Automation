import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  readonly pageHeading: Locator;
  readonly totalUsers: Locator;
  readonly totalProducts: Locator;
  readonly totalOrders: Locator;
  readonly totalRevenue: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('h1:has-text("Admin Dashboard")');
    this.totalUsers = page.locator('h3:has-text("Total Users")').locator('..').locator('p').first();
    this.totalProducts = page.locator('h3:has-text("Total Products")').locator('..').locator('p').first();
    this.totalOrders = page.locator('h3:has-text("Total Orders")').locator('..').locator('p').first();
    this.totalRevenue = page.locator('h3:has-text("Total Revenue")').locator('..').locator('p').first();
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/web/admin');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToAdminFromNavbar(): Promise<void> {
    await this.scrollToElement(this.adminLink);
    await this.adminLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getTotalUsers(): Promise<string | null> {
    return await this.totalUsers.textContent();
  }

  async getTotalProducts(): Promise<string | null> {
    return await this.totalProducts.textContent();
  }

  async getTotalOrders(): Promise<string | null> {
    return await this.totalOrders.textContent();
  }

  async getTotalRevenue(): Promise<string | null> {
    return await this.totalRevenue.textContent();
  }

  async getDashboardStats(): Promise<{
    totalUsers: string | null;
    totalProducts: string | null;
    totalOrders: string | null;
    totalRevenue: string | null;
  }> {
    return {
      totalUsers: await this.getTotalUsers(),
      totalProducts: await this.getTotalProducts(),
      totalOrders: await this.getTotalOrders(),
      totalRevenue: await this.getTotalRevenue()
    };
  }

  async isAdminPageLoaded(): Promise<boolean> {
    return await this.pageHeading.isVisible();
  }
}

