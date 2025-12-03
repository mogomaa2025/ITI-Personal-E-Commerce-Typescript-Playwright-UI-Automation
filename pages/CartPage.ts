import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {

  // locators
  readonly cartItems = this.page.locator('#cart-items');
  readonly cartTotal = this.page.locator('#cart-total');
  readonly cartSubtotal = this.page.locator('#cart-subtotal');
  readonly qtyInput = this.page.locator('.qty-input');
  readonly itemDetails = this.page.locator('.item-details');
  readonly cartSummary = this.page.locator('#cart-summary');
  readonly itemPrice = this.page.locator('.item-price');
  readonly itemTotal = this.page.locator('.item-total');

  //by Text locators
  readonly cartEmptyLabel = this.page.getByText("Your cart is empty");
  readonly checkoutButton = this.page.getByText('Proceed to Checkout');
  readonly pleaseLoginToContinue = this.page.getByText('Please login to continue');
  readonly itemRemovedAlert = this.page.getByText('Item removed');
  readonly cartClearedAlert = this.page.getByText("Cart cleared");
  readonly orderPlacedSuccessfully = this.page.getByText("Order placed successfully!");
  readonly insufficientStockAlert = this.page.getByText("Insufficient stock");//


  //by Role locators
  readonly increaseBtn = this.page.getByRole('button', { name: '+' });
  readonly decreaseBtn = this.page.getByRole('button', { name: '-' });
  readonly removeBtn = this.page.getByRole('button', { name: '×' });
  readonly clearAllCart = this.page.getByRole('button', { name: 'Clear Cart' });
  readonly orderSummary = this.page.getByRole('heading', { name: "order summary" });
  readonly generalImage = this.page.getByRole('img');
  readonly clearCartButton = this.page.getByRole('button', { name: 'Clear Cart' });
  readonly heading = this.page.getByRole('heading');


  //by Accessability locators


  // accept alert : Remember before clicking
  async acceptAlert(): Promise<void> {
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });
  }

  async acceptAlertInputAddress(address: string): Promise<void> {
    this.page.once('dialog', async dialog => {
      await dialog.accept(address);
    });
  }

  async dismissAlertInputAddress(): Promise<void> {
    this.page.once('dialog', async dialog => {
      await dialog.dismiss();
    });
  }


  // single product parser method
  async getSingleProductPrice(): Promise<number> {
    let singleProductPriceText = await this.itemPrice.first().textContent();
    let singleProductPrice = singleProductPriceText ? parseFloat(singleProductPriceText.replace('$', '')) : 0;
    return singleProductPrice; // price of one
  }

  // productQuantityPrice
  async getProductQuantityFirstPrice(): Promise<number> {
    let productQuantityPriceText = await this.itemTotal.first().textContent();
    let productQuantityPrice = productQuantityPriceText ? parseFloat(productQuantityPriceText.replace('$', '')) : 0;
    return productQuantityPrice;
  }

  // 2nd product parser method
  async getSecondProductPrice(): Promise<number> {
    let secondProductPriceText = await this.itemPrice.nth(1).textContent();
    let secondProductPrice = secondProductPriceText ? parseFloat(secondProductPriceText.replace('$', '')) : 0;
    return secondProductPrice;
  }

  // productQuantityPrice
  async getProductQuantitySecondPrice(): Promise<number> {
    let productQuantityPriceText = await this.itemTotal.nth(1).textContent();
    let productQuantityPrice = productQuantityPriceText ? parseFloat(productQuantityPriceText.replace('$', '')) : 0;
    return productQuantityPrice;
  }

  // cart total parser method
  async getCartTotal(): Promise<number> {
    let cartTotalText = await this.cartTotal.textContent();
    let cartTotal = cartTotalText ? parseFloat(cartTotalText.replace('$', '')) : 0;
    return cartTotal;
  }

  // cart subtotal parser method
  async getCartSubtotal(): Promise<number> {
    let cartSubtotalText = await this.cartSubtotal.textContent();
    let cartSubtotal = cartSubtotalText ? parseFloat(cartSubtotalText.replace('$', '')) : 0;
    return cartSubtotal;
  }


}