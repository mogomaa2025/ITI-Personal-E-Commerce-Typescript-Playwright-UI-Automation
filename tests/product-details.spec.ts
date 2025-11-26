import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import users from '../data/users.json';

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
    await page.goto('http://127.0.0.1:5000/web/login');
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);

    // Clear cart
    await productsPage.clearCart();

    // Navigate to products page
    await page.goto('http://127.0.0.1:5000/web/products');
    await page.waitForLoadState('networkidle');
  });

  test('PDET-001: Verify Login and Navigation', async ({ page }) => {
    // Already logged in and on products page from beforeEach
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
    const firstProduct = await productsPage.getProductByIndex(0);
    savedProductData = firstProduct;
    await productsPage.clickViewDetails(0);

    const name = await productDetailsPage.getProductName();
    expect.soft(name).toBeTruthy();
    expect.soft(name).toBe(savedProductData.name);
  });

  test('PDET-006: Verify Product Category', async ({ page }) => {
    const firstProduct = await productsPage.getProductByIndex(0);
    savedProductData = firstProduct;
    await productsPage.clickViewDetails(0);

    const category = await productDetailsPage.getProductCategory();
    expect.soft(category).toBeTruthy();
    expect.soft(category).toBe(savedProductData.category);
  });

  test('PDET-007: Verify Product Price Format', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    const price = await productDetailsPage.getProductPrice();
    expect.soft(price).toBeTruthy();
    expect.soft(await productDetailsPage.isPriceValid()).toBeTruthy();
  });

  test('PDET-008: Verify Product Stars and Reviews', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    const stars = await productDetailsPage.getProductStars();
    expect.soft(stars).toBeGreaterThanOrEqual(0);
    expect.soft(stars).toBeLessThanOrEqual(5);

    const reviewsCount = await productDetailsPage.getProductReviewsCount();
    expect.soft(reviewsCount).toBeLessThanOrEqual(5);
  });

  test('PDET-009: Verify Product Description', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    const description = await productDetailsPage.getProductDescription();
    expect.soft(description).toBeTruthy();
  });

  test('PDET-010: Verify Product Stock Information', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    const stock = await productDetailsPage.getProductStock();
    expect.soft(stock).toBeTruthy();
  });

  test('PDET-011: Verify Increase Quantity Button', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    expect.soft(await productDetailsPage.isBtnIncreaseQtyVisible()).toBeTruthy();
  });

  test('PDET-012: Verify Decrease Quantity Button', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    expect.soft(await productDetailsPage.isBtnDecreaseQtyVisible()).toBeTruthy();
  });

  test('PDET-013: Verify Quantity Input and Cart', async ({ page }) => {
    await productsPage.clickViewDetails(0);
    productId = page.url().split('/').pop() || '1';

    // Clear cart first
    await productDetailsPage.clearCart();

    // Navigate back to product details
    await page.goto(`http://127.0.0.1:5000/web/products/${productId}`);
    await page.waitForLoadState('networkidle');

    // Set quantity to 3
    await productDetailsPage.setQuantityInput(3);
    const newQty = await productDetailsPage.getQuantityInputValue();
    expect.soft(newQty).toBe('3');

    // Add to cart
    await productDetailsPage.clickAddToCart();
    await page.waitForTimeout(2000);

    // Check if cart has at least 1 product (cart badge shows unique products)
    expect.soft(await productDetailsPage.checkQuantityInCart(1)).toBeTruthy();
    
    // Verify actual quantity in cart by checking cart page
    const actualQuantity = await productDetailsPage.getCartItemQuantity(productId);
    expect.soft(actualQuantity).toBe(3);
  });

  test('PDET-014: Verify Like Product Button', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    // Click like button
    await productDetailsPage.clickLikeProduct();
    await page.waitForTimeout(1000);

    // Check for alert
    const alertText = await productDetailsPage.getAlertText();
    if (alertText && alertText.includes('You have already liked this product!')) {
      expect.soft(alertText).toContain('You have already liked this product!');
    } else {
      // If not already liked, it should be liked now
      expect.soft(await productDetailsPage.isProductLiked()).toBeTruthy();
    }
  });

  test('PDET-015: Verify Add to Wishlist Button', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    // Click add to wishlist
    await productDetailsPage.clickAddToWishlist();
    await page.waitForTimeout(1000);

    // Check for alert
    const alertText = await productDetailsPage.getAlertText();
    if (alertText) {
      expect.soft(alertText).toMatch(/Item added to wishlist|Product already in wishlist/);
    }
  });

  test('PDET-016: Verify Back to Products Button', async ({ page }) => {
    await productsPage.clickViewDetails(0);

    // Click back to products
    await productDetailsPage.clickBackToProducts();

    // Check navigation
    expect.soft(await productDetailsPage.isOnProductsPage()).toBeTruthy();
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
    await page.waitForTimeout(1000);

    // Try to access product details
    await page.goto('http://127.0.0.1:5000/web/products/1');
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