import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly minPriceInput: Locator;
  readonly maxPriceInput: Locator;
  readonly applyFiltersButton: Locator;
  readonly clearButton: Locator;
  readonly productCards: Locator;
  readonly paginationButtons: Locator;
  readonly noProductsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('h1:has-text("Our Products")');
    this.searchInput = page.locator('input[placeholder="Search products..."]');
    this.categoryFilter = page.locator('select, combobox').first();
    this.minPriceInput = page.locator('input[type="number"]').first();
    this.maxPriceInput = page.locator('input[type="number"]').last();
    this.applyFiltersButton = page.locator('button:has-text("Apply Filters")');
    this.clearButton = page.locator('button:has-text("Clear")');
    this.productCards = page.locator('div').filter({ hasText: 'Stock:' }).filter({ has: page.locator('h3') });
    this.paginationButtons = page.locator('.pagination button, button[class*="page"]');
    this.noProductsMessage = page.locator('text=No products found');
  }

  /**
   * Navigates to the products page and waits for it to load
   * Handles navigation conflicts by checking current URL first
   */
  /**
   * Waits for navigation to products page to complete
   */
  async waitForProductsPageNavigation(): Promise<void> {
    await this.page.waitForURL('**/web/products**', { timeout: 10000 });
  }

  async navigateTo(): Promise<void> {
    const targetUrl = '/web/products';
    const currentUrl = this.page.url();
    
    // If already on the products page, just wait for it to be ready
    if (currentUrl.includes('/web/products')) {
      await this.page.waitForLoadState('networkidle');
      await this.pageHeading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      return;
    }
    
    // Wait for any ongoing navigation to complete before starting a new one
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch {
      // If navigation is in progress, wait for it to complete
      await this.page.waitForLoadState('load', { timeout: 10000 });
    }
    
    // Navigate to products page with proper error handling
    try {
      await this.page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (error) {
      // If navigation was interrupted, wait for the page to settle
      if (error instanceof Error && error.message.includes('interrupted')) {
        await this.page.waitForURL('**/web/products**', { timeout: 15000 });
        await this.page.waitForLoadState('networkidle');
      } else {
        throw error;
      }
    }
    
    // Wait for page heading to be visible
    await this.pageHeading.waitFor({ state: 'visible', timeout: 10000 });
  }

  async searchProduct(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
  }

  async selectCategory(category: string): Promise<void> {
    await this.categoryFilter.selectOption(category);
  }

  async setMinPrice(price: number): Promise<void> {
    await this.minPriceInput.fill(price.toString());
  }

  async setMaxPrice(price: number): Promise<void> {
    await this.maxPriceInput.fill(price.toString());
  }

  async applyFilters(): Promise<void> {
    await this.applyFiltersButton.scrollIntoViewIfNeeded();
    await this.applyFiltersButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clearFilters(): Promise<void> {
    await this.clearButton.scrollIntoViewIfNeeded();
    await this.clearButton.click();
    await this.page.waitForTimeout(1000);
  }

  async getProductCount(): Promise<number> {
    await this.page.waitForTimeout(500);
    return await this.productCards.count();
  }

  async getProductByIndex(index: number): Promise<{ name: string | null; category: string | null; price: string | null; stock: string | null; card: Locator }> {
    const card = this.productCards.nth(index);
    return {
      name: await card.locator('h3').first().textContent(),
      category: await card.locator('p').first().textContent(),
      price: await card.locator('p:has-text("$")').first().textContent(),
      stock: await card.locator('p:has-text("Stock:")').first().textContent(),
      card: card
    };
  }

  async clickViewDetails(index: number): Promise<void> {
    const card = this.productCards.nth(index);
    await card.scrollIntoViewIfNeeded();
    const viewDetailsBtn = card.locator('a:has-text("View Details")').first();
    await viewDetailsBtn.scrollIntoViewIfNeeded();
    await viewDetailsBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddToCart(index: number): Promise<number> {
    const card = this.productCards.nth(index);
    await card.scrollIntoViewIfNeeded();
    const initialCartCount = await this.getCartBadgeCount();
    const addToCartBtn = card.locator('button:has-text("Add to Cart")').first();
    await addToCartBtn.scrollIntoViewIfNeeded();
    await addToCartBtn.click();
    await this.page.waitForTimeout(500);
    return initialCartCount;
  }

  async clickLikeButton(index: number): Promise<void> {
    const card = this.productCards.nth(index);
    await card.scrollIntoViewIfNeeded();
    const likeButton = card.locator('button:has-text("Like"), button:has-text("Liked")').first();
    await likeButton.scrollIntoViewIfNeeded();
    await likeButton.click();
    await this.page.waitForTimeout(500);
  }

  async getLikeCount(index: number): Promise<number> {
    const card = this.productCards.nth(index);
    const likeButton = card.locator('button:has-text("Like"), button:has-text("Liked")').first();
    const text = await likeButton.textContent();
    const match = text ? text.match(/\d+/) : null;
    return match ? parseInt(match[0]) : 0;
  }

  async isProductLiked(index: number): Promise<boolean> {
    const card = this.productCards.nth(index);
    const likedButton = card.locator('button:has-text("❤️ Liked")');
    return await likedButton.isVisible();
  }

  async getPaginationButtonCount(): Promise<number> {
    return await this.paginationButtons.count();
  }

  async clickPaginationButton(pageNumber: number): Promise<void> {
    const paginationBtn = this.paginationButtons.filter({ hasText: new RegExp(`^${pageNumber}$`) }).first();
    await paginationBtn.scrollIntoViewIfNeeded();
    await paginationBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async isPaginationButtonActive(pageNumber: number): Promise<boolean> {
    const button = this.paginationButtons.filter({ hasText: new RegExp(`^${pageNumber}$`) }).first();
    await button.scrollIntoViewIfNeeded();
    const className = await button.getAttribute('class');
    return className !== null && className.includes('active');
  }

  async getAllProductNames(): Promise<string[]> {
    const count = await this.getProductCount();
    const names: string[] = [];
    const maxToCheck = Math.min(count, 5);
    for (let i = 0; i < maxToCheck; i++) {
      try {
        const product = await this.getProductByIndex(i);
        if (product.name) {
          names.push(product.name);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`Error getting product at index ${i}: ${errorMessage}`);
      }
    }
    return names;
  }

  async validatePriceFormat(): Promise<Array<{ valid: boolean; price: string | null }>> {
    const count = await this.getProductCount();
    const results: Array<{ valid: boolean; price: string | null }> = [];
    const maxToCheck = Math.min(count, 5);
    for (let i = 0; i < maxToCheck; i++) {
      try {
        const product = await this.getProductByIndex(i);
        const priceMatch = product.price ? product.price.match(/\$(\d+\.\d{2})/) : null;
        results.push({
          valid: !!priceMatch,
          price: product.price
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`Error getting product at index ${i}: ${errorMessage}`);
      }
    }
    return results;
  }
}

