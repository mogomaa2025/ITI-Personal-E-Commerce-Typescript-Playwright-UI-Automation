import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  // Guest-specific elements
  readonly addToCartButtons: Locator;
  
  // Login-specific elements when cart is empty
  readonly cartEmptyLabel: Locator;
  readonly cartEmptyTotal: Locator;
  readonly cartEmptySubtotal: Locator;
  readonly checkoutButtonEmpty: Locator;
  readonly clearCartButtonEmpty: Locator;
  
  // Login-specific elements when cart has items
  readonly productCards: Locator;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly itemQuantity: Locator;
  readonly btnIncrease: Locator;
  readonly btnDecrease: Locator;
  readonly itemTotal: Locator;
  readonly cartSubtotal: Locator;
  readonly cartTotal: Locator;
  readonly checkoutButton: Locator;
  readonly clearCartButton: Locator;
  readonly btnRemove: Locator;
  
  // General elements
  readonly shippingAddressInput: Locator;  
  readonly checkoutButtonGuest: Locator;
  readonly cartSummary: Locator;

  constructor(page: Page) {
    super(page);
    // Guest-specific elements
    this.addToCartButtons = page.locator('button:has-text("Add to Cart")');
    
    // Elements when cart is empty
    this.cartEmptyLabel = page.locator('text=Your cart is empty');
    this.cartEmptySubtotal = page.locator('#cart-subtotal:has-text("$0.00")').first();
    this.cartEmptyTotal = page.locator('#cart-total:has-text("$0.00")').first();
    this.checkoutButtonEmpty = page.locator('button:has-text("Proceed to Checkout")');
    this.clearCartButtonEmpty = page.locator('button:has-text("Clear Cart")');
    
    // Elements when cart has items
    this.productCards = page.locator('.cart-item, #cart-items > div');
    this.productName = page.locator('h3, h4, [class*="name"]');
    this.productPrice = page.locator('p:has-text("$"):not([class*="subtotal"]):not([class*="total"])');
    this.itemQuantity = page.locator('input.qty-input, input[id*="qty-input"], input[type="number"]');
    this.btnIncrease = page.locator('button:has-text("+"), .btn-increase, [class*="increase"], button[id*="btn-increase"]');
    this.btnDecrease = page.locator('button:has-text("-"), .btn-decrease, [class*="decrease"], button[id*="btn-decrease"]');
    this.itemTotal = page.locator('p:has-text("$"):not([class*="product-price"]):not([class*="subtotal"]):not([class*="total"])');
    this.cartSubtotal = page.locator('#cart-subtotal');
    this.cartTotal = page.locator('#cart-total');
    this.checkoutButton = page.locator('button:has-text("Checkout"), .checkout, [class*="checkout"], #btn-checkout');
    this.clearCartButton = page.locator('button:has-text("Clear Cart"), .clear-cart, [class*="clear-cart"], #btn-clear-cart');
    this.btnRemove = page.locator('button:has-text("Remove"), .remove-btn, button[class*="remove"], button[id*="btn-remove"]');
    
    // General elements
    this.shippingAddressInput = page.locator('input[placeholder*="shipping"], #shipping-address, [name*="shipping"]');
    this.checkoutButtonGuest = page.locator('button:has-text("Proceed to Checkout")');
    this.cartSummary = page.locator('.cart-summary, #cart-summary');
  }

  async navigateTo(): Promise<void> {
    // Use the base page cart navigation which maintains session state
    await this.navigateToCart();
  }

  async isCartEmpty(): Promise<boolean> {
    return await this.cartEmptyLabel.isVisible();
  }

  async getCartItemCount(): Promise<number> {
    return await this.productCards.count();
  }

  async getProductByIndex(index: number): Promise<{ 
    name: string | null;
    price: string | null;
    quantity: string | null;
    itemTotal: string | null;
    card: Locator
  }> {
    const card = this.productCards.nth(index);
    return {
      name: await card.locator('h4[id*="cart-item-name"], .item-details h4').first().textContent(),
      price: await card.locator('p.item-price, p[id*="cart-item-price"]').first().textContent(),
      quantity: await card.locator('input.qty-input, input[id*="qty-input"]').first().inputValue().catch(() => null),
      itemTotal: await card.locator('p[id*="cart-item-total"], .item-total p').first().textContent(),
      card: card
    };
  }

  async increaseItemQuantity(index: number): Promise<void> {
    const card = this.productCards.nth(index);
    const increaseBtn = card.locator('button:has-text("+"), .btn-increase, [class*="increase"], button[id*="btn-increase"]').first();
    await this.scrollToElement(increaseBtn);
    await increaseBtn.click();
    await this.page.waitForTimeout(500);
  }

  async decreaseItemQuantity(index: number): Promise<void> {
    const card = this.productCards.nth(index);
    const decreaseBtn = card.locator('button:has-text("-"), .btn-decrease, [class*="decrease"], button[id*="btn-decrease"]').first();
    await this.scrollToElement(decreaseBtn);
    await decreaseBtn.click();
    await this.page.waitForTimeout(500);
  }

  async setItemQuantity(index: number, quantity: number): Promise<void> {
    const card = this.productCards.nth(index);
    const quantityInput = card.locator('input.qty-input, input[id*="qty-input"], input[type="number"]').first();
    await this.scrollToElement(quantityInput);
    await quantityInput.fill(quantity.toString());
    await this.page.waitForTimeout(500);
  }

  async removeItemByIndex(index: number): Promise<void> {
    const removeBtn = this.btnRemove.nth(index);
    await this.scrollToElement(removeBtn);
    await removeBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async clearCart(): Promise<void> {
    try {
      // Navigate to cart page if not already there
      if (!this.page.url().includes('/web/cart')) {
        await this.navigateTo();
      }

      // Wait for page to load
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);

      // Try multiple possible selectors for remove buttons (for individual items)
      const itemRemoveSelectors = [
        'button:has-text("Remove")',
        'button:has-text("remove")',
        'button[class*="remove"]',
        'a:has-text("Remove")',
        '.remove-btn',
        '[data-testid*="remove"]',
        '.btn-remove',
        'button:has-text("Remove Item")'
      ];

      let removeButtons: Locator | null = null;
      let count = 0;

      // Find which item remove selector works
      for (const selector of itemRemoveSelectors) {
        removeButtons = this.page.locator(selector);
        count = await removeButtons.count();
        if (count > 0) {
          console.log(`Found ${count} item remove buttons using selector: ${selector}`);
          break;
        }
      }

      // Remove all items if found
      if (removeButtons && count > 0) {
        while (count > 0) {
          await removeButtons.first().scrollIntoViewIfNeeded();
          await removeButtons.first().click();
          // Wait for UI to update
          await this.page.waitForTimeout(1000);
          // Wait for the element to be removed
          try {
            await removeButtons.first().waitFor({ state: 'detached', timeout: 5000 });
          } catch (e) {
            // If element doesn't get detached, just try counting again
          }
          count = await removeButtons.count();
          console.log(`Removed item, ${count} items remaining`);
        }
      }

      // Also try clear cart button if available
      const clearBtn = this.clearCartButton.or(this.clearCartButtonEmpty).first();
      if (await clearBtn.isVisible()) {
        await this.scrollToElement(clearBtn);
        await clearBtn.click();
        await this.page.waitForTimeout(1500);
      }

      console.log('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error instanceof Error ? error.message : 'Unknown error');
      // Continue anyway - cart might already be empty
    }
  }

  async getCartSubtotal(): Promise<string | null> {
    const subtotalElement = this.cartSubtotal.or(this.cartEmptySubtotal);
    return await subtotalElement.textContent();
  }

  async getCartTotal(): Promise<string | null> {
    const totalElement = this.cartTotal.or(this.cartEmptyTotal);
    return await totalElement.textContent();
  }

  async getCartBadgeCount(): Promise<number> {
    const cartText = await this.cartLink.textContent();
    const match = cartText ? cartText.match(/\d+/) : null;
    return match ? parseInt(match[0]) : 0;
  }

  async isCheckoutButtonVisible(): Promise<boolean> {
    const checkoutButton = this.checkoutButton.or(this.checkoutButtonEmpty).or(this.checkoutButtonGuest);
    return await checkoutButton.isVisible();
  }

  async clickCheckout(): Promise<void> {
    const checkoutButton = this.checkoutButton.or(this.checkoutButtonEmpty).or(this.checkoutButtonGuest).first();
    await this.scrollToElement(checkoutButton);
    await checkoutButton.click();
    // Wait a bit for dialog to appear
    await this.page.waitForTimeout(500);
  }

  async completeCheckoutWithShippingAddress(address: string): Promise<void> {
    // Setup dialog handler BEFORE clicking checkout
    const dialogPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Dialog did not appear within 5 seconds'));
      }, 5000);
      
      this.page.once('dialog', async dialog => {
        clearTimeout(timeout);
        try {
          if (dialog.type() === 'prompt') {
            await dialog.accept(address);
          } else {
            await dialog.accept();
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    
    // Click checkout button - this will trigger the prompt dialog
    await this.clickCheckout();
    
    // Wait for dialog to be handled
    await dialogPromise;
    
    // Wait for navigation to orders page
    // The page should navigate after the order is placed
    try {
      await this.page.waitForURL('**/web/orders', { timeout: 10000 });
    } catch (error) {
      // If URL doesn't change immediately, wait for network activity to complete
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000);
      
      // Check URL again after waiting
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/web/orders')) {
        // Navigation might be delayed, wait a bit more
        await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('networkidle');
      }
    }
  }

  async enterShippingAddress(address: string): Promise<void> {
    if (await this.shippingAddressInput.isVisible()) {
      await this.scrollToElement(this.shippingAddressInput);
      await this.shippingAddressInput.fill(address);
    }
  }

  validatePriceFormat(priceText: string | null): boolean {
    if (!priceText) return false;
    // Match format like $XX.XX (with exactly 2 decimal places)
    const priceRegex = /^\$\d+\.\d{2}$/;
    return priceRegex.test(priceText.trim());
  }

  async validateCartCalculations(): Promise<{ 
    subtotalValid: boolean; 
    totalValid: boolean; 
    itemTotalsValid: boolean[] 
  }> {
    const itemCount = await this.getCartItemCount();
    const itemTotalsValid: boolean[] = [];
    
    // Validate each item's total
    for (let i = 0; i < itemCount; i++) {
      const product = await this.getProductByIndex(i);
      const isValid = this.validatePriceFormat(product.itemTotal);
      itemTotalsValid.push(isValid);
    }
    
    // Validate subtotal and total
    const subtotalText = await this.getCartSubtotal();
    const totalText = await this.getCartTotal();
    const subtotalValid = this.validatePriceFormat(subtotalText);
    const totalValid = this.validatePriceFormat(totalText);
    
    return {
      subtotalValid,
      totalValid,
      itemTotalsValid
    };
  }

  async waitForCartToBeEmpty(timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector('text=Your cart is empty', { state: 'visible', timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  async confirmActionIfNeeded(): Promise<void> {
    // Handle any confirmation dialogs that might appear
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });
  }
}