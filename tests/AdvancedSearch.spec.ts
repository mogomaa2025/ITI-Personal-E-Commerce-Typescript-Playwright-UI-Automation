import { test, expect } from '@playwright/test';
import urlsData from '../data/urls.json'
import { AdvancedSearchPage } from '../pages/AdvancedSearch';
import advanceSearchData from '../data/advanceSearch.json'

test.describe('Advanced Search Functionality', () => {
    let advSearch: AdvancedSearchPage;

    test.beforeEach(async ({ page }) => {
        advSearch = new AdvancedSearchPage(page);
        await page.goto(urlsData.advancedSearchUrl);
    });

    test('AST-TC-001: Complete Advanced Search Form', async ({ page }) => {
        await advSearch.searchTerm.fill(advanceSearchData.productSearchName);
        await advSearch.category.selectOption(advanceSearchData.category);
        await advSearch.minimumPrice.fill(advanceSearchData.minPrice);
        await advSearch.maximumPrice.fill(advanceSearchData.maxPrice);
        await advSearch.minimumRating.selectOption(advanceSearchData.minRate);
        await advSearch.searchButton.click();
        await expect(advSearch.productCard).toBeVisible();

    });

    test('AST-TC-002: Clear Advanced Search Form', async ({ page }) => {
        await advSearch.searchTerm.fill(advanceSearchData.productSearchName);
        await advSearch.category.selectOption(advanceSearchData.category);
        await advSearch.minimumPrice.fill(advanceSearchData.minPrice);
        await advSearch.maximumPrice.fill(advanceSearchData.maxPrice);
        await advSearch.minimumRating.selectOption(advanceSearchData.minRate);
        await advSearch.searchButton.click();
        await expect(advSearch.productCard).toBeVisible();
        await advSearch.clearButton.click();
        await expect(advSearch.productCard).not.toBeVisible();
        await expect(advSearch.noResultsLabel).toContainText(advanceSearchData.noResultsLabel);

    });
});
