import { test, expect } from '@playwright/test';
import { OrderPage } from '../pages/OrderPage';
import { AdminPage } from '../pages/AdminPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { Helpers } from '../utils/helpers';
import users from '../data/users.json';
import testData from '../data/data.json';

test.describe('Order System Tests', () => {
  let orderPage: OrderPage;
  let adminPage: AdminPage;
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let helpers: Helpers;

  // Variables to store data across test steps
  let savedTotalOrders: string | null = null;
  let savedTotalRevenue: string | null = null;
  let savedCartPrice: string | null = null;
  
  // Note: checkoutPage is declared but may not be used in all tests
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  test('ORD-001: Verify Guest User navigate to orders and check login message', async ({ page }) => {
    orderPage = new OrderPage(page);
    
    // Navigate to orders page as guest
    await page.goto('http://127.0.0.1:5000/web/orders');
    await page.waitForLoadState('networkidle');
    
    // Check for "Please login to continue" message
    const loginMessage = page.locator('text=Please login to continue');
    await loginMessage.waitFor({ state: 'visible', timeout: 5000 });
    expect(await loginMessage.isVisible()).toBeTruthy();
  });

  test('ORD-002: Login as admin and go to admin from nav bar', async ({ page }) => {
    adminPage = new AdminPage(page);
    loginPage = new LoginPage(page);
    
    // Login as admin
    await loginPage.navigateTo();
    await loginPage.login(users.admin.email, users.admin.password);
    await page.waitForTimeout(2000);
    
    // Navigate to admin from navbar
    await adminPage.navigateToAdminFromNavbar();
    
    // Verify admin dashboard is loaded
    expect(await adminPage.isAdminPageLoaded()).toBeTruthy();
    expect(page.url()).toContain('/web/admin');
  });

  test('ORD-003: Save Total Orders numbers and Total Revenue from admin dashboard', async ({ page }) => {
    adminPage = new AdminPage(page);
    loginPage = new LoginPage(page);
    
    // Ensure logged in as admin
    await loginPage.navigateTo();
    await loginPage.login(users.admin.email, users.admin.password);
    await page.waitForTimeout(2000);
    await adminPage.navigateTo();
    await page.waitForTimeout(1000);
    
    // Get and save Total Orders and Total Revenue
    savedTotalOrders = await adminPage.getTotalOrders();
    savedTotalRevenue = await adminPage.getTotalRevenue();
    
    // Verify values were retrieved
    expect(savedTotalOrders).not.toBeNull();
    expect(savedTotalRevenue).not.toBeNull();
    
    console.log(`Saved Total Orders: ${savedTotalOrders}`);
    console.log(`Saved Total Revenue: ${savedTotalRevenue}`);
  });

  test('ORD-004: Logged in as user, and navigate to products', async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    
    // Navigate to home page first to ensure logout button is visible
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    
    // Login as regular user
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Navigate to products page
    await page.goto('http://127.0.0.1:5000/web/products');
    await page.waitForLoadState('networkidle');
    
    // Verify on products page
    expect(page.url()).toContain('/web/products');
    expect(await productsPage.pageHeading.isVisible()).toBeTruthy();
  });

  test('ORD-005: Add some products to cart and save prices to check later', async ({ page }) => {
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    loginPage = new LoginPage(page);
    helpers = new Helpers(page);
    
    // Ensure logged in as user
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Clear cart first
    await cartPage.clearCart();
    
    // Navigate to products
    await productsPage.navigateTo();
    await page.waitForTimeout(1000);
    
    // Add first product to cart
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    await page.waitForTimeout(1000);
    
    // Add second product if available
    const productCount = await productsPage.getProductCount();
    if (productCount > 1) {
      await productsPage.clickAddToCart(1);
      await helpers.waitForAlertToAppear('Added to cart!');
      await page.waitForTimeout(1000);
    }
    
    // Navigate to cart and save the total price
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    
    savedCartPrice = await cartPage.getCartTotal();
    expect(savedCartPrice).not.toBeNull();
    
    console.log(`Saved Cart Total: ${savedCartPrice}`);
  });

  test('ORD-006: Navigate to cart', async ({ page }) => {
    cartPage = new CartPage(page);
    loginPage = new LoginPage(page);
    
    // Ensure logged in
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Navigate to cart
    await page.goto('http://127.0.0.1:5000/web/cart');
    await page.waitForLoadState('networkidle');
    
    // Verify on cart page
    expect(page.url()).toContain('/web/cart');
  });

  test('ORD-007: Checkout by clicking Proceed to Checkout', async ({ page }) => {
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    helpers = new Helpers(page);
    
    // Ensure logged in and has items in cart
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Ensure cart has items
    await productsPage.navigateTo();
    await page.waitForTimeout(1000);
    const cartCount = await productsPage.getCartBadgeCount();
    if (cartCount === 0) {
      await productsPage.clickAddToCart(0);
      await helpers.waitForAlertToAppear('Added to cart!');
      await page.waitForTimeout(1000);
    }
    
    // Navigate to cart
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    
    // Save cart total before checkout
    savedCartPrice = await cartPage.getCartTotal();
    
    // Click Proceed to Checkout - this will show a prompt dialog
    // We'll handle the dialog in the next test, but for now just verify the button works
    await cartPage.clickCheckout();
    await page.waitForTimeout(1000);
    
    // The dialog should appear, but we're not handling it here
    // Just verify we're still on cart page (dialog is shown)
    const currentUrl = page.url();
    expect(currentUrl.includes('/web/cart')).toBeTruthy();
  });

  test('ORD-008: Enter valid shipping address and make sure it navigates automatically to orders', async ({ page }) => {
    checkoutPage = new CheckoutPage(page);
    cartPage = new CartPage(page);
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    helpers = new Helpers(page);
    
    // Ensure logged in and has items in cart
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Ensure cart has items
    await productsPage.navigateTo();
    await page.waitForTimeout(1000);
    const cartCount = await productsPage.getCartBadgeCount();
    if (cartCount === 0) {
      await productsPage.clickAddToCart(0);
      await helpers.waitForAlertToAppear('Added to cart!');
      await page.waitForTimeout(1000);
    }
    
    // Navigate to cart
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    savedCartPrice = await cartPage.getCartTotal();
    
    // Complete checkout with shipping address (handles prompt dialog)
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Additional wait to ensure navigation completes
    await page.waitForTimeout(1000);
    
    // Verify navigation to orders page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/web/orders');
  });

  test('ORD-009: Check same orders in the order page and make sure price matches saved cart price', async ({ page }) => {
    orderPage = new OrderPage(page);
    cartPage = new CartPage(page);
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    checkoutPage = new CheckoutPage(page);
    helpers = new Helpers(page);
    
    // Setup: Login, add products, checkout
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Clear cart and add products
    await cartPage.clearCart();
    await productsPage.navigateTo();
    await page.waitForTimeout(1000);
    
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    await page.waitForTimeout(1000);
    
    // Get cart total
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    savedCartPrice = await cartPage.getCartTotal();
    
    // Complete checkout with shipping address
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Navigate to orders page
    await orderPage.navigateTo();
    await page.waitForTimeout(2000);
    
    // Get the first order and compare price
    const orderCount = await orderPage.getOrderCount();
    if (orderCount > 0) {
      const firstOrder = await orderPage.getOrderByIndex(0);
      const orderTotal = firstOrder.total;
      
      // Compare prices (normalize for comparison)
      if (savedCartPrice && orderTotal) {
        const cartPriceNum = parseFloat(savedCartPrice.replace('$', '').trim());
        const orderPriceNum = parseFloat(orderTotal.replace('$', '').trim());
        expect(orderPriceNum).toBeCloseTo(cartPriceNum, 2);
      }
    }
  });

  test('ORD-010: Check there are tabs: All, Pending, Processing, Shipped, Delivered', async ({ page }) => {
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    
    // Login as user
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Navigate to orders page
    await orderPage.navigateTo();
    await page.waitForTimeout(1000);
    
    // Check all tabs are visible
    const tabs = await orderPage.getAllTabs();
    expect(tabs).toContain('All');
    expect(tabs).toContain('Pending');
    expect(tabs).toContain('Processing');
    expect(tabs).toContain('Shipped');
    expect(tabs).toContain('Delivered');
  });

  test('ORD-011: Click on Pending tab and make sure order status is Pending', async ({ page }) => {
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    checkoutPage = new CheckoutPage(page);
    helpers = new Helpers(page);
    
    // Setup: Login and create an order
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Create a pending order
    await cartPage.clearCart();
    await productsPage.navigateTo();
    await page.waitForTimeout(1000);
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    await page.waitForTimeout(1000);
    
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Navigate to orders and click Pending tab
    await orderPage.navigateTo();
    await page.waitForTimeout(2000);
    await orderPage.clickPendingTab();
    await page.waitForTimeout(1000);
    
    // Check order status
    const orderCount = await orderPage.getOrderCount();
    if (orderCount > 0) {
      const order = await orderPage.getOrderByIndex(0);
      expect(order.status?.toLowerCase()).toContain('pending');
    }
  });

  test('ORD-012: Check product date and totals and no of items and product name correct in the pending tab', async ({ page }) => {
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    checkoutPage = new CheckoutPage(page);
    helpers = new Helpers(page);
    
    // Setup: Login and create an order
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Create an order - use local variable to avoid issues with shared savedCartPrice
    await cartPage.clearCart();
    await page.waitForTimeout(1000);
    
    // Verify cart is empty
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    const initialCartCount = await cartPage.getCartItemCount();
    expect(initialCartCount).toBe(0);
    
    // Navigate to products and add one product
    await productsPage.navigateTo();
    await page.waitForTimeout(1000);
    
    // Get product name before adding
    const product = await productsPage.getProductByIndex(0);
    const productName = product.name;
    
    // Add product to cart
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    await page.waitForTimeout(1000);
    
    // Verify only one item in cart
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    const cartItemCount = await cartPage.getCartItemCount();
    expect(cartItemCount).toBe(1);
    
    // Verify cart item details
    const cartItem = await cartPage.getProductByIndex(0);
    expect(cartItem.name).toBeTruthy();
    
    // Save cart total for this test (use local variable)
    const testCartPrice = await cartPage.getCartTotal();
    expect(testCartPrice).not.toBeNull();
    
    // Verify cart total is reasonable (should match product price for 1 item)
    const productPriceText = product.price;
    if (productPriceText && testCartPrice) {
      const productPriceNum = parseFloat(productPriceText.replace('$', '').trim());
      const cartPriceNum = parseFloat(testCartPrice.replace('$', '').trim());
      expect(cartPriceNum).toBeCloseTo(productPriceNum, 2);
    }
    
    console.log(`Test cart price: ${testCartPrice}, Product price: ${productPriceText}`);
    
    // Complete checkout
    const shippingAddress = testData.cart.shippingAddresses.valid;
    
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Wait a bit for the order to be created
    await page.waitForTimeout(2000);
    
    // Navigate to orders and check Pending tab
    await orderPage.navigateTo();
    await page.waitForTimeout(2000);
    
    // Wait for at least one order to appear
    await page.waitForSelector('h3:has-text("Order #")', { timeout: 10000 });
    
    await orderPage.clickPendingTab();
    await page.waitForTimeout(2000); // Increased wait for tab to load
    
    // Wait for orders to load in Pending tab
    const orderCount = await orderPage.getOrderCount();
    expect(orderCount).toBeGreaterThan(0);
    
    console.log(`Found ${orderCount} orders in Pending tab`);
    
    // Get all orders and find the one with matching total
    // The first order (index 0) should be the most recent
    let order = await orderPage.getOrderByIndex(0);
    
    // If the total doesn't match, try to find the correct order
    if (order.total && testCartPrice) {
      const orderPriceNum = parseFloat(order.total.replace('$', '').trim());
      const cartPriceNum = parseFloat(testCartPrice.replace('$', '').trim());
      
      // If totals don't match, check other orders
      if (Math.abs(orderPriceNum - cartPriceNum) > 0.01) {
        console.log(`Order 0 total (${order.total}) doesn't match cart (${testCartPrice}), checking other orders...`);
        for (let i = 1; i < orderCount; i++) {
          const otherOrder = await orderPage.getOrderByIndex(i);
          if (otherOrder.total) {
            const otherOrderPriceNum = parseFloat(otherOrder.total.replace('$', '').trim());
            if (Math.abs(otherOrderPriceNum - cartPriceNum) < 0.01) {
              console.log(`Found matching order at index ${i}`);
              order = otherOrder;
              break;
            }
          }
        }
      }
    }
    
    // Verify this is a pending order
    expect(order.status).toContain('pending');
    
    console.log(`Selected order - ID: ${order.orderId}, Total: ${order.total}, Items: ${order.itemsCount}, Status: ${order.status}`);
    
    // Check date exists
    expect(order.date).not.toBeNull();
    
    // Check total matches cart price
    expect(testCartPrice).not.toBeNull();
    expect(order.total).not.toBeNull();
    
    if (testCartPrice && order.total) {
      const cartPriceNum = parseFloat(testCartPrice.replace('$', '').trim());
      const orderPriceNum = parseFloat(order.total.replace('$', '').trim());
      console.log(`Comparing: Cart ${cartPriceNum} vs Order ${orderPriceNum}`);
      console.log(`Difference: ${Math.abs(orderPriceNum - cartPriceNum)}`);
      
      // If totals don't match, log the full card text for debugging
      if (Math.abs(orderPriceNum - cartPriceNum) > 0.01) {
        const cardText = await order.card.textContent();
        console.log(`Full order card text: ${cardText}`);
        console.log(`Order ID: ${order.orderId}, Date: ${order.date}`);
      }
      
      expect(orderPriceNum).toBeCloseTo(cartPriceNum, 2);
    }
    
    // Check items count exists and is 1
    expect(order.itemsCount).not.toBeNull();
    const itemsCountNum = parseInt(order.itemsCount || '0');
    expect(itemsCountNum).toBe(1);
    
    // Check product name if available
    if (productName && order.productNames.length > 0) {
      const hasProductName = order.productNames.some(name => 
        name.toLowerCase().includes(productName.toLowerCase())
      );
      expect(hasProductName).toBeTruthy();
    }
  });

  test('ORD-013: Click Cancel Order in pending tab', async ({ page }) => {
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    checkoutPage = new CheckoutPage(page);
    helpers = new Helpers(page);
    
    // Setup: Login and create an order
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Create an order
    await cartPage.clearCart();
    await productsPage.navigateTo();
    await page.waitForTimeout(1000);
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    await page.waitForTimeout(1000);
    
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Navigate to orders and click Cancel Order
    await orderPage.navigateTo();
    await page.waitForTimeout(2000);
    await orderPage.clickPendingTab();
    await page.waitForTimeout(1000);
    
    // Setup dialog handler BEFORE clicking
    let dialogHandled = false;
    const dialogPromise = new Promise<void>((resolve) => {
      page.once('dialog', async dialog => {
        dialogHandled = true;
        await dialog.dismiss(); // Cancel the dialog
        resolve();
      });
    });
    
    // Click Cancel Order
    await orderPage.clickCancelOrder(0);
    await dialogPromise; // Wait for dialog to be handled
    await page.waitForTimeout(1000);
    
    // Verify dialog appeared
    expect(dialogHandled).toBeTruthy();
  });

  test('ORD-014: Try when click cancel in the alert it do nothing and still in Pending status', async ({ page }) => {
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    checkoutPage = new CheckoutPage(page);
    helpers = new Helpers(page);
    
    // Setup: Login and create an order
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Create an order
    await cartPage.clearCart();
    await productsPage.navigateTo();
    await page.waitForTimeout(1000);
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    await page.waitForTimeout(1000);
    
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Navigate to orders
    await orderPage.navigateTo();
    await page.waitForTimeout(2000);
    await orderPage.clickPendingTab();
    await page.waitForTimeout(1000);
    
    // Get initial order count
    const initialOrderCount = await orderPage.getOrderCount();
    
    // Setup dialog handler to dismiss BEFORE clicking
    const dialogPromise = new Promise<void>((resolve) => {
      page.once('dialog', async dialog => {
        await dialog.dismiss();
        resolve();
      });
    });
    
    // Click Cancel Order and dismiss
    await orderPage.clickCancelOrder(0);
    await dialogPromise; // Wait for dialog to be handled
    await page.waitForTimeout(2000);
    
    // Verify order still exists and status is still Pending
    const finalOrderCount = await orderPage.getOrderCount();
    expect(finalOrderCount).toBe(initialOrderCount);
    
    if (finalOrderCount > 0) {
      const order = await orderPage.getOrderByIndex(0);
      expect(order.status?.toLowerCase()).toContain('pending');
    }
  });

  test('ORD-015: Click again cancel order in pending tab', async ({ page }) => {
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    checkoutPage = new CheckoutPage(page);
    helpers = new Helpers(page);
    
    // Setup: Login and create an order
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Create an order
    await cartPage.clearCart();
    await productsPage.navigateTo();
    await page.waitForTimeout(1000);
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    await page.waitForTimeout(1000);
    
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Navigate to orders
    await orderPage.navigateTo();
    await page.waitForTimeout(2000);
    await orderPage.clickPendingTab();
    await page.waitForTimeout(1000);
    
    // Setup dialog handler BEFORE clicking
    let dialogHandled = false;
    const dialogPromise = new Promise<void>((resolve) => {
      page.once('dialog', async dialog => {
        dialogHandled = true;
        // Don't dismiss this time - will handle in next test
        await dialog.dismiss();
        resolve();
      });
    });
    
    // Click Cancel Order again
    await orderPage.clickCancelOrder(0);
    await dialogPromise; // Wait for dialog to be handled
    await page.waitForTimeout(1000);
    
    // Verify dialog appeared
    expect(dialogHandled).toBeTruthy();
  });

  test('ORD-016: Click ok in the alert for confirm of cancel, it should make an inline alert "Order cancelled"', async ({ page }) => {
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    checkoutPage = new CheckoutPage(page);
    helpers = new Helpers(page);
    
    // Setup: Login and create an order
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Create an order
    await cartPage.clearCart();
    await productsPage.navigateTo();
    await page.waitForTimeout(1000);
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    await page.waitForTimeout(1000);
    
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Navigate to orders
    await orderPage.navigateTo();
    await page.waitForTimeout(2000);
    await orderPage.clickPendingTab();
    await page.waitForTimeout(1000);
    
    // Setup dialog handler to accept BEFORE clicking
    const dialogPromise = new Promise<void>((resolve) => {
      page.once('dialog', async dialog => {
        await dialog.accept();
        resolve();
      });
    });
    
    // Click Cancel Order and accept
    await orderPage.clickCancelOrder(0);
    await dialogPromise; // Wait for dialog to be handled
    await page.waitForTimeout(2000);
    
    // Wait for and verify inline alert
    const alertVisible = await orderPage.waitForOrderCancelledAlert(5000);
    expect(alertVisible).toBeTruthy();
  });

  test('ORD-017: Check no products left in the pending tab and label called "No orders found"', async ({ page }) => {
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    checkoutPage = new CheckoutPage(page);
    helpers = new Helpers(page);
    
    // Setup: Login and create an order
    await loginPage.navigateTo();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForTimeout(2000);
    
    // Create an order
    await cartPage.clearCart();
    await productsPage.navigateTo();
    await page.waitForTimeout(1000);
    await productsPage.clickAddToCart(0);
    await helpers.waitForAlertToAppear('Added to cart!');
    await page.waitForTimeout(1000);
    
    await cartPage.navigateTo();
    await page.waitForTimeout(1000);
    const shippingAddress = testData.cart.shippingAddresses.valid;
    await cartPage.completeCheckoutWithShippingAddress(shippingAddress);
    
    // Navigate to orders and go to Pending tab
    await orderPage.navigateTo();
    await page.waitForTimeout(1000);
    await orderPage.clickPendingTab();
    await page.waitForTimeout(1000);
    
    // Cancel all pending orders until none remain
    let orderCount = await orderPage.getOrderCount();
    while (orderCount > 0) {
      // Setup dialog handler before clicking
      page.once('dialog', async dialog => await dialog.accept());
      await orderPage.clickCancelOrder(0);
      await orderPage.waitForOrderCancelledAlert(3000);
      await page.waitForTimeout(1000);
      
      // Refresh pending tab
      await orderPage.clickPendingTab();
      await page.waitForTimeout(1000);
      
      orderCount = await orderPage.getOrderCount();
    }
    
    // Verify no pending orders and "No orders found" message
    const finalCount = await orderPage.getOrderCount();
    const noOrdersMessage = await orderPage.isNoOrdersMessageVisible();
    
    expect(finalCount).toBe(0);
    expect(noOrdersMessage).toBeTruthy();
  });

});

