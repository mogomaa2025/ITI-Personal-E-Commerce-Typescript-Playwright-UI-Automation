# Test Organization and Reporting

## Project Structure

```
playwright-tests3/
├── @pages/              # Page Object Models (using path alias)
│   ├── BasePage.ts
│   ├── OrderPage.ts
│   ├── LoginPage.ts
│   ├── AdminPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   ├── ProductsPage.ts
│   └── ...
├── @tests/              # Test Specifications (using path alias)
│   ├── orders.spec.ts
│   ├── login.spec.ts
│   ├── products.spec.ts
│   └── ...
├── @utils/              # Utility Functions (using path alias)
│   └── helpers.ts
└── @data/               # Test Data (using path alias)
    ├── users.json
    └── data.json
```

## Main Test Table

### Order System Tests (`orders.spec.ts`)

| Test ID | Test Name | Description | Status | Priority |
|---------|-----------|-------------|--------|----------|
| ORD-001 | Verify Guest User navigate to orders and check login message | Verifies that guest users see login message when accessing orders page | ✅ | High |
| ORD-002 | Login as admin and go to admin from nav bar | Tests admin login and navigation to admin dashboard | ✅ | High |
| ORD-003 | Save Total Orders numbers and Total Revenue from admin dashboard | Captures admin dashboard statistics for later verification | ✅ | Medium |
| ORD-004 | Logged in as user, and navigate to products | Verifies user login and navigation to products page | ✅ | Medium |
| ORD-005 | Add some products to cart and save prices to check later | Tests adding products to cart and saving cart total | ✅ | High |
| ORD-006 | Navigate to cart | Verifies cart page navigation | ✅ | Low |
| ORD-007 | Checkout by clicking Proceed to Checkout | Tests checkout button functionality | ✅ | High |
| ORD-008 | Enter valid shipping address and make sure it navigates automatically to orders | Verifies complete checkout flow with shipping address | ✅ | High |
| ORD-009 | Check same orders in the order page and make sure price matches saved cart price | Validates order total matches cart total | ✅ | High |
| ORD-010 | Check there are tabs: All, Pending, Processing, Shipped, Delivered | Verifies all order status tabs are present | ✅ | Medium |
| ORD-011 | Click on Pending tab and make sure order status is Pending | Tests pending tab functionality and order status | ✅ | High |
| ORD-012 | Check product date and totals and no of items and product name correct in the pending tab | Validates order details in pending tab | ✅ | High |
| ORD-013 | Click Cancel Order in pending tab | Tests cancel order button click | ✅ | Medium |
| ORD-014 | Try when click cancel in the alert it do nothing and still in Pending status | Verifies order remains pending when cancel dialog is dismissed | ✅ | Medium |
| ORD-015 | Click again cancel order in pending tab | Tests cancel order button click again | ✅ | Low |
| ORD-016 | Click ok in the alert for confirm of cancel, it should make an inline alert "Order cancelled" | Verifies order cancellation confirmation | ✅ | High |
| ORD-017 | Check no products left in the pending tab and label called "No orders found" | Tests empty state after cancelling all orders | ✅ | Medium |

### Login System Tests (`login.spec.ts`)

| Test ID | Test Name | Description | Status | Priority |
|---------|-----------|-------------|--------|----------|
| LOG-001 | Verify Login page loads correctly | Verifies that all login page elements are visible and accessible | ✅ | High |
| LOG-002 | Verify all labels are visible and correct | Checks that all form labels are displayed correctly | ✅ | Medium |
| LOG-003 | Verify password field is hidden | Confirms password field has appropriate type for security | ✅ | Low |
| LOG-004 | Verify Register here link navigates to register page | Tests navigation from login to registration page | ✅ | Medium |
| LOG-005 | Validate empty email and password fields | Tests behavior when submitting empty credentials | ✅ | High |
| LOG-006 | Validate email without @ symbol | Tests validation for invalid email format | ✅ | High |
| LOG-007 | Validate empty email field | Tests validation when email field is empty | ✅ | High |
| LOG-008 | Validate empty password field | Tests validation when password field is empty | ✅ | High |
| LOG-009 | Validate invalid credentials - wrong email | Tests login with incorrect email address | ✅ | High |
| LOG-010 | Validate invalid credentials - wrong password | Tests login with incorrect password | ✅ | High |
| LOG-011 | Successful login with valid user credentials | Verifies successful login for standard user | ✅ | High |
| LOG-012 | Successful login with admin credentials | Verifies successful login for admin user | ✅ | High |
| LOG-013 | Verify navigation after successful login | Confirms correct page navigation after login | ✅ | High |
| LOG-014 | Verify navbar changes after login | Tests that navbar updates to show logged-in state | ✅ | High |
| LOG-015 | Attempt to access login page when already logged in | Verifies behavior when accessing login while authenticated | ✅ | Medium |
| LOG-016 | Data-driven - Validate email without @ symbol | Data-driven test validation for invalid email format | ✅ | High |
| LOG-017 | Data-driven - Validate empty email field | Data-driven test validation when email field is empty | ✅ | High |
| LOG-018 | Data-driven - Validate empty password field | Data-driven test validation when password field is empty | ✅ | High |
| LOG-019 | Data-driven - Validate invalid credentials - wrong email | Data-driven test with incorrect email address | ✅ | High |
| LOG-020 | Data-driven - Validate invalid credentials - wrong password | Data-driven test with incorrect password | ✅ | High |

### Registration System Tests (`register.spec.ts`)

| Test ID | Test Name | Description | Status | Priority |
|---------|-----------|-------------|--------|----------|
| REG-001 | Verify Register page loads correctly | Verifies that all register page elements are visible and accessible | ✅ | High |
| REG-002 | Verify all labels are visible and correct | Checks that all form labels are displayed correctly | ✅ | Medium |
| REG-003 | Verify password field is hidden | Confirms password field has appropriate type for security | ✅ | Low |
| REG-004 | Verify Login here link navigates to login page | Tests navigation from register to login page | ✅ | Medium |
| REG-005 | Validate name too short (BVA - less than 3 chars) | Tests validation for names with less than 3 characters | ✅ | High |
| REG-006 | Validate name with exactly 3 characters (BVA - boundary) | Tests registration with minimum valid name length | ✅ | High |
| REG-007 | Validate empty name field | Tests validation when name field is empty | ✅ | High |
| REG-008 | Validate email without @ symbol | Tests validation for invalid email format | ✅ | High |
| REG-009 | Validate empty email field | Tests validation when email field is empty | ✅ | High |
| REG-010 | Validate password less than 6 characters (BVA) | Tests validation for short passwords | ✅ | High |
| REG-011 | Validate password with exactly 6 characters (BVA - boundary) | Tests registration with minimum valid password length | ✅ | High |
| REG-012 | Validate password without number | Tests validation for passwords without numbers | ✅ | High |
| REG-013 | Validate password without letter | Tests validation for passwords without letters | ✅ | High |
| REG-014 | Validate empty password field | Tests validation when password field is empty | ✅ | High |
| REG-015 | Validate phone number too short (BVA - less than 8 chars) | Tests validation for short phone numbers | ✅ | High |
| REG-016 | Validate phone number with exactly 8 characters (BVA - boundary) | Tests registration with minimum valid phone number length | ✅ | High |
| REG-017 | Validate phone number too long (BVA - more than 20 chars) | Tests validation for long phone numbers | ✅ | High |
| REG-018 | Validate phone number with exactly 20 characters (BVA - boundary) | Tests registration with maximum valid phone number length | ✅ | High |
| REG-019 | Validate phone number with letters | Tests validation for phone numbers with letters | ✅ | High |
| REG-020 | Validate empty phone number field | Tests validation when phone field is empty | ✅ | High |
| REG-021 | Validate empty address field | Tests validation when address field is empty | ✅ | High |
| REG-022 | Validate all empty fields | Tests validation when all required fields are empty | ✅ | High |
| REG-023 | Successful registration with valid data | Verifies successful registration using valid test data | ✅ | High |
| REG-024 | Register with existing user email | Tests validation when using existing user email | ✅ | High |
| REG-025 | Data-driven - Validate name too short | Data-driven test validation for short names | ✅ | High |
| REG-026 | Data-driven - Validate empty name field | Data-driven test validation when name field is empty | ✅ | High |
| REG-027 | Data-driven - Validate email without @ symbol | Data-driven test validation for invalid email format | ✅ | High |
| REG-028 | Data-driven - Validate empty email field | Data-driven test validation when email field is empty | ✅ | High |
| REG-029 | Data-driven - Validate password less than 6 chars | Data-driven test validation for short passwords | ✅ | High |
| REG-030 | Data-driven - Validate password without number | Data-driven test validation for passwords without numbers | ✅ | High |
| REG-031 | Data-driven - Validate empty password field | Data-driven test validation when password field is empty | ✅ | High |
| REG-032 | Data-driven - Validate phone number too short | Data-driven test validation for short phone numbers | ✅ | High |
| REG-033 | Data-driven - Validate phone number with letters | Data-driven test validation for phone numbers with letters | ✅ | High |
| REG-034 | Data-driven - Validate empty phone number field | Data-driven test validation when phone field is empty | ✅ | High |
| REG-035 | Data-driven - Validate empty address field | Data-driven test validation when address field is empty | ✅ | High |

### Homepage System Tests (`homepage.spec.ts`)

| Test ID | Test Name | Description | Status | Priority |
|---------|-----------|-------------|--------|----------|
| HOME-001 | Verify homepage loads correctly for guest user | Verifies that all homepage elements are visible and accessible for guests | ✅ | High |
| HOME-002 | Verify navbar for guest user | Tests navigation elements visible to guests | ✅ | Medium |
| HOME-003 | Verify Shop Now button navigates to products | Tests navigation from homepage to products page | ✅ | High |
| HOME-004 | Verify Why Choose Us section | Validates visibility of company value propositions | ✅ | Medium |
| HOME-005 | Verify Shop by Category section displays categories | Tests that product categories are displayed | ✅ | Low |
| HOME-006 | Verify category click navigation | Tests clicking category links navigates correctly | ✅ | High |
| HOME-007 | Verify Cart link shows alert for guest user | Tests guest user restrictions on cart access | ✅ | High |
| HOME-008 | Verify Orders link shows alert for guest user | Tests guest user restrictions on orders access | ✅ | High |
| HOME-009 | Verify footer is visible | Validates footer element visibility | ✅ | Low |
| HOME-010 | Verify logo click navigates to homepage | Tests logo navigation functionality | ✅ | Medium |
| HOME-011 | Verify navbar for logged in normal user | Tests navigation elements visible to logged-in users | ✅ | High |
| HOME-012 | Verify Shop Now button for logged in user | Tests Shop Now button functionality for logged-in users | ✅ | High |
| HOME-013 | Verify Cart link works for logged in user | Tests cart access for logged-in users | ✅ | High |
| HOME-014 | Verify Orders link works for logged in user | Tests orders access for logged-in users | ✅ | High |
| HOME-015 | Verify Profile link is accessible | Tests profile page access for logged-in users | ✅ | High |
| HOME-016 | Verify Wishlist link is accessible | Tests wishlist access for logged-in users | ✅ | Medium |
| HOME-017 | Verify Notifications link is accessible | Tests notifications access for logged-in users | ✅ | Medium |
| HOME-018 | Verify Logout functionality | Tests logout functionality for logged-in users | ✅ | High |
| HOME-019 | Verify Admin link not visible for normal user | Tests admin link visibility for regular users | ✅ | Medium |
| HOME-020 | Verify navbar for admin user | Tests navigation elements visible to admin users | ✅ | High |
| HOME-021 | Verify Admin link is visible and accessible | Tests admin panel access for admin users | ✅ | High |
| HOME-022 | Verify Shop Now button for admin user | Tests Shop Now button for admin users | ✅ | Medium |
| HOME-023 | Verify all navbar links work for admin | Tests all navigation elements for admin users | ✅ | High |

### Cart System Tests (`cart.spec.ts`)

| Test ID | Test Name | Description | Status | Priority |
|---------|-----------|-------------|--------|----------|
| CART-001 | Navigate to cart as guest user | Verifies that guest users see login prompt when accessing cart | ✅ | High |
| CART-002 | Add to cart functionality | Tests adding products to cart and notification | ✅ | High |
| CART-003 | View empty cart as logged-in user | Verifies empty cart state and elements | ✅ | Medium |
| CART-004 | Add products to cart and verify cart contents | Tests adding products and validating cart contents | ✅ | High |
| CART-005 | Increase item quantity in cart | Tests increasing item quantity functionality | ✅ | High |
| CART-006 | Decrease item quantity in cart | Tests decreasing item quantity functionality | ✅ | High |
| CART-007 | Set specific item quantity in cart | Tests setting specific quantity for items | ✅ | High |
| CART-008 | Remove item from cart | Tests removing individual items from cart | ✅⚠️ | High |
| CART-009 | Clear entire cart | Tests clearing entire cart functionality | ✅ | High |
| CART-010 | Verify cart calculations have correct format | Verifies price formatting in cart | ✅ | Medium |
| CART-011 | Proceed to checkout with cart items | Tests checkout button functionality | ✅ | Medium |
| CART-012 | Enter shipping address during checkout | Tests entering shipping address in checkout flow | ✅⚠️ | High |
| CART-013 | Cart badge count matches unique products | Tests cart badge reflects unique product count | ✅ | Medium |
| CART-014 | Handle invalid quantity values gracefully | Tests error handling for invalid quantities | ✅ | Medium |
| CART-015 | Validate cart functionality after navigation | Tests cart persistence across navigation | ✅ | Low |

## Refactoring Summary

### Changes Made

#### 1. **OrderPage.ts Refactoring**
- ✅ Removed all `page.waitForTimeout()` calls
- ✅ Implemented proper Playwright waiting mechanisms:
  - `waitFor({ state: 'visible' })` for element visibility
  - `waitForLoadState('networkidle')` for page load
  - `waitForURL()` for navigation verification
  - Custom `waitForOrdersToLoad()` method
- ✅ Added comprehensive JSDoc comments
- ✅ Improved TypeScript typing with `OrderDetails` interface
- ✅ Added `waitForOrderWithTotal()` helper method for better order matching
- ✅ Enhanced error handling

#### 2. **orders.spec.ts Refactoring**
- ✅ Removed all `page.waitForTimeout()` calls (replaced with proper waits)
- ✅ Implemented helper functions:
  - `loginAsUser()` - Reusable login function
  - `loginAsAdmin()` - Reusable admin login function
  - `createOrder()` - Reusable order creation function
- ✅ Followed Arrange-Act-Assert (AAA) pattern in all tests
- ✅ Added comprehensive test descriptions and JSDoc
- ✅ Improved test organization and readability
- ✅ Used Playwright's built-in waiting mechanisms:
  - `waitForURL()` for navigation
  - `waitForSelector()` for element appearance
  - `waitForLoadState()` for page readiness
- ✅ Better error handling and validation

#### 3. **Configuration Updates**
- ✅ Updated `tsconfig.json` with path aliases:
  - `@pages/*` → `pages/*`
  - `@tests/*` → `tests/*`
  - `@utils/*` → `utils/*`
  - `@data/*` → `data/*`

### Best Practices Implemented

1. **No Artificial Timeouts**: All `waitForTimeout()` calls removed and replaced with proper Playwright waiting mechanisms
2. **Proper Waiting**: Using `waitFor()`, `waitForURL()`, `waitForSelector()`, and `waitForLoadState()`
3. **Type Safety**: Enhanced TypeScript typing with interfaces and proper return types
4. **Code Reusability**: Helper functions reduce code duplication
5. **Error Handling**: Proper try-catch blocks and error messages
6. **Documentation**: Comprehensive JSDoc comments for all methods
7. **Test Organization**: Clear AAA pattern and logical test flow

### Performance Improvements

- **Faster Test Execution**: Removed unnecessary timeouts, tests now wait only for actual conditions
- **More Reliable**: Tests use proper waiting mechanisms that adapt to actual page state
- **Better Debugging**: Clear error messages and proper element waiting make failures easier to diagnose

### Migration Path for Other Tests

To migrate other test files to the new structure:

1. **Update Imports** (optional, for path aliases):
   ```typescript
   // Old
   import { LoginPage } from '../pages/LoginPage';
   
   // New (optional)
   import { LoginPage } from '@pages/LoginPage';
   ```

2. **Remove Timeouts**:
   ```typescript
   // Old
   await page.waitForTimeout(2000);
   
   // New
   await page.waitForLoadState('networkidle');
   await element.waitFor({ state: 'visible' });
   ```

3. **Add Helper Functions**:
   - Extract common operations into reusable helper functions
   - Use test fixtures for shared setup/teardown

4. **Follow AAA Pattern**:
   ```typescript
   test('Test Name', async ({ page }) => {
     // Arrange
     const pageObject = new PageObject(page);
     
     // Act
     await pageObject.performAction();
     
     // Assert
     await expect(pageObject.element).toBeVisible();
   });
   ```

5. **Add JSDoc Comments**:
   - Document all page object methods
   - Add test descriptions

## Test Execution

### Run All Order Tests
```bash
npm test tests/orders.spec.ts
```

### Run Specific Test
```bash
npx playwright test tests/orders.spec.ts -g "ORD-001"
```

### Run in Headed Mode
```bash
npm run test:headed tests/orders.spec.ts
```

### Debug Mode
```bash
npm run test:debug tests/orders.spec.ts
```

## Test Coverage

- ✅ Guest user order access
- ✅ Admin dashboard statistics
- ✅ User order creation
- ✅ Order status tracking (All, Pending, Processing, Shipped, Delivered)
- ✅ Order cancellation workflow
- ✅ Order detail validation
- ✅ Cart to order price matching
- ✅ Empty state handling

## Notes

- All tests use proper Playwright waiting mechanisms
- No artificial timeouts are used
- Tests follow the Arrange-Act-Assert pattern
- Page objects follow single responsibility principle
- Comprehensive error handling and validation

### Product System Tests (`products.spec.ts`)

| Test ID | Test Name | Description | Status | Priority |
|---------|-----------|-------------|--------|----------|
| PROD-001 | Verify products page loads correctly | Verifies that all products page elements are visible and accessible | ✅ | High |
| PROD-002 | Verify products are displayed | Ensures product listings are visible on the page | ✅ | Medium |
| PROD-003 | Verify product card contains all required elements | Validates that product cards have name, category, price, and stock info | ✅ | High |
| PROD-004 | Verify price format is correct (2 decimal places) | Checks that all prices display in proper currency format | ✅ | Medium |
| PROD-005 | Verify View Details button navigation | Tests navigation from product card to product details page | ✅ | High |
| PROD-006 | Verify Add to Cart functionality | Validates that products can be added to cart successfully | ✅ | High |
| PROD-007 | Verify Add to Cart shows alert | Confirms user receives feedback when adding product to cart | ✅ | Medium |
| PROD-008 | Verify Like button functionality | Tests the like/recommendation feature for products | ✅ | Low |
| PROD-009 | Verify Search functionality with valid term | Tests product search with valid search terms | ✅ | High |
| PROD-010 | Verify Search with no results | Tests search behavior when no matching products exist | ✅ | Medium |
| PROD-011 | Verify Category filter - Electronics | Tests filtering products by Electronics category | ✅ | High |
| PROD-012 | Verify Category filter - All Categories | Tests resetting filters to show all categories | ✅ | Medium |
| PROD-013 | Verify price filter with valid range | Tests price filtering with valid min/max values | ✅ | High |
| PROD-014 | Verify price filter with min greater than max | Tests error handling when filter values are invalid | ✅ | Medium |
| PROD-015 | Verify price filter with negative values | Tests price filter behavior with negative inputs | ✅ | Medium |
| PROD-016 | Verify Clear filters button | Tests functionality to reset all applied filters | ✅ | Medium |
| PROD-017 | Verify pagination buttons are displayed | Ensures pagination controls are visible when needed | ✅ | Low |
| PROD-018 | Verify pagination button click changes page | Tests navigation between product listing pages | ✅ | High |
| PROD-019 | Verify pagination button becomes active on click | Validates active state of selected pagination button | ✅ | Medium |
| PROD-020 | Verify last pagination page shows products | Ensures last page of results displays correctly | ✅ | Medium |
| PROD-021 | Verify multiple filters applied together | Tests combining different filter types simultaneously | ✅ | High |
| PROD-022 | Verify Add to Cart for multiple products | Tests adding multiple different products to cart | ✅ | High |
| PROD-023 | Verify product stock is displayed | Confirms stock availability information is visible | ✅ | Medium |
| PROD-024 | Verify category filter changes product list | Tests that category selection updates product display | ✅ | High |

### Product Details Tests (`product-details.spec.ts`)

| Test ID | Test Name | Description | Status | Priority |
|---------|-----------|-------------|--------|----------|
| PDET-001 | Verify Login and Navigation | Verifies successful login and navigation to products page | ✅ | Medium |
| PDET-002 | Verify View Details Navigation | Tests navigation from product card to product details page | ✅ | High |
| PDET-003 | Verify Product Image Display | Confirms product image is visible and accessible | ✅ | Low |
| PDET-004 | Verify Product Stock Badge | Verifies product stock badge is displayed | ✅ | Low |
| PDET-005 | Verify Product Name | Tests that product name is displayed correctly | ✅ | High |
| PDET-006 | Verify Product Category | Verifies product category is displayed correctly | ✅ | Medium |
| PDET-007 | Verify Product Price Format | Checks that price format follows proper convention | ✅ | Medium |
| PDET-008 | Verify Product Stars and Reviews | Tests star rating and review count display | ✅ | Medium |
| PDET-009 | Verify Product Description | Ensures product description is visible | ✅ | Low |
| PDET-010 | Verify Product Stock Information | Tests that stock information is displayed | ✅ | Low |
| PDET-011 | Verify Increase Quantity Button | Confirms increase quantity button functionality | ✅ | Medium |
| PDET-012 | Verify Decrease Quantity Button | Tests decrease quantity button functionality | ✅ | Medium |
| PDET-013 | Verify Quantity Input and Cart | Validates quantity input and cart addition | ✅ | High |
| PDET-014 | Verify Like Product Button | Tests product like functionality | ✅ | Medium |
| PDET-015 | Verify Add to Wishlist Button | Verifies wishlist functionality | ✅ | Medium |
| PDET-016 | Verify Back to Products Button | Tests navigation back to products page | ✅ | Medium |
| PDET-017 | Verify Write Review Functionality | Confirms review submission works correctly | ✅ | High |
| PDET-018 | Verify Average Rating Value | Tests average rating calculation display | ✅ | Medium |
| PDET-019 | Verify Average Rating Stars | Validates star rating display | ✅ | Medium |
| PDET-020 | Verify Total Reviews Count | Checks total reviews count display | ✅ | Medium |
| PDET-021 | Verify Reviews List and Cards | Tests reviews list and individual card display | ✅ | Medium |
| PDET-022 | Verify Specifications Tab | Verifies specifications tab functionality | ✅ | Medium |
| PDET-023 | Verify Product Specifications | Validates specification details display | ✅ | High |
| PDET-024 | Verify Non-Registered User Access | Tests guest user access limitations | ✅ | High |

