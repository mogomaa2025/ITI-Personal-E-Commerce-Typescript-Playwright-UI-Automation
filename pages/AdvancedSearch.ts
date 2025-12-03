import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdvancedSearchPage extends BasePage {
    readonly productCard: Locator;
    readonly searchButton: Locator;
    readonly searchTerm: Locator;
    readonly category: Locator;
    readonly minimumPrice: Locator;
    readonly maximumPrice: Locator;
    readonly minimumRating: Locator;
    readonly clearButton: Locator;
    readonly noResultsLabel: Locator;

    constructor(page: Page) {
        super(page); // for inhertance from base
        this.productCard = page.locator('.product-card');
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.searchTerm = page.getByRole('textbox', { name: 'Search Term' });
        this.category = page.getByLabel('Category');
        this.minimumPrice = page.getByRole('spinbutton', { name: 'Minimum Price' });
        this.maximumPrice = page.getByRole('spinbutton', { name: 'Maximum Price' });
        this.minimumRating = page.getByLabel('Minimum Rating');
        this.clearButton = page.getByRole('button', { name: 'Clear' });
        this.noResultsLabel = page.locator('#search-results-container');

    }








}
