import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {


  // by locators
  readonly productPrice = this.page.locator('.product-price');
  readonly productStock = this.page.locator('.product-stock');
  readonly productName = this.page.locator('.product-name');
  readonly productsGrid = this.page.locator('.products-grid');
  readonly productCard = this.page.locator('.product-card');
  readonly categoryFilter = this.page.locator('#category-filter');
  readonly noProducts = this.page.locator('#no-products');
  readonly pagination = this.page.locator('#pagination');
  readonly paginationActiveButton = this.page.locator('.page-btn.active');
  readonly paginationButton = this.page.locator('.page-btn');
  readonly firstProductLikesCount = this.page.locator('#btn-like-1');


  // by role
  readonly viewDetailsButton = this.page.getByRole('link', { name: 'View Details' });
  readonly productLikes = this.page.getByRole('button', { name: 'Like' });
  readonly addToCartButton = this.page.getByRole('button', { name: 'Add to Cart' });
  readonly searchProduct = this.page.getByRole('textbox', { name: 'Search products...' });
  readonly minPrice = this.page.getByPlaceholder('Min Price');
  readonly maxPrice = this.page.getByPlaceholder('Max Price');
  readonly applyFiltersButton = this.page.getByRole('button', { name: 'Apply Filters' });



  //byText locators
  readonly loadingProducts = this.page.getByText('Loading products...');
  readonly addedToCartSuccessMessage = this.page.getByText('Added to cart!');
  readonly likeAlertMessage = this.page.getByText("Product liked! ❤️");
  readonly likeAgainAlertMessage = this.page.getByText("You have already liked this product!");


  // by snapshots
  readonly paginationSnapshot = `
    - button "1"
    - button "2"
    - button "3"
    - button "4"
    - button "5"
    - button "6"
    - button "7"
    - button "8"
    - button "9"
    - button /\\d+/
    `;


  // sum of all products prices
  async getSumOfAllProductsPrices(): Promise<number> {
    const productAPrice = parseFloat((await this.productPrice.nth(0).textContent())!.replace('$', ''));
    const productBPrice = parseFloat((await this.productPrice.nth(1).textContent())!.replace('$', ''));
    const productCPrice = parseFloat((await this.productPrice.nth(3).textContent())!.replace('$', ''));
    const productDPrice = parseFloat((await this.productPrice.nth(4).textContent())!.replace('$', ''));
    const sumOfAllProductsPrices = productAPrice + productBPrice + productCPrice + productDPrice;
    return sumOfAllProductsPrices;
  }




}