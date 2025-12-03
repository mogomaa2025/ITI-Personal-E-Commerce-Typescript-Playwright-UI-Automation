import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ApiWaiting } from '../utils/ApiWaiting';




export class OrderPage extends BasePage {
  readonly pageHeading: Locator;
  readonly allTab: Locator;
  readonly pendingTab: Locator;
  readonly processingTab: Locator;
  readonly shippedTab: Locator;
  readonly deliveredTab: Locator;
  readonly orderCards: Locator;
  readonly cancelOrderButton: Locator;
  readonly statusLabel: Locator;
  readonly noOrdersMessage: Locator;
  readonly snapshotmain: Locator;
  readonly snapshottext: string;
  readonly orderStatusPending: Locator;
  readonly orderStatusProcessing: Locator;
  readonly orderStatusShipped: Locator;
  readonly orderStatusDelivered: Locator;
  readonly ordersList: Locator;
  readonly orderCancelledMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.ordersList = page.locator('.orders-list');
    this.pageHeading = page.getByRole('heading', { name: 'My Orders' });
    this.allTab = page.getByRole('tab', { name: 'All' });
    this.pendingTab = page.getByRole('button', { name: 'Pending' });
    this.processingTab = page.getByRole('button', { name: 'Processing' });
    this.shippedTab = page.getByRole('button', { name: 'Shipped' });
    this.deliveredTab = page.getByRole('button', { name: 'Delivered' });
    this.orderCards = page.locator('.order-card');
    this.cancelOrderButton = page.getByRole('button', { name: 'Cancel Order' });
    this.statusLabel = page.getByRole('status');
    this.noOrdersMessage = page.getByText('No orders found');
    this.snapshotmain = page.getByRole('main');
    this.orderStatusPending = page.locator('.order-status.status-pending');
    this.orderStatusProcessing = page.locator('.order-status.status-processing');
    this.orderStatusShipped = page.locator('.order-status.status-shipped');
    this.orderStatusDelivered = page.locator('.order-status.status-delivered');
    this.orderCancelledMessage = page.getByText('Order cancelled');


    this.snapshottext = `
    - button "All"
    - button "Pending"
    - button "Processing"
    - button "Shipped"
    - button "Delivered"
    `;
  }

  async acceptAlert(): Promise<void> {
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });
  }



}