import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly welcomeHeading: Locator;
  readonly shopNowButton: Locator;
  readonly whyChooseUsHeading: Locator;
  readonly shopByCategoryHeading: Locator;
  readonly qualityProductsCard: Locator;
  readonly fastDeliveryCard: Locator;
  readonly supportCard: Locator;
  readonly categoryCards: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeHeading = page.locator('h1:has-text("Welcome to E-Commerce Store")');
    const h1HeroTitle = page.locator("#hero-title")

    this.shopNowButton = page.locator('a:has-text("Shop Now")');
    this.whyChooseUsHeading = page.locator('h2:has-text("Why Choose Us")');
    this.shopByCategoryHeading = page.locator('h2:has-text("Shop by Category")');
    this.qualityProductsCard = page.locator('h3:has-text("Quality Products")');
    this.fastDeliveryCard = page.locator('h3:has-text("Fast Delivery")');
    this.supportCard = page.locator('h3:has-text("24/7 Support")');
    this.categoryCards = page.locator('.category-card, a[href*="/web/products?category="]');
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async clickShopNow(): Promise<void> {
    await this.shopNowButton.scrollIntoViewIfNeeded();
    await this.shopNowButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickCategory(categoryName: string): Promise<void> {
    const categoryLink = this.page.locator(`a[href="/web/products?category=${categoryName}"]`).first();
    await categoryLink.scrollIntoViewIfNeeded();
    await categoryLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getCategoryCards(): Promise<number> {
    return await this.categoryCards.count();
  }

  async getAllCategoryNames(): Promise<Array<string | null>> {
    const categories: Array<string | null> = [];
    const count = await this.categoryCards.count();
    for (let i = 0; i < count; i++) {
      const card = this.categoryCards.nth(i);
      const heading = card.locator('h3');
      if (await heading.isVisible()) {
        categories.push(await heading.textContent());
      }
    }
    return categories;
  }

  async isWhyChooseUsSectionVisible(): Promise<{ heading: boolean; qualityProducts: boolean; fastDelivery: boolean; support: boolean }> {
    return {
      heading: await this.whyChooseUsHeading.isVisible(),
      qualityProducts: await this.qualityProductsCard.isVisible(),
      fastDelivery: await this.fastDeliveryCard.isVisible(),
      support: await this.supportCard.isVisible()
    };
  }

  async checkNavbarForLoggedInUser(): Promise<{ profile: boolean; wishlist: boolean; notifications: boolean; logout: boolean; loginRegister: boolean }> {
    return {
      profile: await this.profileLink.isVisible(),
      wishlist: await this.wishlistLink.isVisible(),
      notifications: await this.notificationsLink.isVisible(),
      logout: await this.logoutButton.isVisible(),
      loginRegister: await this.loginLink.isVisible()
    };
  }

  async checkNavbarForAdmin(): Promise<{ admin: boolean; profile: boolean; logout: boolean }> {
    return {
      admin: await this.adminLink.isVisible(),
      profile: await this.profileLink.isVisible(),
      logout: await this.logoutButton.isVisible()
    };
  }

  async checkNavbarForGuest(): Promise<{ loginRegister: boolean; register: boolean }> {
    return {
      loginRegister: await this.loginLink.isVisible(),
      register: await this.registerLink.isVisible()
    };
  }
}
