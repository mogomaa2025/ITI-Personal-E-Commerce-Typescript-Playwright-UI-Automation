import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly checkoutHeading: Locator;
  readonly billingForm: Locator;
  readonly shippingForm: Locator;
  readonly paymentForm: Locator;
  readonly orderSummary: Locator;
  readonly orderTotal: Locator;
  readonly placeOrderButton: Locator;
  readonly backToCartButton: Locator;
  readonly shippingAddressInput: Locator;
  readonly submitButton: Locator;

/**
 * Constructor for initializing page elements for checkout functionality
 * @param page - Playwright Page object representing the browser page
 */
  constructor(page: Page) {
    super(page);
    // Initialize checkout heading locator - looks for h1 or h2 with "Checkout" text
    this.checkoutHeading = page.locator('h1').filter({ hasText: 'Checkout' }).or(page.locator('h2').filter({ hasText: 'Checkout' })).first();
    // Initialize billing form locator - looks for element with class 'billing-form' or form with id containing 'billing'
    this.billingForm = page.locator('.billing-form, form[id*="billing"]').first();
    // Initialize shipping form locator - looks for element with class 'shipping-form' or form with id containing 'shipping'
    this.shippingForm = page.locator('.shipping-form, form[id*="shipping"]').first();
    // Initialize payment form locator - looks for element with class 'payment-form' or form with id containing 'payment'
    this.paymentForm = page.locator('.payment-form, form[id*="payment"]').first();
    // Initialize order summary locator - looks for element with class 'order-summary' or element with id containing 'order-summary'
    this.orderSummary = page.locator('.order-summary, [id*="order-summary"]').first();
    // Initialize order total locator - looks for element with class 'order-total', id containing 'order-total', or paragraph with "Total" text
    this.orderTotal = page.locator('.order-total, [id*="order-total"]').or(page.locator('p').filter({ hasText: 'Total' })).first();
    // Initialize place order button locator - looks for button with class 'place-order', id containing 'place-order', or button with "Place Order" text
    this.placeOrderButton = page.locator('button.place-order, button[id*="place-order"]').or(page.locator('button').filter({ hasText: 'Place Order' })).first();
    // Initialize back to cart button locator - looks for button with class 'back-to-cart', id containing 'back-to-cart', or link with "Back to Cart" text
    this.backToCartButton = page.locator('button.back-to-cart, button[id*="back-to-cart"]').or(page.locator('a').filter({ hasText: 'Back to Cart' })).first();
    // Initialize shipping address input - looks for input with placeholder containing "address" or id/name containing "shipping" or "address"
    this.shippingAddressInput = page.locator('input[placeholder*="address" i], input[placeholder*="shipping" i], input[id*="shipping"], input[id*="address"], input[name*="shipping"], input[name*="address"]').first();
    // Initialize submit button - looks for button with type submit or button with text "Submit", "Place Order", "Complete Order"
    this.submitButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: 'Submit' })).or(page.locator('button').filter({ hasText: 'Place Order' })).or(page.locator('button').filter({ hasText: 'Complete Order' })).first();
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/web/checkout');
    await this.page.waitForLoadState('networkidle');
  }

  async isCheckoutPageLoaded(): Promise<boolean> {
    return await this.checkoutHeading.isVisible();
  }

  async isBillingFormVisible(): Promise<boolean> {
    return await this.billingForm.isVisible();
  }

  async isShippingFormVisible(): Promise<boolean> {
    return await this.shippingForm.isVisible();
  }

  async isPaymentFormVisible(): Promise<boolean> {
    return await this.paymentForm.isVisible();
  }

  async isOrderSummaryVisible(): Promise<boolean> {
    return await this.orderSummary.isVisible();
  }

  async getOrderTotal(): Promise<string | null> {
    return await this.orderTotal.textContent();
  }

  async isPlaceOrderButtonVisible(): Promise<boolean> {
    return await this.placeOrderButton.isVisible();
  }

  async clickPlaceOrder(): Promise<void> {
    await this.placeOrderButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickBackToCart(): Promise<void> {
    await this.backToCartButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async enterShippingAddress(address: string): Promise<void> {
    if (await this.shippingAddressInput.isVisible()) {
      await this.shippingAddressInput.scrollIntoViewIfNeeded();
      await this.shippingAddressInput.fill(address);
      await this.page.waitForLoadState('networkidle');
    }
  }

  async submitCheckout(): Promise<void> {
    const submitBtn = this.submitButton.or(this.placeOrderButton).first();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async completeCheckoutWithShippingAddress(address: string): Promise<void> {
    await this.enterShippingAddress(address);
    await this.submitCheckout();
  }
}