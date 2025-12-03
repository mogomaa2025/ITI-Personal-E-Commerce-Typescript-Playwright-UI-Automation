import { Page, Locator, expect, TestInfo } from '@playwright/test';

export class BasePage {

  readonly page: Page;
  readonly logoutButton: Locator;
  readonly cartBadge: Locator;
  readonly generalImage: Locator;
  readonly productsNavBar: Locator;


  constructor(page: Page) {
    this.page = page;
    this.logoutButton = this.page.getByRole('button', { name: 'Logout' });
    this.cartBadge = this.page.getByRole('link', { name: "cart" });
    this.generalImage = this.page.getByRole('img');
    this.productsNavBar = this.page.getByRole('link', { name: 'Products' });
  }




  // wait networkidle
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

}
