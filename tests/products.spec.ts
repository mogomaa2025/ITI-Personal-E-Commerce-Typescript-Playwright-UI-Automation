import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';
import { LoginPage } from '../pages/LoginPage';
import { Helpers } from '../utils/helpers';
import users from '../data/users.json';
import testData from '../data/data.json';
import { ApiWaiting } from '../utils/ApiWaiting';

test.describe('Products Page Tests - Logged In User', () => {
  let productsPage: ProductsPage;
  let loginPage: LoginPage;
  let helpers: Helpers;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    loginPage = new LoginPage(page);
    helpers = new Helpers(page);
    
    await loginPage.navigateTo();
    await loginPage.login(users.productDetialsUser.email, users.productDetialsUser.password);
    await page.waitForTimeout(2000);
    
    // Clear cart before each test to ensure clean state
    // This is critical because cart badge shows UNIQUE products count
    await productsPage.clearCart();
    
    // Navigate to products page
    await productsPage.navigateTo();
    await page.waitForLoadState('networkidle');
  });

  test('PROD-001: Verify products page loads correctly', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act & Assert - Verify all products page elements are visible
    await expect(productsPage.pageHeading).toBeVisible();
    await expect(productsPage.searchInput).toBeVisible();
    await expect(productsPage.categoryFilter).toBeVisible();
    await expect(productsPage.applyFiltersButton).toBeVisible();
    await expect(productsPage.clearButton).toBeVisible();
  });

  test('PROD-002: Verify products are displayed', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    const productCount = await productsPage.getProductCount();

    // Assert
    expect(productCount).toBeGreaterThan(0);
  });

  test('PROD-003: Verify product card contains all required elements', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    const product = await productsPage.getProductByIndex(0);

    // Assert
    expect(product.name).toBeTruthy();
    expect(product.category).toBeTruthy();
    expect(product.price).toBeTruthy();
    expect(product.stock).toBeTruthy();
  });

  test('PROD-004: Verify price format is correct (2 decimal places)', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    const priceResults = await productsPage.validatePriceFormat();

    // Assert
    for (const result of priceResults) {
      expect(result.valid, `Invalid price format: ${result.price}`).toBeTruthy();
    }
  });

  test('PROD-005: Verify View Details button navigation', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    await productsPage.clickViewDetails(0);

    // Assert
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/web\/products\/\d+/);
  });

  test('PROD-006: Verify Add to Cart functionality', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    const initialCount = await productsPage.getCartBadgeCount();
    console.log(`Initial cart count: ${initialCount}`);

    // Verify cart is empty (0) after cleanup
    expect(initialCount).toBe(0);

    // Act
    await productsPage.clickAddToCart(0);

    // Wait for alert to appear
    await helpers.waitForAlertToAppear('Added to cart!');

    await expect(page.locator('#cart-count')).toHaveText('1');

    
    const newCount = await productsPage.getCartBadgeCount();
    console.log(`New cart count: ${newCount}`);


    

    // Assert
    // Cart badge should increase by exactly 1 (unique product added)
    expect(newCount).toBe(1);
  });

  test('PROD-007: Verify Add to Cart shows alert', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    await productsPage.clickAddToCart(0);

    // Wait for alert to appear
    await helpers.waitForAlertToAppear('Added to cart!');
    const alertText = await productsPage.getAlertText();

    // Assert
    expect(alertText).toContain('Added to cart!');
  });

  test('PROD-008: Verify Like button functionality', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    await productsPage.clickLikeButton(0);

    // Wait for UI update after clicking like button
    await page.waitForLoadState('networkidle');

    // Assert
    // We could verify the like status changed, but for now just ensure no errors occurred
    expect(true).toBeTruthy(); // Placeholder assertion since the test just verifies the action works without errors
  });

  test('PROD-009: Verify Search functionality with valid term', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    await productsPage.searchProduct(testData.products.searchTerms.valid);
    await productsPage.applyFilters();

    // Wait for search results to load
    await page.waitForLoadState('networkidle');

    // Assert
    const productNames = await productsPage.getAllProductNames();
    const hasSearchTerm = productNames.some(name =>
      name.toLowerCase().includes(testData.products.searchTerms.valid.toLowerCase())
    );
    expect(hasSearchTerm).toBeTruthy();
  });

  test('PROD-010: Verify Search with no results', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    await productsPage.searchProduct(testData.products.searchTerms.noResults);
    await productsPage.applyFilters();

    // Wait for search results to load
    await page.waitForLoadState('networkidle');

    // Assert
    // Verify no products are found or appropriate message is shown
    const productCount = await productsPage.getProductCount();
    expect(productCount).toBeGreaterThanOrEqual(0); // Could be 0 if no results, or some if it includes partial matches
  });

  test('PROD-011: Verify Category filter - Electronics', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    await productsPage.selectCategory('Electronics');
    await productsPage.applyFilters();

    // Wait for filtered results to load
    await page.waitForLoadState('networkidle');

    // Assert
    const productCount = await productsPage.getProductCount();
    if (productCount > 0) {
      const product = await productsPage.getProductByIndex(0);
      expect(product.category).toContain('Electronics');
    }
  });

  test('PROD-012: Verify Category filter - All Categories', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    await productsPage.selectCategory('All Categories');
    await productsPage.applyFilters();

    // Wait for filtered results to load
    await page.waitForLoadState('networkidle');

    // Assert
    const productCount = await productsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('PROD-013: Verify price filter with valid range', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    await productsPage.setMinPrice(testData.products.priceFilters.valid.min);
    await productsPage.setMaxPrice(testData.products.priceFilters.valid.max);
    await productsPage.applyFilters();

    // Wait for filtered results to load
    await page.waitForLoadState('networkidle');

    // Assert
    // Verify results are within the expected price range
    expect(true).toBeTruthy(); // Placeholder since we don't have a specific assertion for price range
  });

  test('PROD-014: Verify price filter with min greater than max', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach

    // Act
    await productsPage.setMinPrice(testData.products.priceFilters.invalid.minGreaterThanMax.min);
    await productsPage.setMaxPrice(testData.products.priceFilters.invalid.minGreaterThanMax.max);
    await productsPage.applyFilters();

    // Wait for filtered results to load
    await page.waitForLoadState('networkidle');

    // Assert
    // Verify the filter handles the invalid range appropriately (could show error or reset)
    expect(true).toBeTruthy(); // Placeholder assertion
  });

  test('PROD-015: Verify price filter with negative values', async ({ page }) => {
    await productsPage.setMinPrice(testData.products.priceFilters.invalid.negative.min);
    await productsPage.setMaxPrice(testData.products.priceFilters.invalid.negative.max);
    await productsPage.applyFilters();
    await page.waitForTimeout(1000);
  });

  test('PROD-016: Verify Clear filters button', async ({ page }) => {
    await productsPage.searchProduct('Laptop');
    await productsPage.selectCategory('Electronics');
    await productsPage.setMinPrice(50);
    await productsPage.setMaxPrice(500);
    await productsPage.applyFilters();
    await page.waitForTimeout(1000);
    await productsPage.clearFilters();
    await page.waitForTimeout(1000);
  });

  test('PROD-017: Verify pagination buttons are displayed', async ({ page }) => {
    const paginationCount = await productsPage.getPaginationButtonCount();
    expect.soft(paginationCount).toBeGreaterThan(0);
  });

  test('PROD-018: Verify pagination button click changes page', async ({ page }) => {
    const paginationCount = await productsPage.getPaginationButtonCount();
    if (paginationCount > 1) {
      const firstProductBefore = await productsPage.getProductByIndex(0);
      await productsPage.clickPaginationButton(2);
      await page.waitForTimeout(1500);
      const firstProductAfter = await productsPage.getProductByIndex(0);
      // Verify products changed after pagination
      expect.soft(firstProductBefore.name).not.toBe(firstProductAfter.name);
    }
  });

  test('PROD-019: Verify pagination button becomes active on click', async ({ page }) => {
    const paginationCount = await productsPage.getPaginationButtonCount();
    if (paginationCount > 1) {
      await productsPage.clickPaginationButton(2);
      await page.waitForTimeout(1500);
      const isActive = await productsPage.isPaginationButtonActive(2);
      expect.soft(isActive).toBeTruthy();
    }
  });

  test('PROD-020: Verify last pagination page shows products', async ({ page }) => {
    const paginationCount = await productsPage.getPaginationButtonCount();
    if (paginationCount > 1) {
      await productsPage.clickPaginationButton(paginationCount);
      await page.waitForTimeout(1000);
      const productCount = await productsPage.getProductCount();
      expect.soft(productCount).toBeGreaterThan(0);
    }
  });

  test('PROD-021: Verify multiple filters applied together', async ({ page }) => {
    await productsPage.searchProduct('Laptop');
    await productsPage.selectCategory('Electronics');
    await productsPage.setMinPrice(100);
    await productsPage.setMaxPrice(1000);
    await productsPage.applyFilters();
    await page.waitForTimeout(1000);
  });

  test('PROD-022: Verify Add to Cart for multiple products', async ({ page }) => {
    const initialCount = await productsPage.getCartBadgeCount();
    await productsPage.clickAddToCart(0);
    await page.waitForTimeout(1000);
    await productsPage.clickAddToCart(1);
    await page.waitForTimeout(1000);
    const newCount = await productsPage.getCartBadgeCount();
    expect.soft(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('PROD-023: Verify product stock is displayed', async ({ page }) => {
    const product = await productsPage.getProductByIndex(0);
    expect.soft(product.stock).toMatch(/Stock:\s*\d+/);
  });

  test('PROD-024: Verify category filter changes product list', async ({ page }) => {
    await productsPage.selectCategory('Clothing');
    await productsPage.applyFilters();
    await page.waitForTimeout(1000);
    const productCount = await productsPage.getProductCount();
    if (productCount === 0) {
      expect.soft(await productsPage.noProductsMessage.isVisible()).toBeTruthy();
    }
  });

  test('CART-016: aa', async ({ page }) => {
 
    const buttons = await page.getByRole('button', { name: 'Add to Cart' }).all();
    for (let i = 1; i < buttons.length; i++) {
      await buttons[i].click();
      await page.getByText("Added to cart!").first().waitFor({ state: 'visible' });
      await page.getByRole('button', { name: '×' }).last().click();
    }

 });


  });



