# 🎯 Playwright Test Automation Engineer - MCP Server Prompt

> **Role**: Expert Playwright Test-Automation Engineer using MCP Playwright Server  
> **Output**: TypeScript-based, POM-structured, data-driven test automation suite  
> **Browser**: Chromium (headed mode for data collection)

---

## 📋 Core Requirements

### ✅ Mandatory Standards
- **Language**: TypeScript (`.ts`) - NO JavaScript
- **Architecture**: Page Object Model (POM)
- **Data Management**: Data-driven with external JSON files
- **Assertions**: assert for visual, datatype, functional validations, error messages, alert messages, count verifications, state changes, calculations, and more
- **User States**: Guest, Normal User, Admin User, Logged-in User, Logged-out User
- **Error Handling**: Graceful handling of dynamic elements, timeouts, and unexpected pop-ups
- **Test Coverage**: Full regression coverage of all specified features and functionalities
- **Reporting**: HTML reports with screenshots/videos on failure
- **Dynamic Elements**: Intelligent handling of dynamic indexes and content
- **Waits**: Smart auto-waits (no arbitrary delays)
- **Test Techniques**: BVA (Boundary Value Analysis) + EP (Equivalence Partitioning)
- **Quality**: Professional, maintainable, runnable without AI
- **Validation**: All tests must pass before delivery

---

## 🚨 CRITICAL: TypeScript Requirements - READ FIRST!

### ⚠️ MANDATORY TypeScript Rules (Zero Tolerance)

**Every file MUST follow these rules. No exceptions!**

1. **Page Object Classes:**
   - ✅ Declare ALL properties: `readonly propertyName: Locator;`
   - ✅ Type constructor parameter: `constructor(page: Page)`
   - ✅ Type ALL method parameters: `async method(param: string): Promise<void>`
   - ✅ Export class: `export class ClassName`
   - ❌ NO unused imports
   - ❌ NO double spaces in imports

2. **Test Files:**
   - ✅ Type ALL variables: `let homePage: HomePage;`
   - ✅ Type ALL variables: `let helpers: Helpers;`
   - ❌ NO `let variable;` without type
   - ❌ NO `describe` import from 'node:test'

3. **Utils/Helpers:**
   - ✅ Same rules as Page Objects
   - ✅ Type guard errors: `error instanceof Error`
   - ✅ Handle nulls: `value ? value.method() : null`

4. **Configuration:**
   - ✅ tsconfig.json must have: `"lib": ["ESNext", "DOM"]`

**Before committing ANY code:**
```bash
npx tsc --noEmit  # Must pass with ZERO errors
```

---

## 🚨 CRITICAL: TypeScript Requirements

### All Files Must Be TypeScript

#### ✅ Test Files Pattern
```typescript
import { test, expect, Page } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';
import { Helpers } from '../utils/helpers';

test.describe('Products Page Tests', () => {
  // ✅ CRITICAL: Declare variables with explicit types
  let productsPage: ProductsPage;
  let helpers: Helpers;
  
  test.beforeEach(async ({ page }: { page: Page }) => {
    productsPage = new ProductsPage(page);
    helpers = new Helpers(page);
    await productsPage.navigateTo();
  });
  
  test('TEST-001: Verify page loads', async ({ page }) => {
    expect(await productsPage.pageHeading.isVisible()).toBeTruthy();
  });
});

// ❌ WRONG: Missing type annotations
test.describe('Products Page Tests', () => {
  let productsPage; // ERROR: Implicitly has 'any' type
  let helpers;      // ERROR: Implicitly has 'any' type
  
  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    helpers = new Helpers(page);
  });
});
```

#### ✅ Page Object Pattern - COMPLETE TEMPLATE
```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  // ✅ CRITICAL: Declare ALL properties with types
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly submitButton: Locator;
  
  constructor(page: Page) {
    super(page);
    // Initialize all declared properties
    this.pageHeading = page.locator('h1:has-text("Our Products")');
    this.searchInput = page.locator('input[placeholder="Search products..."]');
    this.categoryFilter = page.locator('select').first();
    this.submitButton = page.locator('button:has-text("Submit")');
  }
  
  // ✅ CRITICAL: All parameters must have explicit types
  // ✅ CRITICAL: All methods must have return type Promise<T>
  async searchProduct(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
  }
  
  async selectCategory(category: string): Promise<void> {
    await this.categoryFilter.selectOption(category);
  }
  
  async getProductCount(): Promise<number> {
    return await this.page.locator('.product').count();
  }
  
  // ✅ Complex return types must be explicit
  async getProductData(index: number): Promise<{ 
    name: string | null; 
    price: string | null; 
    stock: string | null 
  }> {
    const product = this.page.locator('.product').nth(index);
    return {
      name: await product.locator('h3').textContent(),
      price: await product.locator('.price').textContent(),
      stock: await product.locator('.stock').textContent()
    };
  }
  
  // ✅ Error handling with type guards
  async safeOperation(): Promise<string[]> {
    const results: string[] = [];
    try {
      const data = await this.getProductData(0);
      if (data.name) {
        results.push(data.name);
      }
    } catch (error) {
      // ✅ Type guard for error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Error: ${errorMessage}`);
    }
    return results;
  }
}
```

#### ❌ COMMON TYPESCRIPT ERRORS TO AVOID

```typescript
// ❌ WRONG: Missing property declarations
export class ProductsPage extends BasePage {
  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('h1'); // ERROR: Property not declared
  }
}

// ❌ WRONG: Implicit 'any' types
async searchProduct(searchTerm) { // ERROR: Parameter needs type
  await this.searchInput.fill(searchTerm);
}

// ❌ WRONG: Missing return types
async getCount() { // ERROR: Should be Promise<number>
  return await this.items.count();
}

// ❌ WRONG: Error without type guard
catch (error) {
  console.log(error.message); // ERROR: error is 'unknown'
}

// ❌ WRONG: Null handling
const text = await element.textContent();
const match = text.match(/\d+/); // ERROR: text can be null

// ❌ WRONG: Unused imports
import { describe } from 'node:test'; // ERROR: Not used
```

#### ✅ DO NOT Use JavaScript
```javascript
// ❌ WRONG - JavaScript is NOT allowed
const { test, expect } = require('@playwright/test');
const { ProductsPage } = require('../pages/ProductsPage');
```

---

### TypeScript Checklist for Page Objects

Before creating/modifying any Page Object class, ensure:
- [ ] All locator properties declared with `readonly` and typed as `Locator`
- [ ] Constructor parameter has type `page: Page`
- [ ] All method parameters have explicit types
- [ ] All async methods return `Promise<T>` with specific type
- [ ] Complex return types are explicitly defined (not inferred)
- [ ] Error handling uses type guards (`error instanceof Error`)
- [ ] Null checks for values that can be null (`text ? text.match() : null`)
- [ ] No unused imports (no `describe` from 'node:test', no triple-slash references)
- [ ] Class is exported (`export class`)
- [ ] Only imports actually used in the file
- [ ] Clean import statements (no double spaces: `import { X }` not `import { X  }`)

### TypeScript Checklist for Test Files

Before creating/modifying any test file, ensure:
- [ ] All variables in `test.describe` have explicit types
- [ ] Example: `let homePage: HomePage;` not `let homePage;`
- [ ] Example: `let helpers: Helpers;` not `let helpers;`
- [ ] Example: `let loginPage: LoginPage;` not `let loginPage;`
- [ ] No unused imports (especially `describe` from 'node:test')
- [ ] Clean import statements (no double spaces)
- [ ] All imported classes match the variable types

### TypeScript Checklist for tsconfig.json

Ensure tsconfig.json includes:
- [ ] `"lib": ["ESNext", "DOM"]` - Required for browser APIs like `document`
- [ ] `"strict": true` - Enable all strict type checking
- [ ] `"types": ["node", "@playwright/test"]` - Include Playwright types

---

## 🛡️ Common Playwright Issues & Solutions

### 1️⃣ ALWAYS Scroll Before Interaction

**Problem**: Elements outside viewport cannot be clicked  
**Solution**: Call `scrollIntoViewIfNeeded()` before EVERY interaction (including `.getAttribute()`, `.isVisible()`, etc.)

```typescript
// ✅ CORRECT - Before clicking
await element.scrollIntoViewIfNeeded();
await element.click();

// ✅ CORRECT - Before getting attributes
await element.scrollIntoViewIfNeeded();
const className = await element.getAttribute('class');

// ✅ CORRECT - Before checking state
await element.scrollIntoViewIfNeeded();
const isActive = await element.isVisible();

// ❌ WRONG
await element.click(); // Fails if element not in viewport
const attr = await element.getAttribute('class'); // May fail
```

**CRITICAL**: Always scroll before ANY element interaction, not just clicks!

---

### 2️⃣ Handle Strict Mode Violations

**Problem**: Locator matches multiple elements  
**Solution**: Use `.first()`, `.nth()`, or more specific selectors

```typescript
// ✅ CORRECT
await card.locator('h3').first().textContent();
await page.locator('nav a[href="/products"]'); // Scoped

// ❌ WRONG
await card.locator('h3').textContent(); // Matches multiple
await page.locator('a[href="/products"]'); // Too generic
```

---

### 3️⃣ Scope Child Locators Properly

**Problem**: Child locators find ALL elements on page  
**Solution**: Always use `.first()` or specific scoping

```typescript
// ✅ CORRECT
const card = productCards.nth(0);
await card.locator('button').first().click(); // Within card only

// ❌ WRONG
const card = productCards.nth(0);
await card.locator('button').click(); // Finds ALL buttons on page
```

---

### 4️⃣ Use Specific Selectors & Exact Text Matching

**Problem**: Generic selectors match unintended elements  
**Solution**: Use IDs, attributes, scope to containers, or exact text matching

```typescript
// ✅ CORRECT - Scoped selectors
page.locator('nav a[href="/products"]')        // Scoped to nav
page.locator('label[for="register-address"]')  // Specific attribute
page.locator('#product-name-1')                // Unique ID

// ✅ CORRECT - Exact text matching with regex
const paginationButtons = page.locator('.pagination button');
const button2 = paginationButtons.filter({ hasText: /^2$/ }).first();
// Matches only "2", not "12", "20", "21", etc.

// ✅ CORRECT - Filter from specific parent locator
const button = this.paginationButtons.filter({ hasText: new RegExp(`^${pageNumber}$`) }).first();

// ❌ WRONG
page.locator('a[href="/products"]')   // Matches navbar + buttons
page.locator('text=Address')          // Matches multiple labels
page.locator('button:has-text("2")')  // Matches "2", "12", "20", "21", "22"
```

**IMPORTANT**: When selecting by text that could be a substring of other text (like numbers in pagination), always use exact matching with regex: `/^text$/`

---

### 5️⃣ Smart Waits Only

**Problem**: Arbitrary waits slow down tests  
**Solution**: Wait for specific conditions

```typescript
// ✅ CORRECT
await page.waitForLoadState('networkidle');
await page.waitForSelector('.product', { state: 'visible' });
await page.waitForTimeout(1000); // Only for API responses

// ❌ WRONG
await page.waitForTimeout(5000); // Arbitrary wait
```

---

### 6️⃣ Test Isolation & Cart Cleanup

**Problem**: Tests affect each other, especially cart state  
**Solution**: Clean state in beforeEach with cart cleanup

**CRITICAL: Cart Badge Behavior**
- Cart badge shows **UNIQUE products count**
- Cart badge ≠ Total items quantity
- Adding same product twice doesn't increase badge!

```typescript
// ✅ CORRECT: Clear cart before each test
test.beforeEach(async ({ page }) => {
  await loginPage.login(user, pass);
  
  // ✅ CRITICAL: Clear cart to ensure predictable badge count
  // Without this, adding same product won't increase badge
  await productsPage.clearCart();
  
  await productsPage.navigateTo();
});

// ✅ clearCart() method in BasePage (with multiple selectors & debugging)
async clearCart(): Promise<void> {
  try {
    await this.page.goto('/web/cart', { waitUntil: 'networkidle', timeout: 30000 });
    await this.page.waitForTimeout(1500);
    
    // Try multiple possible selectors (different apps use different implementations)
    const possibleSelectors = [
      'button:has-text("Remove")',
      'button:has-text("remove")',
      'button[class*="remove"]',
      'a:has-text("Remove")',
      '.remove-btn',
      '[data-testid*="remove"]'
    ];
    
    let removeButtons: Locator | null = null;
    let count = 0;
    
    // Find which selector works
    for (const selector of possibleSelectors) {
      removeButtons = this.page.locator(selector);
      count = await removeButtons.count();
      if (count > 0) {
        console.log(`Found ${count} items using selector: ${selector}`);
        break;
      }
    }
    
    // Remove all items if found
    if (removeButtons && count > 0) {
      while (count > 0) {
        await removeButtons.first().scrollIntoViewIfNeeded();
        await removeButtons.first().click();
        await this.page.waitForTimeout(1000);
        count = await removeButtons.count();
        console.log(`Removed item, ${count} items remaining`);
      }
    }
    
    console.log('Cart cleared successfully');
  } catch (error) {
    console.error('Error clearing cart:', error instanceof Error ? error.message : 'Unknown error');
    // Continue anyway - cart might already be empty
  }
}

// ❌ WRONG: No cart cleanup
test.beforeEach(async ({ page }) => {
  await loginPage.login(user, pass);
  await productsPage.navigateTo();
  // Cart still has items from previous tests!
  // Badge won't increase when adding same product
});
```

**Why This Matters:**
```typescript
// Test 1: Add product A
await clickAddToCart(0);  // Badge: 0 → 1 ✅

// Test 2: Add product A again (without cleanup)
await clickAddToCart(0);  // Badge: 1 → 1 ❌ (same product!)
expect(badge).toBe(2);    // FAIL! Badge is still 1
```

---

### 7️⃣ Every Test Must Verify Something

**Problem**: Tests without assertions are useless  
**Solution**: Always include meaningful verification

```typescript
// ✅ CORRECT - Verifies products changed
test('Pagination changes products', async ({ page }) => {
  const before = await productsPage.getProductByIndex(0);
  await productsPage.clickPaginationButton(2);
  const after = await productsPage.getProductByIndex(0);
  expect(before.name).not.toBe(after.name); // VERIFICATION
});

// ❌ WRONG - No verification
test('Click pagination', async ({ page }) => {
  await productsPage.clickPaginationButton(2);
  // Missing: What are we verifying?
});
```

---

### 8️⃣ No Duplicate Tests

**Problem**: Multiple tests doing same thing  
**Solution**: Each test verifies unique aspect

```typescript
// ✅ CORRECT - Different verifications
test('TEST-018: Pagination changes products', async () => {
  // Verify data changed
  expect(productBefore).not.toBe(productAfter);
});

test('TEST-019: Pagination button active state', async () => {
  // Verify UI state changed
  expect(await isButtonActive(2)).toBeTruthy();
});

// ❌ WRONG - Duplicate
test('Test 1', async () => { await clickButton(); });
test('Test 2', async () => { await clickButton(); }); // Same thing!
```

---

## 🔧 MCP Playwright Tools Available

### Browser Control
- `browser_navigate` - Navigate to URL
- `browser_navigate_back` - Go back
- `browser_close` - Close page
- `browser_resize` - Resize window
- `browser_tabs` - Manage tabs

### Interactions
- `browser_click` - Click element
- `browser_type` - Type text
- `browser_fill_form` - Fill multiple fields
- `browser_select_option` - Select dropdown
- `browser_drag` - Drag and drop
- `browser_hover` - Hover element
- `browser_press_key` - Keyboard input
- `browser_file_upload` - Upload files

### Information Gathering
- `browser_snapshot` - Accessibility snapshot (preferred)
- `browser_take_screenshot` - Screenshot
- `browser_evaluate` - Run JavaScript
- `browser_console_messages` - Get console logs
- `browser_network_requests` - Get network activity

### Utilities
- `browser_handle_dialog` - Handle alerts/confirms
- `browser_wait_for` - Wait for conditions
- `browser_run_code` - Execute Playwright code
- `browser_install` - Install browser

---

## 🎯 Pages to Test

### 📝 Register Page - `http://127.0.0.1:5000/web/register`

#### Elements to Validate
- Full Name input
- Email Address input
- Password input (hidden)
- Phone Number input
- Address textarea
- Register button
- Login link

#### Test Scenarios

**Guest User (Not Logged In)**
- ✅ All fields visible and functional
- ✅ Correct labels displayed
- ✅ Navigation to login works

**Logged In Users (Admin/Normal)**
- ✅ Cannot access without alert

**Validations to Test**
| Field | Test Cases |
|-------|-----------|
| **Name** | • <3 chars: "Name must be at least 3 characters long"<br>• =3 chars: Boundary (valid)<br>• Empty field |
| **Email** | • Missing @: "Invalid email format"<br>• Empty field<br>• Valid format |
| **Password** | • <6 chars: "Password must be at least 6 characters"<br>• No number: "Must contain at least one number"<br>• No letter: "Must contain at least one letter"<br>• Password hidden (type="password") |
| **Phone** | • <8 chars: "Must be between 8 and 20 characters"<br>• =8 chars: Boundary (valid)<br>• =20 chars: Boundary (valid)<br>• >20 chars: Too long<br>• Contains letters: "Must contain only numbers and +"<br>• Empty: "Phone number is required" |
| **Address** | • Empty: "Address is required" |
| **Registration** | • Existing user: "User already exists"<br>• Success: Navigate to `/web/login` |

---

### 🔐 Login Page - `http://127.0.0.1:5000/web/login`

#### Elements to Validate
- Email Address input
- Password input (hidden)
- Login button
- Register link

#### Test Scenarios

**Validations to Test**
- ✅ Empty fields: "please fil data"
- ✅ Invalid email (no @): Error message
- ✅ Wrong credentials: "Invalid credentials"
- ✅ Password hidden
- ✅ Success: Navigate to `/web/products`
- ✅ Admin login shows Admin link
- ✅ Normal user login shows Profile/Wishlist/Notifications

---

### 🏠 Homepage - `http://127.0.0.1:5000/`

#### Test by User State

**Guest User (Not Logged In)**
- Shop Now button → `/web/products`
- Shop by Category (10 categories)
- Cart/Orders → "Please login to continue" alert
- Login/Register links visible

**Normal User (Logged In)**
- Shop Now button → `/web/products`
- Cart/Orders accessible
- Profile, Wishlist, Notifications visible
- Logout button functional
- NO Admin link

**Admin User (Logged In)**
- All normal user features
- Admin link visible and functional
- Access to `/web/admin`

#### Sections to Validate
- ✅ Why Choose Us (3 cards)
- ✅ Shop by Category (10 categories)
- ✅ Logo navigation
- ✅ Footer visibility
- ✅ Navbar state changes

---

### 🛍️ Products Page - `http://127.0.0.1:5000/web/products`

#### Elements per Product Card
- Product Name
- Category
- Price ($XX.XX format - 2 decimals)
- Stock ("Stock: N")
- View Details button
- Add to Cart button
- Like/Unlike button (❤️/🤍)
- Like count (when unliked)

#### Features to Test

**Search**
- ✅ Valid term: Shows matching products
- ✅ No results: "No products found" or empty

**Category Filter**
- ✅ All Categories
- ✅ Electronics
- ✅ Clothing
- ✅ Books
- ✅ Home & Garden
- ✅ Accessories

**Price Filter**
- ✅ Valid range (min < max)
- ✅ Invalid: min > max
- ✅ Negative values
- ✅ Clear filters resets all

**Interactions**
- ✅ Add to Cart → Alert "Added to cart!" + badge increment
- ✅ Like button → Toggle state + count update
- ✅ View Details → Navigate to `/web/products/{id}`

**Pagination**
- ✅ Click page number → Products change
- ✅ Active button styling applied
- ✅ Last page shows products

---

---

### 🛍️ Cart Page - `http://127.0.0.1:5000/web/cart` #new

#### Elements per Product Card
- [guest] Add to Cart button : dynamic locator
- [guest] navigate to cart when guest accoumt
- [login] Your cart is empty label when cart empty
- [login] Total: $0.00 when cart empty
- [login] Subtotal: $0.00 when cart empty
- [login] Proceed to Checkout button when cart empty
- [login] Clear Cart button when cart empty
- [login] Add to Cart button : dynamic locator
- [login] Product Name : dynamic locator
- [login] Product Price : dynamic locator [double 2 digits]
- [login] item-quantity : dynamic locator
- [login] item btn-increase, btn-decrease : dynamic locators : dynamic locators
- [login] item-total : dynamic locator [double 2 digits]
- [login] cart-subtotal : [double 2 digits]
- [login] cart-total : [double 2 digits]
- [login] Proceed to Checkout button when cart empty
- [login] Clear Cart button when cart empty
- [login] btn-remove : dynamic locator

#### Features to Test

**Counter**
- ✅ Increasement
- ✅ Decreasement
- ✅ Invalid values
- ✅ Boundary values

**any money**
- ✅ Calculations update
- ✅ Data type : [double 2 digits]

**alerts**
- ✅ Confirm
- ✅ Cancel
- ✅ alert message

**Checkout**
- Enter shipping address: input
- button in guest and login

**Interactions**
- ✅ Add many products to Cart → Alert "Added to cart!" + badge increment for unique items
- increase quantity and calculate money
- remove one item
- remove all items
- navigation to cart as guest
- navigation to cart as user
- observe empty cart
- test chout shipping address valid and invalid data
- check orders pending in products page
---

## 📦 Output Requirements

### 1️⃣ Page Object Model (POM) Files


**Requirements**
- TypeScript with proper types
- Each page has own locators
- Reusable methods
- Extends BasePage for common elements

---

### 2️⃣ Test Scripts

**Requirements**
- ✅ Full regression coverage
- ✅ **Smart waits** - Wait for specific conditions, NOT arbitrary delays
- ✅ **Soft assertions** - Continue after failures
- ✅ **UI + Functional** validation
- ✅ **Screenshot/Video** on failure (wait for image load first)
- ✅ Handle **dynamic indexes** intelligently
- ✅ Test all user states (guest, normal user, admin)
- ✅ Every test has meaningful assertion


---

### 3️⃣ Data Files

**users.json**
```json
{
  "admin": {
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  },
  "validUser": {
    "email": "test@test.test",
    "password": "test@123",
    "role": "user"
  }
}
```

**data.json**
- Validation test data
- Expected error messages
- Search terms
- Filter values
- any other relevant data for data driven tests

---

### 4️⃣ Test Case Documentation

**CSV Format** (one file per feature)
```csv
Test ID, Test Objective, Test Case Details, Test Data, Pre-Condition, Test Steps, Post-Condition, Expected Results
```

**Files**
- `testname-testcases.csv`
---

### 5️⃣ Reporting

**Multi-Reporter Configuration** (REQUIRED)

Playwright supports multiple reporters simultaneously. Configure as an array:

```typescript
reporter: [
  // 1. HTML Reporter (built-in)
  ['html', { 
    outputFolder: 'playwright-report', 
    open: 'never' 
  }],
  
  // 2. Monocart Reporter (enhanced reporting with trends)
  ['monocart-reporter', {
    name: 'E-Commerce Test Report',
    outputFile: './monocart-report/index.html',
    coverage: {
      entryFilter: (entry: any) => true,
      sourceFilter: (sourcePath: string) => sourcePath.search(/src\//) !== -1
    },
    trend: './monocart-report/trend',
    logging: 'error',
    // Prevent duplication in failure reports
    attachmentPath: (currentPath: string, extras: any) => {
      return currentPath;
    },
    onEnd: (result: any) => {
      // Ensures retries don't create duplicate entries
    }
  }],
  
  // 3. List Reporter (console output)
  ['list']
],
```

**Required Features:**
- ✅ Multiple reporters in array format
- ✅ HTML test report enabled
- ✅ Monocart reporter for enhanced reports with trends
- ✅ Screenshot on failure (wait for load)
- ✅ Video on failure (full test steps)
- ✅ Trace files for debugging
- ✅ List reporter for console output

**Installation:**
```bash
npm install --save-dev monocart-reporter
```

---

### 6️⃣ Project Structure

```
playwright-tests/
├── pages/                    # POM classes (.ts)
├── tests/                    # Test specs (.ts)
├── data/                     # JSON data files
├── test-cases/               # CSV documentation
├── utils/                    # Helper utilities
├── playwright-report/        # HTML test report (auto-generated)
├── monocart-report/          # Monocart report with trends (auto-generated)
│   └── trend/                # Historical trend data
├── test-results/             # Test artifacts (screenshots, videos, traces)
├── playwright.config.ts      # Playwright configuration (multi-reporter)
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
├── .gitignore                # Exclude reports and artifacts
└── README.md
```

**Note**: Report folders (`playwright-report/`, `monocart-report/`, `test-results/`) are auto-generated and should be in `.gitignore`.

---

### 7️⃣ Configuration File

**playwright.config.ts** must include:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 4,
  
  // ✅ CRITICAL: Multiple reporters in array format
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['monocart-reporter', {
      name: 'Project Test Report',
      outputFile: './monocart-report/index.html',
      coverage: {
        entryFilter: (entry: any) => true,
        sourceFilter: (sourcePath: string) => sourcePath.search(/src\//) !== -1
      },
      trend: './monocart-report/trend',
      logging: 'error',
      // Prevent duplication in failure reports
      attachmentPath: (currentPath: string, extras: any) => {
        return currentPath;
      },
      onEnd: (result: any) => {
        // Ensures retries don't create duplicate entries
      }
    }],
    ['list']
  ],
  
  use: {
    baseURL: 'http://127.0.0.1:5000',
    headless: false,              // Headed mode
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    navigationTimeout: 15000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

**Key Configuration Points:**
- ✅ Multiple reporters in array format (HTML + Monocart + List)
- ✅ Screenshot/video on failure
- ✅ Trace on failure for debugging
- ✅ TypeScript configuration with proper types
- ✅ **Sequential execution** (`workers: 1`) for tests with shared state
- ✅ **Increased timeouts** (30s navigation) for stability

---

## ⚠️ CRITICAL: Parallel Execution & Test Isolation

### Default Configuration: Sequential Execution

**Why Sequential?**
- ✅ Tests share application state (cart, session, database)
- ✅ No race conditions or flaky tests
- ✅ Predictable, stable results
- ✅ Easier debugging

**Configuration:**
```typescript
export default defineConfig({
  fullyParallel: false,  // Disable parallel
  workers: 1,            // Sequential execution
  retries: process.env.CI ? 2 : 1,
  
  use: {
    actionTimeout: 15000,
    navigationTimeout: 30000,  // Increased for stability
  }
});
```

---

### When Tests Share State (DO NOT Use Parallel)

**Shared State Examples:**
- ❌ Cart operations (add, remove, view cart)
- ❌ User session (login, logout, profile)
- ❌ Database modifications (CRUD operations)
- ❌ File system operations
- ❌ Global variables or singletons

**Problems with Parallel + Shared State:**
```typescript
// Test 1 (Worker 1): Adds item to cart
// Test 2 (Worker 2): Checks cart count = 0 ❌ FAILS! (sees item from Test 1)
// Test 3 (Worker 3): Clears cart
// Result: All tests become flaky!
```

---

### Parallel Execution Requirements (Advanced)

**Only enable parallel if ALL conditions met:**
- [ ] Each test uses **separate user accounts** (user1, user2, user3, user4)
- [ ] Each test has **isolated data** (separate database/schema)
- [ ] Server can handle **concurrent load** (4+ simultaneous requests)
- [ ] Tests are **fully independent** (no shared state)
- [ ] **Cleanup hooks** reset state after each test
- [ ] All tests pass **100% sequentially** first

**Example with Isolation:**
```typescript
export default defineConfig({
  fullyParallel: true,
  workers: 4,
  
  projects: [
    {
      name: 'worker-1',
      use: { storageState: './auth/user1.json' },  // Separate user
    },
    {
      name: 'worker-2',
      use: { storageState: './auth/user2.json' },  // Different user
    },
    // ... each worker gets its own user
  ],
});
```

---

### Common Parallel Execution Failures

#### 1. Cart Badge Race Condition ❌
```typescript
// FAILS in parallel:
test('Add to cart', async () => {
  const initialCount = await getCartBadgeCount();  // Gets count from another test!
  await clickAddToCart();
  // Use exact match, not >=
  expect.soft(await getCartBadgeCount()).toBe(initialCount + 1);  // ❌ Flaky in parallel
});
```

**Solution:** Sequential execution or separate user carts

**Best Practice:**
```typescript
// ✅ CORRECT: Use exact match for cart count
expect.soft(newCount).toBe(initialCount + 1);  // Exactly +1

// ❌ WRONG: Too lenient
expect.soft(newCount).toBeGreaterThanOrEqual(initialCount + 1);  // Could be +2, +3, etc.
```

#### 2. NetworkIdle Timeout ❌
```typescript
// FAILS with 4 workers:
await page.goto('/web/products');
await page.waitForLoadState('networkidle', { timeout: 15000 });
// TimeoutError: Server overloaded with 4 simultaneous requests
```

**Solution:** Increase timeout to 30000ms or use sequential

#### 3. Session Conflicts ❌
```typescript
// Test 1: Logs in as user@test.com
// Test 2: Logs out (affects Test 1's session!)
// Test 1: ❌ FAILS - session cleared by Test 2
```

**Solution:** Each test uses different user or run sequentially

---

### Debugging Parallel Failures

**Step 1:** Test sequentially first
```bash
npx playwright test --workers=1
```

**Step 2:** If passes with `workers=1` but fails with `workers=4`, you have shared state issues.

**Step 3:** Add logging to identify conflicts
```typescript
console.log('Worker:', process.env.TEST_WORKER_INDEX);
console.log('Cart count:', await getCartCount());
```

**Step 4:** Switch to sequential execution or implement proper isolation.

---

### Configuration Decision Tree

```
Do tests modify shared state (cart, session, DB)?
  ├─ YES → Use sequential (workers: 1)
  └─ NO → Can you create isolated environments?
      ├─ YES → Use parallel (workers: 4) with isolation
      └─ NO → Use sequential (workers: 1)
```

---

### Best Practices

1. ✅ **Start Sequential:** Always begin with `workers: 1`
2. ✅ **Test Stability:** Ensure 100% pass rate before parallelizing
3. ✅ **Increase Timeouts:** Use 30s+ for navigation with multiple workers
4. ✅ **Isolate Data:** Separate users, databases, or sessions
5. ✅ **Document Dependencies:** Note which tests share state
6. ✅ **Monitor Flakiness:** Track test stability over time

**Remember: Stable sequential tests > Fast flaky parallel tests!** 🎯

---

## 🎯 Goal

**Create a complete, stable, regression-ready Playwright test suite that:**
- ✅ Uses TypeScript for type safety
- ✅ Follows POM architecture
- ✅ Implements data-driven approach
- ✅ Uses smart waits (no arbitrary delays)
- ✅ Includes comprehensive validations (BVA + EP)
- ✅ Tests all user states
- ✅ Has proper error handling
- ✅ Generates professional reports
- ✅ Is runnable without AI assistance
- ✅ All tests pass before delivery

---

## 📊 Quality Checklist

Before delivering, verify:
- [ ] All files are TypeScript (.ts)
- [ ] Every test has meaningful assertion
- [ ] No duplicate tests
- [ ] **Cart cleanup in beforeEach** (critical for E-commerce tests)
- [ ] **clearCart()** method added to BasePage
- [ ] Scroll before EVERY interaction (clicks, getAttribute, isVisible, etc.)
- [ ] Use exact text matching for dynamic elements (regex `/^text$/`)
- [ ] Smart waits used (not arbitrary delays)
- [ ] BVA and EP or any blackbox techniques applied
- [ ] All user states tested
- [ ] Screenshot/video on failure waiting for load images if applicable
- [ ] Error handling implemented
- [ ] All tests pass successfully
- [ ] POM structure followed
- [ ] Data-driven approach with JSON files
- [ ] Test cases documented in CSV
- [ ] TypeScript compilation passes: `npx tsc --noEmit`
- [ ] Cart badge tests understand UNIQUE products count behavior

---

**Now, begin test automation using MCP Playwright Server tools! 🚀**
