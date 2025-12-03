import { test, expect, Page, TestInfo } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { ProductsPage } from '../pages/ProductsPage';
import { LoginPage } from '../pages/LoginPage';
import { Helpers } from '../utils/helpers';
import testData from '../data/data.json';
import users from '../data/users.json';
import { BasePage } from '@pages/BasePage';
import { ApiWaiting } from '../utils/ApiWaiting';
import urlsData from '../data/urls.json';
import cartData from '../data/cart.json';


test.describe('Cart Page Tests - Guest User', () => {
  let cartPage: CartPage;
  let helpers: Helpers;

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
    helpers = new Helpers(page);
  });

  // Guest User Tests - no afterEach to clear cart since user is not logged in
  test('CT-TC-001: Navigate to cart as guest user fail', async ({ page }) => {
    await page.goto(urlsData.cartUrl);
    await expect(cartPage.pleaseLoginToContinue).toBeVisible();
  });
});

test.describe('Cart Page Tests - Logged In User', () => {
  let cartPage: CartPage;
  let productsPage: ProductsPage;
  let loginPage: LoginPage;
  let helpers: Helpers;
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    // initialize pages
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    loginPage = new LoginPage(page);
    helpers = new Helpers(page);
    basePage = new BasePage(page);

    await page.goto(urlsData.loginUrl);
    await basePage.waitForNetworkIdle(); //1 seconds
    await loginPage.login(users.cartUser.email, users.cartUser.password);
    await basePage.waitForNetworkIdle(); //1 seconds
    //await expect(cartPage.generalImage.last()).toBeVisible();
    cartPage.acceptAlert(); // accept aleart first 
    await page.goto(urlsData.cartUrl);
    await cartPage.clearAllCart.click();
    await expect(basePage.cartBadge).toContainText('0');
    await expect(cartPage.cartEmptyLabel).toContainText(cartData.cartEmptyByText);


  });

  test('CT-TC-002: Add to cart functionality', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await expect(productsPage.loadingProducts).toBeHidden();
    await productsPage.addToCartButton.first().click();
    await expect(productsPage.addedToCartSuccessMessage).toBeVisible();
    await expect(basePage.cartBadge).toContainText('1');
  });

  test('CT-TC-003: View empty cart as logged-in user', async ({ page }) => {
    await page.goto(urlsData.cartUrl);
    await expect(cartPage.cartEmptyLabel).toBeVisible();
  });

  test('CT-TC-004: Add products to cart and verify cart contents', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.productLikesApi, 200); // the likes that takes time #GOMAA FIXED
    // await basePage.waitForNetworkIdle(); //1 seconds
    // await expect(cartPage.generalImage.last()).toBeVisible();//40ms
    const productAPrice = await productsPage.productPrice.first().textContent();
    const productAName = await productsPage.productName.first().textContent();
    await productsPage.addToCartButton.first().click(); // one click ('1')
    await expect(productsPage.addedToCartSuccessMessage.first()).toBeVisible();
    await expect(basePage.cartBadge).toContainText('1');
    await page.goto(urlsData.cartUrl);
    await expect(productsPage.addedToCartSuccessMessage.first()).not.toBeVisible(); // better than wait network count fixed
    // await basePage.waitForNetworkIdle(); // 0.5 seconds
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await expect(basePage.cartBadge).toContainText('1');
    await expect(cartPage.itemDetails.first()).toContainText(productAName!); // ! non-null assertion operator
    await expect(cartPage.itemDetails.first()).toContainText(productAPrice!); // value is guaranteed to be a string at that point.
    await expect(cartPage.removeBtn.first()).toBeVisible();
    await expect(cartPage.increaseBtn.first()).toBeVisible();
    await expect(cartPage.decreaseBtn.first()).toBeVisible();
    await expect(cartPage.qtyInput.first()).toHaveValue('1');
    await expect(cartPage.orderSummary).toBeVisible();
    await expect(cartPage.cartSubtotal).toContainText(productAPrice!);
    await expect(cartPage.cartTotal).toContainText(productAPrice!);
  });

  test('CT-TC-005: Increase item quantity in cart', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.productLikesApi, 200); // the likes that takes time #GOMAA FIXED
    await expect(cartPage.generalImage.last()).toBeVisible();//40ms
    await productsPage.addToCartButton.first().click(); // one click ('1')
    await expect(productsPage.addedToCartSuccessMessage.first()).toBeVisible();
    await productsPage.addToCartButton.nth(1).click(); // two clicks ('2')
    await expect(productsPage.addedToCartSuccessMessage.first()).toBeVisible();
    await page.goto(urlsData.cartUrl);
    await expect(productsPage.addedToCartSuccessMessage.first()).not.toBeVisible(); // better than wait network count fixed
    await expect(basePage.cartBadge).toContainText('2');
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await expect(cartPage.qtyInput.first()).toHaveValue('1');
    await cartPage.increaseBtn.first().click(); //2
    await ApiWaiting.waitForAndAssertResponse(page, cartData.cartApi, 200, 'data.0.quantity', 2);  // fix count problem fater than network idle
    await cartPage.increaseBtn.first().click();//3
    // await basePage.waitForNetworkIdle(); // 0.5 seconds xx
    await ApiWaiting.waitForAndAssertResponse(page, "**/**", 200, 'message', cartData.cartCountUpdateApiMessage);  // fix count problem fater than network idle
    await expect(cartPage.qtyInput.first()).toHaveValue('3');
    await expect(await cartPage.getProductQuantityFirstPrice()).toBeCloseTo(await cartPage.getSingleProductPrice() * 3); // toBeCloseTo for 2 digits
    await expect(await cartPage.getCartTotal()).toBeCloseTo(await cartPage.getProductQuantityFirstPrice() + await cartPage.getProductQuantitySecondPrice());
  });

  test('CT-TC-006: Decrease item quantity in cart', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.productLikesApi, 200); // the likes that takes time #GOMAA FIXED
    // await basePage.waitForNetworkIdle(); //1 seconds
    await productsPage.addToCartButton.first().click();
    await expect(productsPage.addedToCartSuccessMessage.first()).toBeVisible();
    await productsPage.addToCartButton.nth(1).click();
    await expect(productsPage.addedToCartSuccessMessage.first()).toBeVisible();
    await expect(basePage.cartBadge).toContainText('2');
    await page.goto(urlsData.cartUrl);
    await expect(productsPage.addedToCartSuccessMessage.first()).not.toBeVisible(); // better than wait network count fixed
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await expect(cartPage.qtyInput.first()).toHaveValue('1');
    await cartPage.increaseBtn.first().click(); //2
    await ApiWaiting.waitForAndAssertResponse(page, cartData.cartApi, 200, 'data.0.quantity', 2);  // fix count problem fater than network idle
    await cartPage.increaseBtn.first().click();//3
    await basePage.waitForNetworkIdle(); // 0.5 seconds
    await expect(cartPage.qtyInput.first()).toHaveValue('3');
    await cartPage.decreaseBtn.first().click(); // 2
    await expect(cartPage.qtyInput.first()).toHaveValue('2');
    await expect(await cartPage.getProductQuantityFirstPrice()).toBeCloseTo(await cartPage.getSingleProductPrice() * 2); // toBeCloseTo for 2 digits
    await expect(await cartPage.getCartTotal()).toBeCloseTo(await cartPage.getProductQuantityFirstPrice() + await cartPage.getProductQuantitySecondPrice());

  });

  test('CT-TC-007: Set specific item quantity in cart', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.productLikesApi, 200); // the likes that takes time #GOMAA FIXED
    await productsPage.addToCartButton.first().click();
    await expect(productsPage.addedToCartSuccessMessage.first()).toBeVisible();
    await page.goto(urlsData.cartUrl);
    // await basePage.waitForNetworkIdle(); // 0.5 seconds
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await expect(cartPage.qtyInput.first()).toHaveValue('1');
    await cartPage.qtyInput.first().fill('44');
    await expect(cartPage.qtyInput.first()).toHaveValue('44');
    await cartPage.qtyInput.first().press('Enter');
    await ApiWaiting.waitForAndAssertResponse(page, cartData.cartApi, 200, 'data.0.quantity', 44);  // fix count problem fater than network idle
    // await cartPage.checkoutButton.scrollIntoViewIfNeeded(); // after enter need sometime to update price 118ms
    await expect(await cartPage.getProductQuantityFirstPrice()).toBeCloseTo(await cartPage.getSingleProductPrice() * 44); // toBeCloseTo for 2 digits
    await expect(await cartPage.getCartTotal()).toBeCloseTo(await cartPage.getProductQuantityFirstPrice());
  });

  test('CT-TC-008: Remove item from cart', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    // await basePage.waitForNetworkIdle(); //1 seconds
    await expect(cartPage.generalImage.last()).toBeVisible();
    const productAName = await productsPage.productName.first().textContent();
    const productBName = await productsPage.productName.nth(1).textContent();
    await productsPage.addToCartButton.first().click();
    await productsPage.addToCartButton.nth(1).click();
    await expect(basePage.cartBadge).toContainText('2');
    await page.goto(urlsData.cartUrl);
    // await basePage.waitForNetworkIdle(); // 0.5 seconds
    await expect(cartPage.generalImage.last()).toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await expect(cartPage.cartItems).toContainText(productAName!);
    await cartPage.removeBtn.first().click();
    await expect(cartPage.itemRemovedAlert.nth(0)).toBeVisible(); // inline alert
    await expect(cartPage.cartItems).not.toContainText(productAName!);
    await expect(cartPage.cartItems).toContainText(productBName!);
    await expect(basePage.cartBadge).toContainText('1');
    await cartPage.removeBtn.last().click();
    await expect(cartPage.itemRemovedAlert.nth(0)).toBeVisible(); // inline alert
    await expect(cartPage.cartItems).not.toContainText(productBName!);
    await expect(basePage.cartBadge).toContainText('0');
    await expect(cartPage.cartEmptyLabel).toContainText('Your cart is empty');
    await expect(cartPage.cartTotal).toContainText('$0.00');
    await expect(cartPage.cartSubtotal).toContainText('$0.00');
    await expect(cartPage.qtyInput.first()).not.toBeVisible();
  });

  test('CT-TC-009: Clear entire cart', async ({ page }) => {
    await page.goto(urlsData.cartUrl);
    cartPage.acceptAlert(); // accept aleart first 
    await cartPage.clearCartButton.click();
    await expect(basePage.cartBadge).toContainText('0');
    await expect(cartPage.cartEmptyLabel).toContainText(cartData.cartEmptyByText);
    await expect(cartPage.cartClearedAlert).toBeVisible(); // inline alert
    await expect(cartPage.cartTotal).toContainText('$0.00');
    await expect(cartPage.cartSubtotal).toContainText('$0.00');
    await expect(cartPage.qtyInput.first()).not.toBeVisible();
  });

  test('CT-TC-010: Verify cart calculations have correct format', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.productLikesApi, 200); // the likes that takes time #GOMAA FIXED
    await productsPage.addToCartButton.nth(0).click();
    await productsPage.addToCartButton.nth(1).click();
    await productsPage.addToCartButton.nth(3).click();
    await productsPage.addToCartButton.nth(4).click();
    await expect(basePage.cartBadge).toContainText('4');
    const totalPrices = await productsPage.getSumOfAllProductsPrices();
    await page.goto(urlsData.cartUrl);
    await expect(cartPage.generalImage.last()).toBeVisible(); //130 ms fix cart loading problem #GOMAA
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    expect(await cartPage.getCartTotal()).toBeCloseTo(totalPrices);// await a promise before passing it
    expect(await cartPage.getCartSubtotal()).toBeCloseTo(totalPrices); // await a promise before passing it
  });

  test('CT-TC-011: Proceed to checkout with cart items', async ({ page }) => { //x
    await page.goto(urlsData.productsUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.addToCartButton.nth(0).click();
    await page.goto(urlsData.cartUrl);
    await expect(basePage.cartBadge).toContainText('1');
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await cartPage.acceptAlertInputAddress(cartData.cartAddress);
    await cartPage.checkoutButton.click();
    await expect(cartPage.orderPlacedSuccessfully).toBeVisible();
    //await expect(page).toHaveURL(urlsData.orderUrl); //3 seconds
  });

  test('CT-TC-012: Invalid proceed to checkout with cart items with empty shipping address', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.addToCartButton.nth(0).click();
    await page.goto(urlsData.cartUrl);
    await expect(basePage.cartBadge).toContainText('1');
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await cartPage.acceptAlertInputAddress("");
    await cartPage.checkoutButton.click();
    await expect(cartPage.orderPlacedSuccessfully).not.toBeVisible();
    await expect(page).toHaveURL(urlsData.cartUrl);
  });

  test('CT-TC-013: Checkout with out of stock quantity values', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.addToCartButton.first().click();
    await expect(productsPage.addedToCartSuccessMessage.first()).toBeVisible();
    await page.goto(urlsData.cartUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await expect(cartPage.qtyInput.first()).toHaveValue('1');
    await cartPage.qtyInput.first().fill('999999');
    await expect(cartPage.qtyInput.first()).toHaveValue('999999');
    await cartPage.qtyInput.first().press('Enter');
    await cartPage.checkoutButton.scrollIntoViewIfNeeded();
    await cartPage.acceptAlertInputAddress(cartData.cartAddress);
    await cartPage.checkoutButton.click();
    await expect(cartPage.insufficientStockAlert).toBeVisible();
  });


  test('CT-TC-014: Handle invalid zero quantity values', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.addToCartButton.first().click();
    await expect(productsPage.addedToCartSuccessMessage.first()).toBeVisible();
    await page.goto(urlsData.cartUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await expect(cartPage.qtyInput.first()).toHaveValue('1');
    await cartPage.qtyInput.first().fill('0');
    await expect(cartPage.qtyInput.first()).toHaveValue('0');
    await cartPage.qtyInput.first().press('Enter');
    await cartPage.checkoutButton.scrollIntoViewIfNeeded();
    await expect(cartPage.itemRemovedAlert).toBeVisible();
  });

  test('CT-TC-015: Handle invalid negative quantity values', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.addToCartButton.first().click();
    await expect(productsPage.addedToCartSuccessMessage.first()).toBeVisible();
    await page.goto(urlsData.cartUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await expect(cartPage.qtyInput.first()).toHaveValue('1');
    await cartPage.qtyInput.first().fill('-5');
    await expect(cartPage.qtyInput.first()).toHaveValue('-5');
    await cartPage.qtyInput.first().press('Enter');
    await cartPage.checkoutButton.scrollIntoViewIfNeeded();
    await expect(cartPage.itemRemovedAlert).toBeVisible();
  });



  test('CT-TC-016: Validate cart functionality after navigation', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await productsPage.addToCartButton.first().click();
    await productsPage.addToCartButton.nth(1).click();
    await expect(basePage.cartBadge).toContainText('2');
    await page.goto(urlsData.cartUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    const productAName = await cartPage.heading.first().textContent();
    const productBName = await cartPage.heading.nth(1).textContent();
    const productAPrice = await cartPage.itemTotal.first().textContent();
    const productBPrice = await cartPage.itemTotal.nth(1).textContent();
    const totalPrices = await cartPage.cartTotal.textContent();
    await page.goto(urlsData.baseUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await expect(basePage.cartBadge).toContainText('2');
    await page.goto(urlsData.cartUrl);
    await expect(cartPage.generalImage.last()).toBeVisible();
    await expect(cartPage.cartEmptyLabel).not.toBeVisible();
    await basePage.waitForNetworkIdle();
    expect(await cartPage.heading.first().textContent()).toBe(productAName);
    expect(await cartPage.heading.nth(1).textContent()).toBe(productBName);
    expect(await cartPage.itemTotal.first().textContent()).toBe(productAPrice);
    expect(await cartPage.itemTotal.nth(1).textContent()).toBe(productBPrice);
    expect(await cartPage.cartTotal.textContent()).toBe(totalPrices);
  });



});