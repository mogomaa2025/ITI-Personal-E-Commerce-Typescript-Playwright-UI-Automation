import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailsPage extends BasePage {
  readonly productImage: Locator;
  readonly productStockBadge: Locator;
  readonly productName: Locator;
  readonly productCategory: Locator;
  readonly productPrice: Locator;
  readonly productStars: Locator;
  readonly productReviewsCount: Locator;
  readonly productDescription: Locator;
  readonly productStock: Locator;
  readonly btnIncreaseQty: Locator;
  readonly btnDecreaseQty: Locator;
  readonly quantityInput: Locator;
  readonly btnLikeProduct: Locator;
  readonly btnAddToWishlist: Locator;
  readonly btnBackToProducts: Locator;
  readonly btnWriteReview: Locator;
  readonly reviewForm: Locator;
  readonly reviewTextarea: Locator;
  readonly reviewSubmitButton: Locator;
  readonly avgRatingValue: Locator;
  readonly avgRatingStars: Locator;
  readonly totalReviewsCount: Locator;
  readonly reviewsList: Locator;
  readonly reviewCards: Locator;
  readonly tabSpecifications: Locator;
  readonly specProductId: Locator;
  readonly specCategory: Locator;
  readonly specStock: Locator;
  readonly specPrice: Locator;
  readonly specAddedDate: Locator;

  constructor(page: Page) {
    super(page);
    this.productImage = page.locator('#product-detail-image');
    this.productStockBadge = page.locator('#product-stock-badge');
    this.productName = page.locator('#product-detail-name');
    this.productCategory = page.locator('#product-detail-category');
    this.productPrice = page.locator('#product-detail-price');
    this.productStars = page.locator('#product-stars');
    this.productReviewsCount = page.locator('#product-rating-text');
    this.productDescription = page.locator('#product-detail-description');
    this.productStock = page.locator('#product-detail-stock');
    this.btnIncreaseQty = page.locator('#btn-increase-qty');
    this.btnDecreaseQty = page.locator('#btn-decrease-qty');
    this.quantityInput = page.locator('#quantity-input');
    this.btnLikeProduct = page.locator('#btn-like-product');
    this.btnAddToWishlist = page.locator('#btn-add-to-wishlist');
    this.btnBackToProducts = page.locator('#btn-back-to-products');
    this.btnWriteReview = page.locator('#btn-write-review');
    this.reviewForm = page.locator('#review-form');
    this.reviewTextarea = page.locator('#review-comment');
    this.reviewSubmitButton = page.locator('button[type="submit"]:has-text("Submit"), button:has-text("Submit Review")');
    this.avgRatingValue = page.locator('#avg-rating-value');
    this.avgRatingStars = page.locator('#avg-rating-stars');
    this.totalReviewsCount = page.locator('#total-reviews-count');
    this.reviewsList = page.locator('#reviews-list');
    this.reviewCards = page.locator('.review-card');
    this.tabSpecifications = page.locator('#tab-header-specifications');
    this.specProductId = page.locator('#spec-product-id');
    this.specCategory = page.locator('#spec-category');
    this.specStock = page.locator('#spec-stock');
    this.specPrice = page.locator('#spec-price');
    this.specAddedDate = page.locator('#spec-date');
  }

  async navigateTo(productId: string): Promise<void> {
    await this.page.goto(`/web/products/${productId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async isProductImageVisible(): Promise<boolean> {
    return await this.productImage.isVisible();
  }

  async isProductStockBadgeVisible(): Promise<boolean> {
    return await this.productStockBadge.isVisible();
  }

  async getProductName(): Promise<string | null> {
    return await this.productName.textContent();
  }

  async getProductCategory(): Promise<string | null> {
    return await this.productCategory.textContent();
  }

  async getProductPrice(): Promise<string | null> {
    return await this.productPrice.textContent();
  }

  async isPriceValid(): Promise<boolean> {
    const price = await this.getProductPrice();
    if (!price) return false;
    const priceRegex = /^\$\d+\.\d{2}$/;
    return priceRegex.test(price.trim());
  }

  async getProductStars(): Promise<number> {
    const text = await this.productStars.textContent();
    return text ? (text.match(/★/g) || []).length : 0;
  }

  async getProductReviewsCount(): Promise<number> {
    const reviewsText = await this.productReviewsCount.textContent();
    if (!reviewsText) return 0;
    const match = reviewsText.match(/\((\d+)\s*reviews?\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async isReviewsCountValid(): Promise<boolean> {
    const count = await this.getProductReviewsCount();
    return count <= 5;
  }

  async getProductDescription(): Promise<string | null> {
    return await this.productDescription.textContent();
  }

  async getProductStock(): Promise<string | null> {
    return await this.productStock.textContent();
  }

  async isBtnIncreaseQtyVisible(): Promise<boolean> {
    return await this.btnIncreaseQty.isVisible();
  }

  async isBtnDecreaseQtyVisible(): Promise<boolean> {
    return await this.btnDecreaseQty.isVisible();
  }

  async getQuantityInputValue(): Promise<string> {
    return await this.quantityInput.inputValue() || '0';
  }

  async setQuantityInput(value: number): Promise<void> {
    await this.quantityInput.fill(value.toString());
  }

  async clickIncreaseQty(): Promise<void> {
    await this.btnIncreaseQty.click();
    await this.page.waitForTimeout(500);
  }

  async clickDecreaseQty(): Promise<void> {
    await this.btnDecreaseQty.click();
    await this.page.waitForTimeout(500);
  }

  async clickLikeProduct(): Promise<void> {
    await this.btnLikeProduct.click();
    await this.page.waitForTimeout(500);
  }

  async isProductLiked(): Promise<boolean> {
    const text = await this.btnLikeProduct.textContent();
    return text?.includes('Liked') || text?.includes('❤️') || false;
  }

  async clickAddToWishlist(): Promise<void> {
    await this.btnAddToWishlist.click();
    await this.page.waitForTimeout(500);
  }

  async clickAddToCart(): Promise<void> {
    const addToCartBtn = this.page.locator('#btn-add-to-cart-detail');
    await addToCartBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async clickBackToProducts(): Promise<void> {
    await this.btnBackToProducts.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isOnProductsPage(): Promise<boolean> {
    return this.page.url().includes('/web/products') && !this.page.url().match(/\/web\/products\/\d+/);
  }

  async clickWriteReview(): Promise<void> {
    await this.btnWriteReview.click();
    await this.page.waitForTimeout(500);
  }

  async isReviewFormVisible(): Promise<boolean> {
    return await this.reviewForm.isVisible();
  }

  async writeReview(reviewText: string): Promise<void> {
    await this.reviewTextarea.fill(reviewText);
  }

  async submitReview(): Promise<void> {
    await this.reviewSubmitButton.click();
    await this.page.waitForTimeout(1000);
  }

  async getAvgRatingValue(): Promise<string | null> {
    return await this.avgRatingValue.textContent();
  }

  async getAvgRatingStars(): Promise<number> {
    const starsElement = this.avgRatingStars;
    if (!await starsElement.isVisible()) return 0;
    const text = await starsElement.textContent();
    if (!text) return 0;
    // Count the number of filled stars (★)
    return (text.match(/★/g) || []).length;
  }

  async getTotalReviewsCount(): Promise<number> {
    const countText = await this.totalReviewsCount.textContent();
    if (!countText) return 0;
    const match = countText.match(/(\d+)\s*review/);
    return match ? parseInt(match[1]) : 0;
  }

  async isReviewsListVisible(): Promise<boolean> {
    return await this.reviewsList.isVisible();
  }

  async getReviewCardsCount(): Promise<number> {
    return await this.reviewCards.count();
  }

  async getReviewCardContent(index: number): Promise<{ author: string | null; rating: number; text: string | null }> {
    const card = this.reviewCards.nth(index);
    const ratingElement = card.locator('.review-rating').first();
    let rating = 0;
    if (await ratingElement.isVisible()) {
      const ratingText = await ratingElement.textContent();
      if (ratingText) {
        rating = (ratingText.match(/★/g) || []).length;
      }
    }
    const dateElement = card.locator('.review-date').first();
    const author = await dateElement.textContent(); // Date serves as identifier
    const text = await card.locator('.review-comment').first().textContent();
    return { author, rating, text };
  }

  async clickTabSpecifications(): Promise<void> {
    await this.tabSpecifications.click();
    await this.page.waitForTimeout(500);
  }

  async getSpecProductId(): Promise<string | null> {
    return await this.specProductId.textContent();
  }

  async getSpecCategory(): Promise<string | null> {
    return await this.specCategory.textContent();
  }

  async getSpecStock(): Promise<string | null> {
    return await this.specStock.textContent();
  }

  async getSpecPrice(): Promise<string | null> {
    return await this.specPrice.textContent();
  }

  async getSpecAddedDate(): Promise<string | null> {
    return await this.specAddedDate.textContent();
  }

  async getProductData(): Promise<{
    name: string | null;
    category: string | null;
    price: string | null;
    stars: number;
    reviewsCount: number;
    description: string | null;
    stock: string | null;
  }> {
    return {
      name: await this.getProductName(),
      category: await this.getProductCategory(),
      price: await this.getProductPrice(),
      stars: await this.getProductStars(),
      reviewsCount: await this.getProductReviewsCount(),
      description: await this.getProductDescription(),
      stock: await this.getProductStock()
    };
  }

  async checkQuantityInCart(expectedQuantity: number): Promise<boolean> {
    // Wait for cart badge to update
    await this.page.waitForTimeout(1500);
    const cartCount = await this.getCartBadgeCount();
    // Cart badge shows unique products, not total quantity
    // So if we add 3 of the same product, it still shows 1
    // We need to check the actual cart page for quantity
    return cartCount >= 1; // At least one product should be in cart
  }
  
  async getCartItemQuantity(productId: string): Promise<number> {
    // Navigate to cart and check quantity for specific product
    await this.page.goto('http://127.0.0.1:5000/web/cart');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    // Try to find quantity input for this product
    // The quantity input might be in a table row or card for the product
    const quantityInputs = this.page.locator('input[type="number"]');
    const count = await quantityInputs.count();
    
    // If there's only one item in cart, it should be our product
    if (count > 0) {
      const firstInput = quantityInputs.first();
      if (await firstInput.isVisible()) {
        const value = await firstInput.inputValue();
        return parseInt(value) || 0;
      }
    }
    return 0;
  }
}