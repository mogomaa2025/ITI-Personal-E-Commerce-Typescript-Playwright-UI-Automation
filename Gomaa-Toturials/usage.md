
# @ test

** instance at ts
```js
const basePage = new BasePage(page);  // Create instance to call locator
```

** waiting

[text]
await expect(page.locator('#cart-count')).toHaveText('1');
[api]
await ApiWaiting.waitForAndAssertResponse(page, '**/api/**', 201,'message', 'Item added to cart successfully');
[api]
await ApiWaiting.waitForAndAssertResponseNoBody(this.page, '**/api/orders/status/**', 200); 
[network]
await this.page.goto('/web/orders', { waitUntil: 'networkidle' });
[pageLoad]
await this.waitForOrdersToLoad();
[name] <----------------------------------
await this.page.getByRole('button', { name: 'Cancel Order' });
[visiability]
await this.page.locator('#btn-cancel-order-231').waitFor({ state: 'visible' });
[visablilty_Dynamic]
await this.page.locator('[id^="btn-cancel-order-"]').waitFor({ state: 'visible' });
[alert_visablity]
// Check for "Added to cart!" alert
const alertVisible = await helpers.waitForAlertToAppear(testData.messages.cart.addedToCart);
expect(alertVisible).toBeTruthy();

# @ all
[sleep]
await this.page.waitForTimeout(3000); // 3 seconds



# @ better than get by role 
While getByRole() is excellent, it's not a silver bullet. Other locators are better for specific situations:
[confirmation_message]
page.getByText() : For non-interactive elements like a confirmation message, page title, or descriptive text that doesn't have a specific role. 
```js
await expect(page.getByText('Order successfully placed.')).toBeVisible();
```
[fields_With_standard_<label>_element]
Specifically for form fields that have a standard <label> element associated with them. It's often cleaner than getByRole('textbox', { name: 'Email' }).
```js
await page.getByLabel('Email Address').fill('test@example.com');
```
[Data_Chart_Elements]
When an element is complex, dynamic, or has no stable visible text or clear ARIA role (e.g., a data chart element). This is a great way to create a specific testing contract.
```js
await page.getByTestId('user-profile-icon').click();
```
[highly_complex_selections(nth_child)]
As a last resort for highly complex selections (e.g., finding the Nth child of a specific element that has no unique attributes), or for asserting against internal structural details.
```js
await page.locator('ul > li:nth-child(5)').click();
```
Conclusion: For most interactions with buttons, links, checkboxes, and headings, getByRole() is the superior locator, leading to more readable and resilient tests.

# @ auto wait

1. How Auto-Wait Works for [Actions]
```js
// Playwright automatically waits for the button to appear, stabilize, and be enabled before clicking.
await page.getByRole('button', { name: 'Submit Order' }).click(); 

// Playwright automatically waits for the input to be visible and editable before filling.
await page.getByLabel('Password').fill('mySecret');
```

2. Auto-Wait with Web-First [Assertions] 
```js
TypeScript Example (Auto-Wait Assertions)
// Waits up to 5 seconds for the success message to be visible
await expect(page.locator('.alert-success')).toBeVisible();

// Waits up to 5 seconds for the loading spinner to disappear
await expect(page.getByRole('progressbar')).toBeHidden();

// Waits up to 5 seconds for the counter element to contain the number '5'
await expect(page.locator('#item-count')).toHaveText('5');
```

3. When [Manual_Waits] are Still Needed 
While auto-wait covers 99% of use cases, you may need an explicit wait method for broader conditions not tied to a single element action.
```js
Page URL/Navigation --> page.waitForURL()
Network Request/Response --> page.waitForResponse() or page.waitForRequest()
Custom JavaScript State --> page.waitForFunction() (for checking a global variable or custom DOM condition)
```

* Crucially, you should always avoid page.waitForTimeout(ms), as this is a hard sleep that slows down your tests and makes them unreliable.


[add-all-to-cart-loop]
```js
   const buttons = await page.getByRole('button', { name: 'Add to Cart' }).all();
    for (let i = 1; i < buttons.length; i++) {
      await buttons[i].click();
      await page.getByText("Added to cart!").first().waitFor({ state: 'visible' });
      await page.getByRole('button', { name: '×' }).last().click();
    }
```