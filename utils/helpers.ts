import { Page, TestInfo, expect } from '@playwright/test';

export class Helpers {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForAlertToAppear(alertText: string, timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector(`.alert:has-text("${alertText}")`, { timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  async waitForAlertToDisappear(alertText: string, timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector(`.alert:has-text("${alertText}")`, { state: 'hidden', timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  async waitForElementToLoad(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  async waitForNavigation(expectedUrl: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForURL(expectedUrl, { timeout });
  }

  async waitForCartBadgeCount(expectedCount: number, timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        (count) => {
          const cartLink = document.querySelector('a[href="/web/cart"]');
          return cartLink && cartLink.textContent !== null && cartLink.textContent.includes(count.toString());
        },
        expectedCount,
        { timeout }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAlertText(): Promise<string | null> {
    const alert = await this.page.locator('.alert').first();
    if (await alert.isVisible()) {
      return await alert.textContent();
    }
    return null;
  }

  async closeAlert(): Promise<void> {
    const closeButton = this.page.locator('.alert button');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  async takeScreenshotOnFailure(testInfo: TestInfo, stepName: string): Promise<void> {
    if (testInfo.status !== 'passed') {
      await this.page.waitForLoadState('networkidle');
      const screenshot = await this.page.screenshot({ fullPage: true });
      await testInfo.attach(`${stepName}-failure`, {
        body: screenshot,
        contentType: 'image/png'
      });
    }
  }

  async softExpect(expectFn: typeof expect, condition: () => Promise<void>, message: string): Promise<void> {
    try {
      await condition();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      expectFn.soft(false, `${message}: ${errorMessage}`).toBeTruthy();
    }
  }
}
