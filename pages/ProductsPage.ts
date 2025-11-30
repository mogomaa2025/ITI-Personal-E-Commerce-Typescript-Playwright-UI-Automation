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

  /**
   * Applies the selected filters to the product list
   */
  async applyFilters(): Promise<void> {
    try {
      await this.applyFiltersButton.scrollIntoViewIfNeeded();
      await this.applyFiltersButton.waitFor({ state: 'visible' });
      await this.applyFiltersButton.click();
      // Wait for the page to update after filtering
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Failed to apply filters: ${error.message}`);
    }
  }

  /**
   * Clears all applied filters
   */
  async clearFilters(): Promise<void> {
    try {
      await this.clearButton.scrollIntoViewIfNeeded();
      await this.clearButton.waitFor({ state: 'visible' });
      await this.clearButton.click();
      // Wait for the page to update after clearing filters
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Failed to clear filters: ${error.message}`);
    }
  }

  /**
   * Gets the count of products displayed on the page
   */
  async getProductCount(): Promise<number> {
    try {
      // Wait for product cards to be attached to the DOM
      await this.productCards.first().waitFor({ state: 'attached', timeout: 5000 });
      return await this.productCards.count();
    } catch (error: any) {
      // If no products are found, return 0
      return 0;
    }
  }

  /**
   * Gets product details at the specified index
   * @param index - The index of the product card to get details for
   */
  async getProductByIndex(index: number): Promise<{ name: string | null; category: string | null; price: string | null; stock: string | null; card: Locator }> {
    try {
      const card = this.productCards.nth(index);
      await card.waitFor({ state: 'visible', timeout: 5000 });

      // Wait for each element inside the card to be visible
      const nameLocator = card.locator('h3').first();
      await nameLocator.waitFor({ state: 'visible', timeout: 2000 });
      const name = await nameLocator.textContent();

      const categoryLocator = card.locator('p').first();
      await categoryLocator.waitFor({ state: 'visible', timeout: 2000 });
      const category = await categoryLocator.textContent();

      const priceLocator = card.locator('p:has-text("$")').first();
      await priceLocator.waitFor({ state: 'visible', timeout: 2000 });
      const price = await priceLocator.textContent();

      const stockLocator = card.locator('p:has-text("Stock:")').first();
      await stockLocator.waitFor({ state: 'visible', timeout: 2000 });
      const stock = await stockLocator.textContent();

      return {
        name,
        category,
        price,
        stock,
        card: card
      };
    } catch (error: any) {
      throw new Error(`Failed to get product by index ${index}: ${error.message}`);
    }
  }

  /**
   * Clicks the "View Details" button for a product at the specified index
   * @param index - The index of the product card to view details for
   */
  async clickViewDetails(index: number): Promise<void> {
    try {
      const card = this.productCards.nth(index);
      await card.scrollIntoViewIfNeeded();
      await card.waitFor({ state: 'visible' });

      const viewDetailsBtn = card.locator('a:has-text("View Details")').first();
      await viewDetailsBtn.scrollIntoViewIfNeeded();
      await viewDetailsBtn.waitFor({ state: 'visible' });
      await viewDetailsBtn.click();

      // Wait for navigation to product details page
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Failed to click view details for product at index ${index}: ${error.message}`);
    }
  }

  /**
   * Clicks the "Add to Cart" button for a product at the specified index
   * @param index - The index of the product card to add to cart
   * @returns The initial cart count before adding the product
   */
  async clickAddToCart(index: number): Promise<number> {
    try {
      const card = this.productCards.nth(index);
      await card.scrollIntoViewIfNeeded();
      const initialCartCount = await this.getCartBadgeCount();
      const addToCartBtn = card.locator('button:has-text("Add to Cart")').first();
      await addToCartBtn.scrollIntoViewIfNeeded();
      await addToCartBtn.waitFor({ state: 'visible' });
      await addToCartBtn.click();

      // Wait for any UI updates after clicking add to cart
      await this.page.waitForLoadState('networkidle');
      return initialCartCount;
    } catch (error: any) {
      throw new Error(`Failed to click add to cart for product at index ${index}: ${error.message}`);
    }
  }

  /**
   * Clicks the like button for a product at the specified index
   * @param index - The index of the product card to like
   */
  async clickLikeButton(index: number): Promise<void> {
    try {
      const card = this.productCards.nth(index);
      await card.scrollIntoViewIfNeeded();
      const likeButton = card.locator('button:has-text("Like"), button:has-text("Liked")').first();
      await likeButton.scrollIntoViewIfNeeded();
      await likeButton.waitFor({ state: 'visible' });
      await likeButton.click();
      // Wait for any UI updates after clicking like
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Failed to click like button for product at index ${index}: ${error.message}`);
    }
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

  /**
   * Clicks the pagination button for the specified page number
   * @param pageNumber - The page number to navigate to
   */
  async clickPaginationButton(pageNumber: number): Promise<void> {
    try {
      const paginationBtn = this.paginationButtons.filter({ hasText: new RegExp(`^${pageNumber}$`) }).first();
      await paginationBtn.scrollIntoViewIfNeeded();
      await paginationBtn.waitFor({ state: 'visible' });
      await paginationBtn.click();
      // Wait for page to load after pagination click
      await this.page.waitForLoadState('networkidle');
    } catch (error: any) {
      throw new Error(`Failed to click pagination button for page ${pageNumber}: ${error.message}`);
    }
  }

  /**
   * Checks if a pagination button is active (selected)
   * @param pageNumber - The page number to check for active state
   */
  async isPaginationButtonActive(pageNumber: number): Promise<boolean> {
    try {
      const button = this.paginationButtons.filter({ hasText: new RegExp(`^${pageNumber}$`) }).first();
      await button.scrollIntoViewIfNeeded();
      await button.waitFor({ state: 'visible' });
      const className = await button.getAttribute('class');
      return className !== null && className.includes('active');
    } catch (error: any) {
      // If the button doesn't exist or is not visible, return false
      return false;
    }
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

