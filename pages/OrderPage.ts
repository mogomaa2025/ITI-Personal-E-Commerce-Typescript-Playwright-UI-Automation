import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ApiWaiting } from '../utils/ApiWaiting';
import locatorsData from '../data/locators.json';

/**
 * Represents an order with its details
 */
export interface OrderDetails {
  orderId: string | null;
  status: string | null;
  total: string | null;
  date: string | null;
  itemsCount: string | null;
  productNames: string[];
  card: Locator;
}

/**
 * OrderPage class provides methods to interact with the Orders page
 * Following Page Object Model pattern with proper Playwright waiting mechanisms
 */
export class OrderPage extends BasePage {
  readonly pageHeading: Locator;
  readonly allTab: Locator;
  readonly pendingTab: Locator;
  readonly processingTab: Locator;
  readonly shippedTab: Locator;
  readonly deliveredTab: Locator;
  readonly orderCards: Locator;
  readonly noOrdersMessage: Locator;
  readonly cancelOrderButton: Locator;
  readonly orderCancelledAlert: Locator;
  readonly loginMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('h1:has-text("My Orders")');
    this.allTab = page.locator('button:has-text("All")');
    this.pendingTab = page.locator('button:has-text("Pending")');
    this.processingTab = page.locator('button:has-text("Processing")');
    this.shippedTab = page.locator('button:has-text("Shipped")');
    this.deliveredTab = page.locator('button:has-text("Delivered")');
    // Order cards: Get direct children of the orders container that contain an h3 with "Order #"
    this.orderCards = page.locator('main > div > div:last-child > div:has(h3:has-text("Order #"))');
    this.noOrdersMessage = page.locator('text=No orders found');
    this.cancelOrderButton = page.locator('button:has-text("Cancel Order")');
    this.orderCancelledAlert = page.locator('.alert:has-text("Order cancelled"), .alert:has-text("Order canceled")');
    this.loginMessage = page.locator('text=Please login to continue');
  }

  /**
   * Navigates to the orders page and waits for it to load
   */
  async navigateTo(): Promise<void> {
    await this.page.goto('/web/orders', { waitUntil: 'networkidle' });
    await this.pageHeading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
      // If heading not visible, might be login message for guest users
    });
  }

  /**
   * Clicks the All tab and waits for orders to load
   */
  async clickAllTab(): Promise<void> {
    await this.allTab.waitFor({ state: 'visible' });
    await this.allTab.click();
    await this.waitForOrdersToLoad();
  }

  /**
   * Clicks the Pending tab and waits for orders to load
   */

  async clickPendingTab(): Promise<void> {
    await this.pendingTab.waitFor({ state: 'visible' });
    await this.pendingTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clicks the Processing tab and waits for orders to load
   */
  async clickProcessingTab(): Promise<void> {
    await this.processingTab.waitFor({ state: 'visible' });
    await this.processingTab.click();
    await this.waitForOrdersToLoad();
  }

  /**
   * Clicks the Shipped tab and waits for orders to load
   */
  async clickShippedTab(): Promise<void> {
    await this.shippedTab.waitFor({ state: 'visible' });
    await this.shippedTab.click();
    await this.waitForOrdersToLoad();
  }

  /**
   * Clicks the Delivered tab and waits for orders to load
   */
  async clickDeliveredTab(): Promise<void> {
    await this.deliveredTab.waitFor({ state: 'visible' });
    await this.deliveredTab.click();
    await this.waitForOrdersToLoad();
  }

  /**
   * Waits for orders to load in the current tab
   * Uses proper Playwright waiting mechanisms instead of timeouts
   */
  private async waitForOrdersToLoad(): Promise<void> {
    // Wait for either orders to appear or "No orders found" message
    await Promise.race([
      this.orderCards.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => { }),
      this.noOrdersMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { })
    ]);
    // Wait for network to be idle to ensure all data is loaded
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
  }

  /**
   * Gets the count of orders in the current tab
   * @returns The number of visible orders
   */
  async getOrderCount(): Promise<number> {
    // Wait for orders container to be ready
    await this.page.waitForSelector('main > div > div:last-child', { state: 'attached' });

    // Check if "No orders found" message is visible first
    const noOrdersVisible = await this.isNoOrdersMessageVisible();
    if (noOrdersVisible) {
      return 0;
    }

    // Count only visible pending orders (those with "Cancel Order" button)
    // This is the correct way to count pending orders since cancelled orders don't have this button
    const pendingOrders = this.page.locator('main > div > div:last-child > div:has(button:has-text("Cancel Order"))');
    const count = await pendingOrders.count();

    // Return the count of orders with cancel buttons
    // If 0, it means no pending orders (they might be cancelled or in other status)
    return count;
  }

  /**
   * Gets order details by index
   * @param index - The index of the order (0-based)
   * @returns OrderDetails object with order information
   */
  async getOrderByIndex(index: number): Promise<OrderDetails> {
    const card = this.orderCards.nth(index);

    // Wait for the card to be visible
    await card.waitFor({ state: 'visible', timeout: 10000 });

    // Get order ID from h3 heading
    const orderHeading = card.locator('h3').first();
    const orderIdText = await orderHeading.textContent().catch(() => null);
    const orderId = orderIdText ? orderIdText.trim() : null;

    // Get status - look for text that contains status keywords
    const statusElement = card.locator('div, span').filter({ hasText: /pending|processing|shipped|delivered|cancelled/i }).first();
    const statusText = await statusElement.textContent().catch(() => null);
    const status = statusText ? statusText.trim().toLowerCase() : null;

    // Get total - look for paragraph with "Total:" and extract the amount
    let total: string | null = null;
    const totalParagraph = card.locator('p').filter({ hasText: /Total:/i }).first();
    const totalText = await totalParagraph.textContent().catch(() => null);
    if (totalText) {
      const totalMatch = totalText.match(/Total:?\s*\$(\d+\.\d{2})/i);
      if (totalMatch) {
        total = `$${totalMatch[1]}`;
      }
    }

    // Get date - look for paragraph with "Date:"
    let date: string | null = null;
    const dateParagraph = card.locator('p').filter({ hasText: /Date:/i }).first();
    const dateText = await dateParagraph.textContent().catch(() => null);
    if (dateText) {
      date = dateText.replace(/Date:\s*/i, '').trim();
    }

    // Get items count - look for paragraph with "Items:"
    let itemsCount: string | null = null;
    const itemsParagraph = card.locator('p').filter({ hasText: /Items:/i }).first();
    const itemsText = await itemsParagraph.textContent().catch(() => null);
    if (itemsText) {
      const itemsMatch = itemsText.match(/Items:\s*(\d+)/i);
      if (itemsMatch) {
        itemsCount = itemsMatch[1];
      }
    }

    // Get product names - extract from card text
    const productNames: string[] = [];
    const cardText = await card.textContent().catch(() => '');
    if (cardText) {
      const lines = cardText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      for (const line of lines) {
        if (line.length > 2 &&
          !line.match(/Order #|pending|processing|shipped|delivered|cancelled|Date:|Total:|Items:|Qty:|\$|Cancel Order/i) &&
          !line.match(/^\d+$/) &&
          !productNames.includes(line)) {
          productNames.push(line);
        }
      }
    }

    return {
      orderId,
      status,
      total,
      date,
      itemsCount,
      productNames,
      card
    };
  }

  /**
   * Gets all order statuses in the current tab
   * @returns Array of order status strings
   */
  async getAllOrderStatuses(): Promise<string[]> {
    const statuses: string[] = [];
    const count = await this.getOrderCount();
    for (let i = 0; i < count; i++) {
      const order = await this.getOrderByIndex(i);
      if (order.status) {
        statuses.push(order.status.trim());
      }
    }
    return statuses;
  }

  /**
   * Clicks the Cancel Order button for a specific order
   * @param index - The index of the order to cancel (default: 0)
   */
  async clickCancelOrder(index: number = 0): Promise<void> {
    const cancelButtons = this.cancelOrderButton;
    await cancelButtons.first().waitFor({ state: 'visible', timeout: 10000 });

    const count = await cancelButtons.count();
    if (count > index) {
      await this.page.waitForLoadState('networkidle', { timeout: 4000 });
      const button = cancelButtons.nth(index);
      await button.scrollIntoViewIfNeeded();
      await button.waitFor({ state: 'visible' });
      await button.click();
    } else {
      throw new Error(`Cancel order button at index ${index} not found. Only ${count} buttons available.`);
    }
  }

  /**
   * Handles the cancel order confirmation dialog
   * @param confirm - Whether to accept (true) or dismiss (false) the dialog
   */
  async handleCancelConfirmation(confirm: boolean = true): Promise<void> {
    this.page.once('dialog', async dialog => {
      if (confirm) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Clicks cancel order button and handles the dialog
   * This method performs all dialog handling internally
   * @param orderIndex - Index of the order to cancel (default: 0)
   * @param acceptDialog - Whether to accept (true) or dismiss (false) the dialog (default: false)
   * @returns True if dialog was handled, false otherwise
   */
  async clickCancelOrderWithDialog(
    orderIndex: number = 0,
    acceptDialog: boolean = false
  ): Promise<boolean> {
    let dialogHandled = false;

    // Setup dialog handler BEFORE clicking
    const dialogPromise = new Promise<void>((resolve) => {
      this.page.once('dialog', async dialog => {
        dialogHandled = true;
        if (acceptDialog) {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
        resolve();
      });
    });

    // Click Cancel Order
    await this.clickCancelOrder(orderIndex);

    // Wait for dialog to be handled
    await dialogPromise;

    return dialogHandled;
  }

  /**
   * Clicks cancel order and validates that the dialog was handled
   * This method performs all validations using Playwright's expect
   * @param orderIndex - Index of the order to cancel (default: 0)
   * @param acceptDialog - Whether to accept (true) or dismiss (false) the dialog (default: false)
   */
  async clickCancelOrderAndValidateDialog(
    orderIndex: number = 0,
    acceptDialog: boolean = false
  ): Promise<void> {
    const dialogHandled = await this.clickCancelOrderWithDialog(orderIndex, acceptDialog);
    expect(dialogHandled).toBeTruthy();
  }

  /**
   * Clicks cancel order, dismisses dialog, and validates order remains in pending status
   * This method performs all validations using Playwright's expect
   * @param orderIndex - Index of the order to cancel (default: 0)
   */
  async clickCancelOrderDismissAndValidateOrderRemains(
    orderIndex: number = 0
  ): Promise<void> {
    // Get initial order count
    const initialOrderCount = await this.getOrderCount();

    // Click cancel order and dismiss dialog
    await this.clickCancelOrderWithDialog(orderIndex, false);

    // Wait for UI to update
    await this.page.waitForLoadState('networkidle');

    // Validate order count remains the same
    const finalOrderCount = await this.getOrderCount();
    expect(finalOrderCount).toBe(initialOrderCount);

    // Validate order status is still pending
    if (finalOrderCount > 0) {
      const order = await this.getOrderByIndex(0);
      expect(order.status?.toLowerCase()).toContain('pending');
    }
  }

  /**
   * Checks if the "No orders found" message is visible
   * @returns True if the message is visible, false otherwise
   */
  async isNoOrdersMessageVisible(): Promise<boolean> {
    try {
      await this.noOrdersMessage.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Waits for the order cancelled alert to appear
   * @param timeout - Maximum time to wait in milliseconds (default: 5000)
   * @returns True if alert appears, false otherwise
   */
  async waitForOrderCancelledAlert(timeout: number = 5000): Promise<boolean> {
    try {
      await this.orderCancelledAlert.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Waits for cancel order button to disappear (order removed from pending)
   * @param timeout - Maximum time to wait in milliseconds (default: 5000)
   */
  async waitForCancelButtonToDisappear(timeout: number = 5000): Promise<void> {
    try {
      await this.cancelOrderButton.first().waitFor({ state: 'hidden', timeout });
    } catch {
      // If button doesn't disappear, continue anyway
    }
  }

  /**
   * Waits for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }


  async cancelMultipleOrders(count: number) {
    for (let i = 0; i < count; i++) {
      try {
        await this.page.getByRole('button', { name: 'Cancel Order' }).first().click();
        await this.page.getByRole('button', { name: '×' }).click();


        // Optional: wait for page to update only if needed
        await this.page.waitForLoadState('networkidle');
        await this.page.locator('.alert.alert-success').waitFor({ state: 'visible', timeout: 500 }).catch(() => { });

      } catch (error) {
        console.error(`Failed to cancel order ${i + 1}:`, error);
        break;
      }
    }
  }
  async cancelMultipleOrdersNoCount() {
    while (this.page.getByRole('button', { name: '×' }).isHidden()) {
      try {
        await this.page.getByRole('button', { name: 'Cancel Order' }).waitFor({ state: 'visible', timeout: 500 }).catch(() => { });
        //  await this.page.getByRole('button', { name: 'Cancel Order' }).first().click();

        // Set up dialog handler to accept (click OK)
        this.page.once('dialog', dialog => {
          console.log(`Dialog message: ${dialog.message()}`);
          dialog.accept().catch(() => { });
        });


        const cancelButtons = await this.page.getByRole('button', { name: 'Cancel Order' }).all();
        await cancelButtons[0].click(); // first button




        await this.page.waitForLoadState('networkidle');
        await this.page.locator('.alert.alert-success').waitFor({ state: 'visible', timeout: 500 }).catch(() => { });
        //  await this.page.getByRole('button', { name: '×' }).click();
        await this.page.getByRole('button', { name: '×' }).first().click();



      } catch (error) {
        console.error(`Failed to cancel AN order`, error);
        break;
      }
    }
  }


  async cancelAllPendingOrdersApi(maxIterations: number = 20): Promise<void> {
    let orderCount = await this.getOrderCount();
    let iterations = 0;

    while (orderCount > 0 && iterations < maxIterations) {
      iterations++;

      await this.clickCancelOrderWithDialog(0, true);
      await this.waitForOrderCancelledAlert(5000);
      await this.waitForPageLoad(); // Let page settle

      // The DOM is likely changing, so getting a fresh count is important.
      orderCount = await this.getOrderCount();
    }
  }

  /**
   * Cancels all pending orders until none remain
   * This method handles the entire cancellation loop
   * @param maxIterations - Maximum number of iterations to prevent infinite loops (default: 20)
   */
  async cancelAllPendingOrders(maxIterations: number = 20): Promise<void> {
    let orderCount = await this.getOrderCount();
    let iterations = 0;

    while (orderCount > 0 && iterations < maxIterations) {
      iterations++;

      // Click cancel order and accept dialog
      await this.clickCancelOrderWithDialog(0, true);

      // Wait for cancellation alert
      await this.waitForOrderCancelledAlert(5000);


      // Wait for page to update after cancellation
      await this.waitForPageLoad();

      // Wait for orders to load after tab click
      await this.waitForPageLoad();

      // Get updated order count
      orderCount = await this.getOrderCount();
    }
  }

  /**
   * Gets all available tab names
   * @returns Array of tab names that are visible
   */
  async getAllTabs(): Promise<string[]> {
    const tabs: string[] = [];

    // Wait for tabs to be visible
    await this.allTab.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });

    if (await this.allTab.isVisible()) tabs.push('All');
    if (await this.pendingTab.isVisible()) tabs.push('Pending');
    if (await this.processingTab.isVisible()) tabs.push('Processing');
    if (await this.shippedTab.isVisible()) tabs.push('Shipped');
    if (await this.deliveredTab.isVisible()) tabs.push('Delivered');

    return tabs;
  }

  /**
   * Checks if the login message is visible (for guest users)
   * @returns True if login message is visible, false otherwise
   */
  async isLoginMessageVisible(): Promise<boolean> {
    try {
      await this.loginMessage.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Waits for an order with a specific total to appear
   * @param expectedTotal - The expected order total (e.g., "$99.99")
   * @param timeout - Maximum time to wait in milliseconds
   * @returns The order details if found, null otherwise
   */
  async waitForOrderWithTotal(expectedTotal: string, timeout: number = 10000): Promise<OrderDetails | null> {
    const startTime = Date.now();
    const expectedTotalNum = parseFloat(expectedTotal.replace('$', '').trim());

    while (Date.now() - startTime < timeout) {
      const count = await this.getOrderCount();
      for (let i = 0; i < count; i++) {
        try {
          const order = await this.getOrderByIndex(i);
          if (order.total) {
            const orderTotalNum = parseFloat(order.total.replace('$', '').trim());
            if (Math.abs(orderTotalNum - expectedTotalNum) < 0.01) {
              return order;
            }
          }
        } catch {
          // Continue searching
        }
      }
      // Wait a bit before checking again using proper wait mechanism
      await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => { });
    }

    return null;
  }

  /**
   * Validates that an order exists with a total matching the expected cart price
   * This method performs all validations using Playwright's expect
   * @param expectedCartPrice - The expected cart price (e.g., "$99.99")
   * @param timeout - Maximum time to wait in milliseconds
   * @returns The validated order details
   */
  async validateOrderTotalMatchesCartPrice(
    expectedCartPrice: string,
    timeout: number = 10000
  ): Promise<OrderDetails> {
    const cartPriceNum = parseFloat(expectedCartPrice.replace('$', '').trim());

    // Wait for orders to load
    await this.page.waitForSelector('h3:has-text("Order #")', { timeout: 10000 }).catch(() => { });

    // Get order count and validate
    const orderCount = await this.getOrderCount();
    expect(orderCount).toBeGreaterThan(0);

    // Find order with matching total
    const order = await this.waitForOrderWithTotal(expectedCartPrice, timeout);

    // Validate order exists
    expect(order).not.toBeNull();

    if (!order) {
      throw new Error('Order validation failed: order is null');
    }

    // Validate order has total
    expect(order.total).not.toBeNull();

    if (!order.total) {
      throw new Error('Order validation failed: order total is null');
    }

    // Validate price matches
    const orderPriceNum = parseFloat(order.total.replace('$', '').trim());
    expect(orderPriceNum).toBeCloseTo(cartPriceNum, 2);

    return order;
  }

  /**
   * Validates order details in pending tab including total, status, date, items count, and product name
   * This method performs all validations using Playwright's expect
   * @param expectedCartPrice - The expected cart price (e.g., "$99.99")
   * @param expectedItemsCount - Expected number of items (default: 1)
   * @param expectedProductName - Optional product name to verify
   * @param timeout - Maximum time to wait in milliseconds
   * @returns The validated order details
   */
  async validatePendingOrderDetails(
    expectedCartPrice: string,
    expectedItemsCount: number = 1,
    expectedProductName?: string,
    timeout: number = 10000
  ): Promise<OrderDetails> {
    // Wait for orders to appear
    await this.page.waitForSelector('h3:has-text("Order #")', { timeout: 10000 });

    // Get order count and validate
    const orderCount = await this.getOrderCount();
    expect(orderCount).toBeGreaterThan(0);

    // Find order with matching total
    let order = await this.waitForOrderWithTotal(expectedCartPrice, timeout);

    // Fallback: get first order if no match found
    if (!order && orderCount > 0) {
      order = await this.getOrderByIndex(0);
    }

    // Validate order exists
    expect(order).not.toBeNull();

    if (!order) {
      throw new Error('Order validation failed: order is null');
    }

    // Validate status is pending
    expect(order.status).not.toBeNull();
    expect(order.status?.toLowerCase()).toContain('pending');

    // Validate date exists
    expect(order.date).not.toBeNull();
    expect(order.date?.length).toBeGreaterThan(0);

    // Validate total matches
    expect(order.total).not.toBeNull();
    if (order.total) {
      const cartPriceNum = parseFloat(expectedCartPrice.replace('$', '').trim());
      const orderPriceNum = parseFloat(order.total.replace('$', '').trim());
      expect(orderPriceNum).toBeCloseTo(cartPriceNum, 2);
    }

    // Validate items count matches
    expect(order.itemsCount).not.toBeNull();
    if (order.itemsCount) {
      const itemsCountNum = parseInt(order.itemsCount);
      expect(itemsCountNum).toBe(expectedItemsCount);
    }

    // Validate product name if provided
    if (expectedProductName) {
      expect(order.productNames.length).toBeGreaterThan(0);
      const hasProductName = order.productNames.some(name =>
        name.toLowerCase().includes(expectedProductName.toLowerCase())
      );
      expect(hasProductName).toBeTruthy();
    }

    return order;
  }

  /**
   * Validates that orders in the pending tab have pending status
   * This method performs all validations using Playwright's expect
   * @param orderIndex - Index of the order to validate (default: 0)
   * @returns The validated order details
   */
  async validatePendingOrderStatus(orderIndex: number = 0): Promise<OrderDetails> {
    // Get order count and validate
    const orderCount = await this.getOrderCount();
    expect(orderCount).toBeGreaterThan(0);

    // Get the order at specified index
    const order = await this.getOrderByIndex(orderIndex);

    // Validate order exists
    expect(order).not.toBeNull();

    if (!order) {
      throw new Error(`Order validation failed: order at index ${orderIndex} is null`);
    }

    // Validate order status is pending
    expect(order.status).not.toBeNull();
    expect(order.status?.toLowerCase()).toContain('pending');

    return order;
  }
}
