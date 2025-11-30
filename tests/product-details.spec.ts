import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import users from '../data/users.json';
import urls from '../data/urls.json';

test.describe('Product Details Page Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let productDetailsPage: ProductDetailsPage;
  let cartPage: CartPage;
  let savedProductData: any;
  let productId: string;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    productDetailsPage = new ProductDetailsPage(page);
    cartPage = new CartPage(page);

    // Login first
    await loginPage.navigateTo();
    await loginPage.login(users.productDetialsUser.email, users.productDetialsUser.password);
    await page.waitForTimeout(2000);

    // Clear cart
    await productsPage.clearCart();

    // Navigate to products page
    await productsPage.navigateTo();
    await page.waitForLoadState('networkidle');
  });

  test('PDET-001: Verify Login and Navigation', async ({ page }) => {
    // Arrange - Already logged in and on products page from beforeEach

    // Act & Assert
    expect(page.url()).toContain('/web/products');
  });

  test('PDET-002: Verify View Details Navigation', async ({ page }) => {
    // Click View Details for first product
    const firstProduct = await productsPage.getProductByIndex(0);
    savedProductData = firstProduct;
    await productsPage.clickViewDetails(0);

    productId = page.url().split('/').pop() || '1';

    // Check if on product details page
    expect(page.url()).toMatch(/\/web\/products\/\d+/);
  });

  test('PDET-003: Verify Product Image Display', async ({ page }) => {
    await productsPage.clickViewDetails(0);
    expect(await productDetailsPage.isProductImageVisible()).toBeTruthy();
  });

  test('PDET-004: Verify Product Stock Badge', async ({ page }) => {
    await productsPage.clickViewDetails(0);
    expect(await productDetailsPage.isProductStockBadgeVisible()).toBeTruthy();
  });

  test('PDET-005: Verify Product Name', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    const productCard = await productsPage.getProductByIndex(0);
    savedProductData = productCard;
    await productsPage.clickViewDetails(0);

    // Act
    const name = await productDetailsPage.getProductName();

    // Assert
    expect(name).toBeTruthy();
    expect(name).toBe(productCard.name);
  });

  test('PDET-006: Verify Product Category', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    const productCard = await productsPage.getProductByIndex(0);
    savedProductData = productCard;
    await productsPage.clickViewDetails(0);

    // Act
    const category = await productDetailsPage.getProductCategory();

    // Assert
    expect(category).toBeTruthy();
    expect(category).toBe(productCard.category);
  });

  test('PDET-007: Verify Product Price Format', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    await productsPage.clickViewDetails(0);

    // Act
    const price = await productDetailsPage.getProductPrice();
    const isPriceValid = await productDetailsPage.isPriceValid();

    // Assert
    expect(price).toBeTruthy();
    expect(isPriceValid).toBeTruthy();
  });

  test('PDET-008: Verify Product Stars and Reviews', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    await productsPage.clickViewDetails(0);

    // Act
    const stars = await productDetailsPage.getProductStars();
    const reviewsCount = await productDetailsPage.getProductReviewsCount();

    // Assert
    expect(stars).toBeGreaterThanOrEqual(0);
    expect(stars).toBeLessThanOrEqual(5);
    expect(reviewsCount).toBeLessThanOrEqual(5);
  });

  test('PDET-009: Verify Product Description', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    await productsPage.clickViewDetails(0);

    // Act
    const description = await productDetailsPage.getProductDescription();

    // Assert
    expect(description).toBeTruthy();
  });

  test('PDET-010: Verify Product Stock Information', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    await productsPage.clickViewDetails(0);

    // Act
    const stock = await productDetailsPage.getProductStock();

    // Assert
    expect(stock).toBeTruthy();
  });

  test('PDET-011: Verify Increase Quantity Button', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    await productsPage.clickViewDetails(0);

    // Act & Assert
    expect(await productDetailsPage.isBtnIncreaseQtyVisible()).toBeTruthy();
  });

  test('PDET-012: Verify Decrease Quantity Button', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    await productsPage.clickViewDetails(0);

    // Act & Assert
    expect(await productDetailsPage.isBtnDecreaseQtyVisible()).toBeTruthy();
  });

  test('PDET-013: Verify Quantity Input and Cart', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    await productsPage.clickViewDetails(0);
    productId = page.url().split('/').pop() || '1';

    // Clear cart first
    await productDetailsPage.clearCart();

    // Navigate back to product details
    await page.goto(`${urls.baseUrl}/web/products/${productId}`);
    await page.waitForLoadState('networkidle');

    // Act - Set quantity to 3 and add to cart
    await productDetailsPage.setQuantityInput(3);
    const newQty = await productDetailsPage.getQuantityInputValue();

    await productDetailsPage.clickAddToCart();
    await page.waitForLoadState('networkidle');

    // Navigate to cart to verify quantity
    await cartPage.navigateTo();
    // Check if cart has items
    const cartHasItems = await cartPage.isCartEmpty().then(empty => !empty);

    // Assert
    expect(newQty).toBe('3');

    // Check if cart has at least 1 product (cart badge shows unique products)
    expect(cartHasItems).toBeTruthy();
  });

  test('PDET-014: Verify Like Product Button', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    await productsPage.clickViewDetails(0);

    // Act - Click like button
    await productDetailsPage.clickLikeProduct();
    await page.waitForLoadState('networkidle');

    // Assert - Check for alert or verify product is liked
    const alertText = await productDetailsPage.getAlertText();
    if (alertText && alertText.includes('You have already liked this product!')) {
      expect(alertText).toContain('You have already liked this product!');
    } else {
      // If not already liked, it should be liked now
      expect(await productDetailsPage.isProductLiked()).toBeTruthy();
    }
  });

  test('PDET-015: Verify Add to Wishlist Button', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    await productsPage.clickViewDetails(0);

    // Act - Click add to wishlist
    await productDetailsPage.clickAddToWishlist();
    await page.waitForLoadState('networkidle');

    // Assert - Check for alert
    const alertText = await productDetailsPage.getAlertText();
    if (alertText) {
      expect(alertText).toMatch(/Item added to wishlist|Product already in wishlist/);
    }
  });

  test('PDET-016: Verify Back to Products Button', async ({ page }) => {
    // Arrange - Page objects already initialized in beforeEach
    await productsPage.clickViewDetails(0);

    // Act - Click back to products
    await productDetailsPage.clickBackToProducts();
    await page.waitForLoadState('networkidle');

    // Assert - Check navigation
    expect(await productDetailsPage.isOnProductsPage()).toBeTruthy();
  });

  test('PDET-017: Verify Write Review Functionality', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    // Click write review
    await productDetailsPage.clickWriteReview();
    await page.waitForTimeout(1000);

    // Check review form is visible
    expect.soft(await productDetailsPage.isReviewFormVisible()).toBeTruthy();

    // Write and submit review
    await productDetailsPage.writeReview('This is a test review.');
    await productDetailsPage.submitReview();
    await page.waitForTimeout(2000);

    // Check if review was posted (alert or new review in list)
    const alertText = await productDetailsPage.getAlertText();
    if (alertText) {
      expect.soft(alertText).toMatch(/Review submitted|successfully/);
    }
  });

  test('PDET-018: Verify Average Rating Value', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    const avgValue = await productDetailsPage.getAvgRatingValue();
    expect.soft(avgValue).toBeTruthy();
  });

  test('PDET-019: Verify Average Rating Stars', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    const avgStars = await productDetailsPage.getAvgRatingStars();
    expect.soft(avgStars).toBeGreaterThanOrEqual(0);
    expect.soft(avgStars).toBeLessThanOrEqual(5);
  });

  test('PDET-020: Verify Total Reviews Count', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    const totalReviews = await productDetailsPage.getTotalReviewsCount();
    expect.soft(totalReviews).toBeGreaterThanOrEqual(0);
  });

  test('PDET-021: Verify Reviews List and Cards', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    // Check reviews list is visible
    expect.soft(await productDetailsPage.isReviewsListVisible()).toBeTruthy();

    // Check review cards
    const reviewCount = await productDetailsPage.getReviewCardsCount();
    expect.soft(reviewCount).toBeGreaterThanOrEqual(0);

    if (reviewCount > 0) {
      const review = await productDetailsPage.getReviewCardContent(0);
      expect.soft(review.rating).toBeGreaterThanOrEqual(0);
      expect.soft(review.text).toBeTruthy();
    }
  });

  test('PDET-022: Verify Specifications Tab', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    // Click specifications tab
    await productDetailsPage.clickTabSpecifications();
    await page.waitForTimeout(1000);

    // Verify tab is clickable (specifications should be visible)
    const specProductId = await productDetailsPage.getSpecProductId();
    expect.soft(specProductId).toBeTruthy();
  });

  test('PDET-023: Verify Product Specifications', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    // Click specifications tab
    await productDetailsPage.clickTabSpecifications();
    await page.waitForTimeout(1000);

    // Check Product ID
    const productId = await productDetailsPage.getSpecProductId();
    expect.soft(productId).toBeTruthy();

    // Check Category
    const specCategory = await productDetailsPage.getSpecCategory();
    expect.soft(specCategory).toBeTruthy();

    // Check Stock
    const specStock = await productDetailsPage.getSpecStock();
    expect.soft(specStock).toBeTruthy();

    // Check Price
    const specPrice = await productDetailsPage.getSpecPrice();
    expect.soft(specPrice).toBeTruthy();

    // Check Added Date
    const addedDate = await productDetailsPage.getSpecAddedDate();
    expect.soft(addedDate).toBeTruthy();
  });

  test('PDET-024: Verify Non-Registered User Access', async ({ page }) => {
    // Logout first
    await productDetailsPage.logout();
    await page.waitForLoadState('networkidle');

    // Try to access product details
    await page.goto(`${urls.baseUrl}/web/products/1`);
    await page.waitForLoadState('networkidle');

    // Check if redirected or limited functionality
    // This depends on the app's behavior for non-registered users
    // For example, might not be able to add to cart, like, etc.
    const addToCartBtn = page.locator('#btn-add-to-cart-detail');
    if (await addToCartBtn.isVisible()) {
      // If visible, check if it requires login
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
      const alertText = await productDetailsPage.getAlertText();
      if (alertText) {
        expect.soft(alertText.toLowerCase()).toMatch(/login|please login/);
      }
    }
  });
});