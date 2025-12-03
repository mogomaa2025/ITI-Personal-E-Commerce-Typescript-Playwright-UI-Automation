import { test, expect, Page } from '@playwright/test';
import { OrderPage } from '../pages/OrderPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { BasePage } from '../pages/BasePage';
import { Helpers } from '../utils/helpers';
import { ApiWaiting } from '../utils/ApiWaiting';
import users from '../data/users.json';
import testData from '../data/data.json';
import urlsData from '../data/urls.json';
import cartData from '../data/cart.json';
import { ProductDetailsPage } from '@pages/ProductDetailsPage';

test.describe('Order System Tests', () => {
  let orderPage: OrderPage;
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let helpers: Helpers;
  let basePage: BasePage;
  let productDetailsPage: ProductDetailsPage;

  test.beforeEach(async ({ page }) => {
    orderPage = new OrderPage(page);
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    helpers = new Helpers(page);
    basePage = new BasePage(page);
    productDetailsPage = new ProductDetailsPage(page);

    // Setup: Login as test user and clear cart
    await page.goto(urlsData.loginUrl);
    await basePage.waitForNetworkIdle();
    await loginPage.login(users.ordersUser.email, users.ordersUser.password);
    await basePage.waitForNetworkIdle();
    // Navigate to cart page first
    await page.goto(urlsData.cartUrl);
    await basePage.waitForNetworkIdle();
    cartPage.acceptAlert(); // accept alert first
    // Only try to clear cart if it exists
    const clearButton = cartPage.clearAllCart;
    if (await clearButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await clearButton.click();
      await expect(basePage.cartBadge).toContainText('0');
    }
  });

  // OT-TC-001: Verify that clicking checkout button shows the checkout prompt then cancel it
  test('OT-TC-001: Verify that clicking checkout button shows the checkout prompt then cancel it', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.productLikesApi, 200);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.addToCartButton.first().click();
    await expect(productsPage.addedToCartSuccessMessage).toBeVisible();
    await expect(basePage.cartBadge).toContainText('1');
    await page.goto(urlsData.cartUrl);
    await expect(productsPage.addedToCartSuccessMessage).not.toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await cartPage.dismissAlertInputAddress();
    await cartPage.checkoutButton.click();
    await basePage.waitForNetworkIdle();
    await expect(orderPage.pageHeading).not.toBeVisible();
  });

  // OT-TC-002: Verify order is placed successfully with valid shipping information
  test('OT-TC-002: Verify order is placed successfully with valid shipping information', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.productLikesApi, 200);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.addToCartButton.first().click();
    await expect(productsPage.addedToCartSuccessMessage).toBeVisible();
    await expect(basePage.cartBadge).toContainText('1');
    await page.goto(urlsData.cartUrl);
    await expect(productsPage.addedToCartSuccessMessage).not.toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await cartPage.acceptAlertInputAddress(cartData.cartAddress);
    await cartPage.checkoutButton.click();
    // await basePage.waitForNetworkIdle();
    await expect(orderPage.pageHeading).toBeVisible();
  });

  // OT-TC-003: Verify order is not placed when shipping address is empty
  test('OT-TC-003: Verify order is not placed when shipping address is empty', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.productLikesApi, 200);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.addToCartButton.first().click();
    await expect(productsPage.addedToCartSuccessMessage).toBeVisible();
    await expect(basePage.cartBadge).toContainText('1');
    await page.goto(urlsData.cartUrl);
    await expect(productsPage.addedToCartSuccessMessage).not.toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await cartPage.acceptAlertInputAddress("");
    await cartPage.checkoutButton.click();
    await basePage.waitForNetworkIdle();
    await expect(orderPage.pageHeading).not.toBeVisible();
  });

  // OT-TC-004: Verify user can navigate to My Orders page and view order history
  test('OT-TC-004: Verify user can navigate to My Orders page and view order history', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.productLikesApi, 200);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.addToCartButton.first().click();
    await expect(productsPage.addedToCartSuccessMessage).toBeVisible();
    await expect(basePage.cartBadge).toContainText('1');
    await page.goto(urlsData.cartUrl);
    await expect(productsPage.addedToCartSuccessMessage).not.toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await cartPage.acceptAlertInputAddress(cartData.cartAddress);
    await cartPage.checkoutButton.click();
    // await basePage.waitForNetworkIdle(); x
    await expect(orderPage.pageHeading).toBeVisible();
    await expect(orderPage.noOrdersMessage).not.toBeVisible();
    await expect(orderPage.snapshotmain).toMatchAriaSnapshot(orderPage.snapshottext);
    await expect(orderPage.orderStatusPending.first() || orderPage.orderStatusProcessing.first() || orderPage.orderStatusShipped.first() || orderPage.orderStatusDelivered.first()).toBeVisible();
  });

  // OT-TC-005: Verify orders can be filtered by status (e.g., Pending)
  test('OT-TC-005: Verify orders can be filtered by status (e.g., Pending)', async ({ page }) => {
    await page.goto(urlsData.orderUrl);
    await expect(orderPage.pageHeading).toBeVisible();
    await expect(orderPage.noOrdersMessage).not.toBeVisible();
    await expect(orderPage.snapshotmain).toMatchAriaSnapshot(orderPage.snapshottext);
    await orderPage.pendingTab.click();
    await expect(orderPage.ordersList.last()).not.toContainText('processing' || 'shipped' || 'delivered');
    await orderPage.processingTab.click();
    await expect(orderPage.ordersList.last()).not.toContainText('pending' || 'shipped' || 'delivered');
    await orderPage.shippedTab.click();
    await expect(orderPage.ordersList.last()).not.toContainText('pending' || 'processing' || 'delivered');
    await orderPage.deliveredTab.click();
    await expect(orderPage.ordersList.last()).not.toContainText('pending' || 'processing' || 'shipped');
  });

  // OT-TC-006: Verify a pending order can be cancelled
  test('OT-TC-006: Verify a pending order can be cancelled', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.productLikesApi, 200);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.addToCartButton.first().click();
    await expect(productsPage.addedToCartSuccessMessage).toBeVisible();
    await expect(basePage.cartBadge).toContainText('1');
    await page.goto(urlsData.cartUrl);
    await expect(productsPage.addedToCartSuccessMessage).not.toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await cartPage.acceptAlertInputAddress(cartData.cartAddress);
    await cartPage.checkoutButton.click();
    await basePage.waitForNetworkIdle();
    await expect(orderPage.pageHeading).toBeVisible();
    await expect(orderPage.noOrdersMessage).not.toBeVisible();
    await orderPage.pendingTab.click();
    orderPage.acceptAlert();
    await orderPage.cancelOrderButton.first().click();
    await expect(orderPage.orderCancelledMessage).toBeVisible();

  });

  // OT-TC-007: Verify clicking Add to Cart then Checkout
  test('OT-TC-007: Verify clicking Buy Now takes user directly to checkout', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.productLikesApi, 200);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.viewDetailsButton.first().click();
    await productDetailsPage.btnBuyNow.click();
    await expect(productDetailsPage.addedToCartSuccessMessage).toBeVisible();
    await expect(basePage.cartBadge).toContainText('1');
    // await expect(productDetailsPage.addedToCartSuccessMessage).not.toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await cartPage.acceptAlertInputAddress(cartData.cartAddress);
    await cartPage.checkoutButton.click();
    // await basePage.waitForNetworkIdle();
    // await expect(orderPage.pageHeading).toBeVisible();
    await expect(orderPage.noOrdersMessage).not.toBeVisible();
    await orderPage.pendingTab.click();
    await expect(orderPage.ordersList.last()).not.toContainText('processing' || 'shipped' || 'delivered');
  });
});