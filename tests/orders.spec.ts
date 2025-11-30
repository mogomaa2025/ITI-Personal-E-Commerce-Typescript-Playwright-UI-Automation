import { test, expect, Page } from '@playwright/test';
import { OrderPage } from '../pages/OrderPage';
import { AdminPage } from '../pages/AdminPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { Helpers } from '../utils/helpers';
import users from '../data/users.json';
import testData from '../data/data.json';

/**
 * Order System Tests
 * 
 * Test suite for order management functionality including:
 * - Guest user order access
 * - Admin dashboard order statistics
 * - User order creation and management
 * - Order status tracking (Pending, Processing, Shipped, Delivered)
 * - Order cancellation workflow
 */
test.describe('Order System Tests', () => {
  let orderPage: OrderPage;
  let adminPage: AdminPage;
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let helpers: Helpers;

  // Shared test data across tests
  let savedTotalOrders: string | null = null;
  let savedTotalRevenue: string | null = null;
  let savedCartPrice: string | null = null;

  /**
   * Helper function to login as a regular user
   */
  async function loginAsUser(page: Page) {
    await page.waitForLoadState('networkidle');
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login(users.ordersUser.email, users.ordersUser.password);
    // Wait for navigation after login using LoginPage method
    await loginPage.waitForPostLoginNavigation();
    await page.waitForLoadState('networkidle');
  }

  /**
   * Helper function to login as admin
   */
  async function loginAsAdmin(page: Page) {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login(users.admin.email, users.admin.password);
    // Wait for navigation after login using LoginPage method
    await loginPage.waitForPostLoginNavigation();
    await page.waitForLoadState('networkidle');
  }

  /**
   * Helper function to create an order with products
   */
  async function createOrder(page: Page): Promise<string> {
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    helpers = new Helpers(page);

    // Clear cart first
    await cartPage.clearCart();

    // Navigate to products and add items
    await productsPage.navigateTo();
    await productsPage.pageHeading.waitFor({ state: 'visible' });

    // Add first product
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');

    // Add second product if available
    const productCount = await productsPage.getProductCount();
    if (productCount > 1) {
      await productsPage.clickAddToCart(1);
      await helpers.waitForAlertToAppear('Added to cart!');
    }

    // Navigate to cart and get total
    await cartPage.navigateTo();
    await cartPage.waitForCartPageLoad();
    
    const cartTotal = await cartPage.getCartTotal();
    expect(cartTotal).not.toBeNull();

    // Complete checkout
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);

    // Wait for navigation to orders page using CartPage method
    await cartPage.waitForOrdersPageNavigationAfterCheckout();

    return cartTotal || '';
  }

  test('ORD-001: Verify Guest User navigate to orders and check login message', async ({ page }) => {
    // Arrange
    orderPage = new OrderPage(page);
    
    // Act
    await page.goto('/web/orders', { waitUntil: 'networkidle' });
    
    // Assert
    const isLoginMessageVisible = await orderPage.isLoginMessageVisible();
    expect(isLoginMessageVisible).toBeTruthy();
  });

  test('ORD-002: Login as admin and go to admin from nav bar', async ({ page }) => {
    // Arrange
    adminPage = new AdminPage(page);
    loginPage = new LoginPage(page);
    
    // Act
    await loginAsAdmin(page);
    await adminPage.navigateToAdminFromNavbar();
    
    // Assert
    await expect(adminPage.pageHeading).toBeVisible();
    expect(page.url()).toContain('/web/admin');
  });

  test('ORD-003: Save Total Orders numbers and Total Revenue from admin dashboard', async ({ page }) => {
    // Arrange
    adminPage = new AdminPage(page);
    loginPage = new LoginPage(page);
    
    // Act
    await loginAsAdmin(page);
    await adminPage.navigateTo();
    await adminPage.pageHeading.waitFor({ state: 'visible' });
    
    // Get and save Total Orders and Total Revenue
    savedTotalOrders = await adminPage.getTotalOrders();
    savedTotalRevenue = await adminPage.getTotalRevenue();
    
    // Assert
    expect(savedTotalOrders).not.toBeNull();
    expect(savedTotalRevenue).not.toBeNull();
    
    console.log(`Saved Total Orders: ${savedTotalOrders}`);
    console.log(`Saved Total Revenue: ${savedTotalRevenue}`);
  });

  test('ORD-004: Logged in as user, and navigate to products', async ({ page }) => {
    // Arrange
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    
    // Act
    await loginAsUser(page);
    await productsPage.navigateTo();
    await productsPage.waitForProductsPageNavigation();
    
    // Assert
    expect(page.url()).toContain('/web/products');
    await expect(productsPage.pageHeading).toBeVisible();
  });

  test('ORD-005: Add some products to cart and save prices to check later', async ({ page }) => {
    // Arrange
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    loginPage = new LoginPage(page);
    helpers = new Helpers(page);
    
    // Act
    await loginAsUser(page);
    await cartPage.clearCart();
    await productsPage.navigateTo();
    await productsPage.pageHeading.waitFor({ state: 'visible' });
    
    // Add first product
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    
    // Add second product if available
    const productCount = await productsPage.getProductCount();
    if (productCount > 1) {
      await productsPage.clickAddToCart(1);
      await helpers.waitForAlertToAppear('Added to cart!');
    }
    
    // Navigate to cart and save total
    await cartPage.navigateTo();
    await cartPage.waitForCartPageLoad();
    
    // Assert
    savedCartPrice = await cartPage.getCartTotal();
    expect(savedCartPrice).not.toBeNull();
    
    console.log(`Saved Cart Total: ${savedCartPrice}`);
  });

  test('ORD-006: Navigate to cart', async ({ page }) => {
    // Arrange
    cartPage = new CartPage(page);
    loginPage = new LoginPage(page);
    
    // Act
    await loginAsUser(page);
    await cartPage.navigateTo();
    
    // Assert
    expect(page.url()).toContain('/web/cart');
  });

  test('ORD-007: Checkout by clicking Proceed to Checkout', async ({ page }) => {
    // Arrange
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    helpers = new Helpers(page);
    
    // Act
    await loginAsUser(page);
    
    // Ensure cart has items
    await productsPage.navigateTo();
    await productsPage.pageHeading.waitFor({ state: 'visible' });
    const cartCount = await productsPage.getCartBadgeCount();
    
    if (cartCount === 0) {
      await productsPage.clickAddToCart(0);
      await helpers.waitForAlertToAppear('Added to cart!');
    }
    
    await cartPage.navigateTo();
    await cartPage.waitForCartPageLoad();
    
    savedCartPrice = await cartPage.getCartTotal();
    
    // Click Proceed to Checkout (will show prompt dialog)
    await cartPage.clickCheckout();
    
    // Assert - verify we're still on cart page (dialog is shown)
    expect(page.url()).toContain('/web/cart');
  });

  test('ORD-008: Enter valid shipping address and make sure it navigates automatically to orders', async ({ page }) => {
    // Arrange
    checkoutPage = new CheckoutPage(page);
    cartPage = new CartPage(page);
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    helpers = new Helpers(page);
    
    // Act
    await loginAsUser(page);
    
    // Ensure cart has items
    await productsPage.navigateTo();
    await productsPage.pageHeading.waitFor({ state: 'visible' });
    const cartCount = await productsPage.getCartBadgeCount();
    
    if (cartCount === 0) {
      await productsPage.clickAddToCart(0);
      await helpers.waitForAlertToAppear('Added to cart!');
    }
    
    await cartPage.navigateTo();
    await cartPage.waitForCartPageLoad();
    savedCartPrice = await cartPage.getCartTotal();
    
    // Complete checkout with shipping address
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Assert - Wait for navigation using CartPage method
    await cartPage.waitForOrdersPageNavigationAfterCheckout();
    expect(page.url()).toContain('/web/orders');
  });

  test('ORD-009: Check same orders in the order page and make sure price matches saved cart price', async ({ page }) => {
    // Arrange
    orderPage = new OrderPage(page);
    cartPage = new CartPage(page);
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    helpers = new Helpers(page);
    
    // Act
    await loginAsUser(page);
    
    // Create order and get cart total
    await cartPage.clearCart();
    await productsPage.navigateTo();
    await productsPage.pageHeading.waitFor({ state: 'visible' });
    
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    
    await cartPage.navigateTo();
    await cartPage.waitForCartPageLoad();
    const testCartPrice = await cartPage.getCartTotal();
    
    // Complete checkout
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Navigate to orders page
    await orderPage.navigateTo();
    await orderPage.pageHeading.waitFor({ state: 'visible' }).catch(() => {});
    
    // Assert - Validate order total matches cart price using OrderPage method
    // All validations are performed inside the method
    if (testCartPrice) {
      await orderPage.validateOrderTotalMatchesCartPrice(testCartPrice, 10000);
    }
  });

  test('ORD-010: Check there are tabs: All, Pending, Processing, Shipped, Delivered', async ({ page }) => {
    // Arrange
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    
    // Act
    await loginAsUser(page);
    await orderPage.navigateTo();
    await orderPage.pageHeading.waitFor({ state: 'visible' }).catch(() => {});
    
    // Assert
    const tabs = await orderPage.getAllTabs();
    expect(tabs).toContain('All');
    expect(tabs).toContain('Pending');
    expect(tabs).toContain('Processing');
    expect(tabs).toContain('Shipped');
    expect(tabs).toContain('Delivered');
  });

  test('ORD-011: Click on Pending tab and make sure order status is Pending', async ({ page }) => {
    // Arrange
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    
    // Act
    await loginAsUser(page);
    
    // Create an order
    const cartPrice = await createOrder(page);
    expect(cartPrice).not.toBe('');
    
    // Navigate to orders and click Pending tab
    await orderPage.navigateTo();
    await orderPage.pageHeading.waitFor({ state: 'visible' }).catch(() => {});
    await orderPage.clickPendingTab();
    
    // Assert - Validate pending order status using OrderPage method
    // All validations are performed inside the method
    await orderPage.validatePendingOrderStatus(0);
  });

  test('ORD-012: Check product date and totals and no of items and product name correct in the pending tab', async ({ page }) => {
    // Arrange
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    helpers = new Helpers(page);
    
    // Act
    await loginAsUser(page);
    
    // Clear cart and verify it's empty
    await cartPage.clearCart();
    await cartPage.navigateTo();
    await cartPage.waitForCartPageLoad();
    const initialCartCount = await cartPage.getCartItemCount();
    expect(initialCartCount).toBe(0);
    
    // Get product name before adding
    await productsPage.navigateTo();
    await productsPage.pageHeading.waitFor({ state: 'visible' });
    const product = await productsPage.getProductByIndex(0);
    const productName = product.name;
    expect(productName).not.toBeNull();
    
    // Add product to cart
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    
    // Verify cart has one item
    await cartPage.navigateTo();
    await cartPage.waitForCartPageLoad();
    const cartItemCount = await cartPage.getCartItemCount();
    expect(cartItemCount).toBe(1);
    
    // Get cart total
    const testCartPrice = await cartPage.getCartTotal();
    expect(testCartPrice).not.toBeNull();
    
    // Verify cart total matches product price using CartPage method
    // All validations are performed inside the method
    if (product.price && testCartPrice) {
      await cartPage.validateCartTotalMatchesProductPrice(product.price);
    }
    
    // Complete checkout
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Navigate to orders and check Pending tab
    await orderPage.navigateTo();
    await orderPage.pageHeading.waitFor({ state: 'visible' }).catch(() => {});
    await orderPage.clickPendingTab();
    
    // Assert - Validate order details using OrderPage method
    // All validations are performed inside the method
    if (testCartPrice) {
      await orderPage.validatePendingOrderDetails(
        testCartPrice,
        1, // Expected items count
        productName || undefined, // Product name to verify
        10000
      );
    }
  });

  test('ORD-013: Click Cancel Order in pending tab', async ({ page }) => {
    // Arrange
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    
    // Act
    await loginAsUser(page);
    
    // Create an order
    await createOrder(page);
    
    // Navigate to orders and click Cancel Order
    await orderPage.navigateTo();
    await orderPage.pageHeading.waitFor({ state: 'visible' }).catch(() => {});
    await orderPage.clickPendingTab();
    
    // Assert - Click cancel order and validate dialog using OrderPage method
    // All dialog handling and validations are performed inside the method
    await orderPage.clickCancelOrderAndValidateDialog(0, false);
  });

  test('ORD-014: Try when click cancel in the alert it do nothing and still in Pending status', async ({ page }) => {
    // Arrange
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    
    // Act
    await loginAsUser(page);
    
    // Create an order
    await createOrder(page);
    
    // Navigate to orders
    await orderPage.navigateTo();
    await orderPage.pageHeading.waitFor({ state: 'visible' }).catch(() => {});
    await orderPage.clickPendingTab();
    
    // Assert - Click cancel order, dismiss dialog, and validate order remains using OrderPage method
    // All dialog handling and validations are performed inside the method
    await orderPage.clickCancelOrderDismissAndValidateOrderRemains(0);
  });

  test('ORD-015: Click again cancel order in pending tab', async ({ page }) => {
    // Arrange
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    
    // Act
    await loginAsUser(page);
    
    // Create an order
    await createOrder(page);
    
    // Navigate to orders
    await orderPage.navigateTo();
    await orderPage.pageHeading.waitFor({ state: 'visible' }).catch(() => {});
    await orderPage.clickPendingTab();
    
    // Assert - Click cancel order and validate dialog using OrderPage method
    // All dialog handling and validations are performed inside the method
    await orderPage.clickCancelOrderAndValidateDialog(0, false);
  });

  test('ORD-016: Click ok in the alert for confirm of cancel, it should make an inline alert "Order cancelled"', async ({ page }) => {
    // Arrange
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    
    // Act
    await loginAsUser(page);
    
    // Create an order
    await createOrder(page);
    
    // Navigate to orders
    await orderPage.navigateTo();
    await orderPage.pageHeading.waitFor({ state: 'visible' }).catch(() => {});
    await orderPage.clickPendingTab();
    
    // Assert - Click cancel order, accept dialog, and validate alert using OrderPage method
    // All dialog handling and validations are performed inside the method
    await orderPage.clickCancelOrderWithDialog(0, true);
    const alertVisible = await orderPage.waitForOrderCancelledAlert(10000);
    expect(alertVisible).toBeTruthy();
  });

  test('ORD-017: Check no products left in the pending tab and label called "No orders found"', async ({ page }) => {
    // Arrange
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    
    // Act
    await loginAsUser(page);
    
    // Create an order
    await createOrder(page);
    
    // Navigate to orders and go to Pending tab
    await orderPage.navigateTo();
    await orderPage.pageHeading.waitFor({ state: 'visible' }).catch(() => {});
    await orderPage.clickPendingTab();
    
    // Cancel all pending orders until none remain using OrderPage method
    // All cancellation logic is handled inside the method
    //await orderPage.cancelMultipleOrders(20);
    await orderPage.cancelMultipleOrdersNoCount();
    
    // Assert
    const finalCount = await orderPage.getOrderCount();
    const noOrdersMessage = await orderPage.isNoOrdersMessageVisible();
    
    expect(finalCount).toBe(0);
    expect(noOrdersMessage).toBeTruthy();
  });
});
