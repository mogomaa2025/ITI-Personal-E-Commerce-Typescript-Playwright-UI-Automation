import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { ProductsPage } from '../pages/ProductsPage';
import { LoginPage } from '../pages/LoginPage';
import { Helpers } from '../utils/helpers';
import { RegisterPage } from '../pages/RegisterPage';
import testData from '../data/data.json';
import users from '../data/users.json';
import { BasePage } from '@pages/BasePage';
import { ApiWaiting } from '../utils/ApiWaiting';
import urlsData from '../data/urls.json';
import cartData from '../data/cart.json';
import { ProductDetailsPage } from '@pages/ProductDetailsPage';
import productData from '../data/product.json';
import { faker } from '@faker-js/faker';


// Simulating the data provider from Java
// const productDatax = {
//   productId: '1',
//   existingProduct: 'Laptop',
//   nonExistingProduct: 'NonExistentProduct',
//   searchProductCheckId: '1',
//   categoryToSelect: 'Electronics',
//   firstProductId: '1',
//   minPriceStr: '50',
//   maxPriceStr: '500',
//   filterProductPriceCheckId: '1',
//   pageNumber: 2,
//   productIdToBeLike: '1'
// };

test.describe('Products Tests', () => {
  let cartPage: CartPage;
  let productsPage: ProductsPage;
  let loginPage: LoginPage;
  let helpers: Helpers;
  let basePage: BasePage;
  let productdPage: ProductDetailsPage;

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    loginPage = new LoginPage(page);
    helpers = new Helpers(page);
    basePage = new BasePage(page);
    productdPage = new ProductDetailsPage(page);

    await page.goto(urlsData.loginUrl);
    await basePage.waitForNetworkIdle(); //1 seconds
    await loginPage.login(users.productsxUser.email, users.productsxUser.password);
    await basePage.waitForNetworkIdle(); //1 seconds

  });

  test('PT-TC-001: View products list', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.imageApi, 200); // wait for images to load specialy slow images
    //await page.waitForLoadState('networkidle'); // more time
    await expect(productsPage.productsGrid).toBeVisible();
    await expect(productsPage.productCard.first()).toBeVisible();
    await expect(productsPage.productName.first()).toBeVisible();
    await expect(productsPage.productPrice.first()).toBeVisible();
    await expect(productsPage.viewDetailsButton.first()).toBeVisible();
    await expect(productsPage.productLikes.first()).toBeVisible();
    await expect(productsPage.addToCartButton.first()).toBeVisible();
    await expect(productsPage.viewDetailsButton.first()).toBeEnabled();
    await expect(productsPage.productLikes.first()).toBeEnabled();
    await expect(productsPage.addToCartButton.first()).toBeEnabled();
  });

  test('PT-TC-002: View product details', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.imageApi, 200);
    //await page.waitForLoadState('networkidle'); // more time
    await expect(productsPage.productsGrid).toBeVisible();
    await expect(productsPage.productCard.first()).toBeVisible();
    const productAName = await productsPage.productName.first().textContent();
    const productAPrice = await productsPage.productPrice.first().textContent();
    const productAStock = await productsPage.productStock.first().textContent();
    const stockNumber = String(productAStock?.match(/\d+/)?.[0]); // if number not string it can't find number inside string
    await expect(productsPage.viewDetailsButton.first()).toBeVisible();
    await productsPage.viewDetailsButton.first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(`Home / Products / ${productAName}`)).toBeVisible();
    expect(await productdPage.productPrice.textContent()).toContain(productAPrice); // await before except to get the text content
    expect(await productdPage.productStock.textContent()).toContain(stockNumber);
    await expect(productdPage.productStars).toBeVisible();
    await expect(productdPage.btnAddToCart).toBeVisible();
    await expect(productdPage.btnBuyNow).toBeVisible();
    await expect(productdPage.btnLikeProduct).toBeVisible();
    await expect(productdPage.btnAddToWishlist).toBeVisible();
    await expect(productdPage.btnBackToProducts).toBeVisible();
    await expect(productdPage.btnWriteReview).toBeVisible();
  });

  test('PT-TC-003: Search for a product', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.imageApi, 200);
    await expect(productsPage.productsGrid).toBeVisible();
    await expect(productsPage.productCard.first()).toBeVisible();
    await productsPage.searchProduct.fill(productData.searchWord);
    await productsPage.categoryFilter.selectOption(productData.categoryToSelect);
    await productsPage.minPrice.fill(productData.minPriceStr);
    await productsPage.maxPrice.fill(productData.maxPriceStr);
    await productsPage.applyFiltersButton.click();
    await expect(productsPage.productName.first()).toContainText(productData.searchWord);
  });

  test('PT-TC-004: Search for a non-existent product', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.imageApi, 200);
    await expect(productsPage.productsGrid).toBeVisible();
    await expect(productsPage.productCard.first()).toBeVisible();
    await productsPage.searchProduct.fill(productData.nonExistingProduct);
    await productsPage.categoryFilter.selectOption(productData.categoryToSelect);
    await productsPage.minPrice.fill(productData.minPriceStr);
    await productsPage.maxPrice.fill(productData.maxPriceStr);
    await productsPage.applyFiltersButton.click();
    await expect(productsPage.noProducts).toContainText(productData.noProductsFound);
  });

  test('PT-TC-005: Filter products by category', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.imageApi, 200);
    await expect(productsPage.productsGrid).toBeVisible();
    await expect(productsPage.productCard.first()).toBeVisible();
    await productsPage.categoryFilter.selectOption(productData.onlyCategorySearch);
    await productsPage.applyFiltersButton.click();
    await expect(productsPage.productsGrid).toContainText(productData.anyExistingBook);
  });

  test('PT-TC-006: Filter products by price', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.imageApi, 200);
    await expect(productsPage.productsGrid).toBeVisible();
    await expect(productsPage.productCard.first()).toBeVisible();
    await productsPage.minPrice.fill(productData.productPriceMinRangeCheck);
    await productsPage.maxPrice.fill(productData.productPriceMaxRangeCheck);
    await productsPage.applyFiltersButton.click();
    await expect(productsPage.productName.first()).toContainText(productData.searchWord);
    expect(parseFloat((await productsPage.productPrice.nth(0).textContent() || '0').replace(/[^0-9.]/g, '')))
      .toBeGreaterThan(parseFloat(productData.productPriceMinRangeCheck));
    expect(parseFloat((await productsPage.productPrice.nth(0).textContent() || '0').replace(/[^0-9.]/g, '')))
      .toBeLessThan(parseFloat(productData.productPriceMaxRangeCheck));
    expect(parseFloat((await productsPage.productPrice.last().textContent() || '0').replace(/[^0-9.]/g, '')))
      .toBeGreaterThan(parseFloat(productData.productPriceMinRangeCheck));
    expect(parseFloat((await productsPage.productPrice.last().textContent() || '0').replace(/[^0-9.]/g, '')))
      .toBeLessThan(parseFloat(productData.productPriceMaxRangeCheck));
    // // for looping through 5 products
    // for (let i = 0; i <= 5; i++) {
    //   const priceText = await productsPage.productPrice.nth(i).textContent();
    //   const price = parseFloat((priceText || '0').replace(/[^0-9.]/g, ''));
    //   expect(price).toBeGreaterThan(parseFloat(productData.productPriceMinRangeCheck));
    //   expect(price).toBeLessThan(parseFloat(productData.productPriceMaxRangeCheck));
    // }
  });

  test('PT-TC-007: Verify product pagination', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await ApiWaiting.waitForAndAssertResponseNoBody(page, cartData.imageApi, 200);
    await expect(productsPage.productsGrid).toBeVisible();
    await expect(productsPage.productCard.first()).toBeVisible();
    const productAName = await productsPage.productName.first().textContent();
    await expect(productsPage.pagination).toMatchAriaSnapshot(productsPage.paginationSnapshot);
    await expect(productsPage.paginationActiveButton).toBeVisible(); // if there are more than active it will make exception
    await productsPage.paginationButton.nth(1).click();
    await expect(await productsPage.productName.first()).not.toContainText(productAName!);
  });

});


test.describe('Likes Tests - Fresh User', () => {
  let productsPage: ProductsPage;
  let helpers: Helpers;
  let cartPage: CartPage;
  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    // initialize pages
    cartPage = new CartPage(page);
    productsPage = new ProductsPage(page);
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    helpers = new Helpers(page);
    basePage = new BasePage(page);


    await page.goto(urlsData.registerUrl);
    await expect(registerPage.registerCart).toMatchAriaSnapshot(registerPage.registerFormSnapshot);
    await expect(registerPage.registerButton).toBeVisible();
    const emailrandom = faker.internet.email();
    const passwordrandom = "1" + faker.internet.password();
    await registerPage.register({
      name: faker.person.firstName(),
      email: emailrandom,
      password: passwordrandom,
      phone: "+2010" + faker.number.int({ min: 1000000, max: 9999999 }),
      address: faker.location.streetAddress()
    });
    await expect(registerPage.userSuccessRegisterALert).toBeVisible();
    await page.goto(urlsData.loginUrl);
    await basePage.waitForNetworkIdle(); //1 seconds
    await loginPage.login(emailrandom, passwordrandom);
    await basePage.waitForNetworkIdle(); //1 seconds
  });


  test('PT-TC-008 & PT-TC-009: Verify product like and unlike functionality', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await productsPage.productLikes.first().click();
    await expect(productsPage.likeAlertMessage).toBeVisible();
    //  await expect(productsPage.likeAlertMessage).toBeHidden(); // take alot of time 5 s
    await productsPage.productLikes.first().click();
    await expect(productsPage.likeAgainAlertMessage).toBeVisible();
  });

  test('PT-TC-0010: Verify product like count', async ({ page }) => {
    await page.goto(urlsData.productsUrl);
    await productsPage.productLikes.first().click();
    await expect(productsPage.likeAlertMessage).toBeVisible();
    const likeCount = await productsPage.firstProductLikesCount.textContent();
    await page.goto(urlsData.baseUrl);
    await basePage.productsNavBar.click();
    await expect(productsPage.firstProductLikesCount).toContainText(likeCount!);
  });



});
