import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailsPage extends BasePage {



  readonly productPrice = this.page.getByRole('heading', { name: '$' })
  readonly productStock = this.page.locator(`#product-detail-stock`)
  readonly productStars = this.page.locator(`#product-detail-stock`)
  readonly btnAddToCart = this.page.getByRole('button', { name: 'Add to Cart' })
  readonly btnBuyNow = this.page.getByRole('button', { name: 'Buy Now' })
  readonly btnLikeProduct = this.page.getByRole('button', { name: '🤍 Like' })
  readonly btnAddToWishlist = this.page.getByRole('button', { name: '❤️ Add to Wishlist' })
  readonly btnBackToProducts = this.page.getByRole('button', { name: '← Back to Products' })
  readonly btnWriteReview = this.page.getByRole('button', { name: 'Write a Review' })
  readonly addedToCartSuccessMessage = this.page.getByText('Added to cart successfully!')


}