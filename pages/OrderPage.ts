import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

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

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('h1:has-text("My Orders")');
    this.allTab = page.locator('button:has-text("All")');
    this.pendingTab = page.locator('button:has-text("Pending")');
    this.processingTab = page.locator('button:has-text("Processing")');
    this.shippedTab = page.locator('button:has-text("Shipped")');
    this.deliveredTab = page.locator('button:has-text("Delivered")');
    // Order cards: Get direct children of the orders container that contain an h3 with "Order #"
    // Structure: main > div > div (orders container) > div (order card)
    // Use a specific selector to get only top-level order cards
    this.orderCards = page.locator('main > div > div:last-child > div:has(h3:has-text("Order #"))');
    this.noOrdersMessage = page.locator('text=No orders found');
    this.cancelOrderButton = page.locator('button:has-text("Cancel Order")');
    this.orderCancelledAlert = page.locator('.alert:has-text("Order cancelled"), .alert:has-text("Order canceled")');
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/web/orders');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAllTab(): Promise<void> {
    await this.allTab.click();
    await this.page.waitForTimeout(1000);
  }

  async clickPendingTab(): Promise<void> {
    await this.pendingTab.click();
    await this.page.waitForTimeout(1000);
  }

  async clickProcessingTab(): Promise<void> {
    await this.processingTab.click();
    await this.page.waitForTimeout(1000);
  }

  async clickShippedTab(): Promise<void> {
    await this.shippedTab.click();
    await this.page.waitForTimeout(1000);
  }

  async clickDeliveredTab(): Promise<void> {
    await this.deliveredTab.click();
    await this.page.waitForTimeout(1000);
  }

  async getOrderCount(): Promise<number> {
    await this.page.waitForTimeout(500);
    // Count only visible pending orders (those with "Cancel Order" button)
    const pendingOrders = this.page.locator('main > div > div:last-child > div:has(button:has-text("Cancel Order"))');
    return await pendingOrders.count();
  }

  async getOrderByIndex(index: number): Promise<{
    orderId: string | null;
    status: string | null;
    total: string | null;
    date: string | null;
    itemsCount: string | null;
    productNames: string[];
    card: Locator;
  }> {
    const card = this.orderCards.nth(index);
    const productNames: string[] = [];
    
    // Wait for the card to be visible
    await card.waitFor({ state: 'visible', timeout: 5000 });
    
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
    
    // Get date - look for paragraph with "Date:" (optional, don't wait)
    let date: string | null = null;
    const dateParagraph = card.locator('p').filter({ hasText: /Date:/i }).first();
    const dateText = await dateParagraph.textContent().catch(() => null);
    if (dateText) {
      date = dateText.replace(/Date:\s*/i, '').trim();
    }
    
    // Get items count - look for paragraph with "Items:" (optional, don't wait)
    let itemsCount: string | null = null;
    const itemsParagraph = card.locator('p').filter({ hasText: /Items:/i }).first();
    const itemsText = await itemsParagraph.textContent().catch(() => null);
    if (itemsText) {
      const itemsMatch = itemsText.match(/Items:\s*(\d+)/i);
      if (itemsMatch) {
        itemsCount = itemsMatch[1];
      }
    }
    
    // Get product names - simple approach: look for divs with product names
    const cardText = await card.textContent().catch(() => '');
    if (cardText) {
      // Extract product names (they appear before "Qty:" in the structure)
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
      orderId: orderId,
      status: status,
      total: total,
      date: date,
      itemsCount: itemsCount,
      productNames: productNames,
      card: card
    };
  }

  async getAllOrderStatuses(): Promise<string[]> {
    const statuses: string[] = [];
    const count = await this.getOrderCount();
    for (let i = 0; i < count; i++) {
      const order = await this.getOrderByIndex(i);
      if (order.status) statuses.push(order.status.trim());
    }
    return statuses;
  }

  async clickCancelOrder(index: number = 0): Promise<void> {
    const cancelButtons = this.cancelOrderButton;
    const count = await cancelButtons.count();
    if (count > index) {
      await cancelButtons.nth(index).scrollIntoViewIfNeeded();
      await cancelButtons.nth(index).click();
      await this.page.waitForTimeout(500);
    }
  }

  async handleCancelConfirmation(confirm: boolean = true): Promise<void> {
    this.page.once('dialog', async dialog => {
      if (confirm) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  async isNoOrdersMessageVisible(): Promise<boolean> {
    return await this.noOrdersMessage.isVisible();
  }

  async waitForOrderCancelledAlert(timeout: number = 5000): Promise<boolean> {
    try {
      await this.orderCancelledAlert.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async getAllTabs(): Promise<string[]> {
    const tabs: string[] = [];
    if (await this.allTab.isVisible()) tabs.push('All');
    if (await this.pendingTab.isVisible()) tabs.push('Pending');
    if (await this.processingTab.isVisible()) tabs.push('Processing');
    if (await this.shippedTab.isVisible()) tabs.push('Shipped');
    if (await this.deliveredTab.isVisible()) tabs.push('Delivered');
    return tabs;
  }
}

