# Refactoring Checklist for Playwright Test Classes

This checklist should be used when refactoring any test spec and its corresponding page object to follow professional best practices and the Page Object Model pattern.

## 📋 Pre-Refactoring Checklist

### 1. Identify Files to Refactor
- [ ] Identify the test spec file (e.g., `tests/login.spec.ts`)
- [ ] Identify the corresponding page object (e.g., `pages/LoginPage.ts`)
- [ ] Check for any related page objects that might need updates
- [ ] Review existing test cases and their requirements

### 2. Review Current State
- [ ] Count number of `page.waitForTimeout()` calls in test file
- [ ] Count number of `page.waitForTimeout()` calls in page object
- [ ] Identify direct locator usage in test file (`page.locator()`, `page.waitForSelector()`)
- [ ] Identify direct page method calls (`page.waitForURL()`, `page.waitForLoadState()`)
- [ ] Review test structure (AAA pattern compliance)
- [ ] Check for code duplication

## 🔧 Refactoring Steps

### Step 1: Page Object Refactoring

#### 1.1 Locators
- [ ] All locators defined as readonly properties in constructor
- [ ] No locators created inline in methods
- [ ] Locators use stable, maintainable selectors
- [ ] Locators follow naming conventions

#### 1.2 Remove Timeouts
- [ ] Replace all `page.waitForTimeout()` with proper waiting mechanisms:
  - [ ] `waitFor({ state: 'visible' })` for element visibility
  - [ ] `waitForLoadState('networkidle')` for page readiness
  - [ ] `waitForURL()` for navigation verification
  - [ ] Custom wait methods for specific conditions
- [ ] Remove all artificial delays

#### 1.3 Add Methods
- [ ] Create reusable methods for all user actions
- [ ] Create validation methods that use Playwright's `expect`
- [ ] Create navigation methods with proper waiting
- [ ] Create helper methods for common operations
- [ ] Each method has single responsibility

#### 1.4 Error Handling
- [ ] Add proper try-catch blocks where needed
- [ ] Add meaningful error messages
- [ ] Handle edge cases gracefully
- [ ] Use Playwright's built-in retry mechanisms

#### 1.5 Documentation
- [ ] Add JSDoc comments to all public methods
- [ ] Document parameters and return types
- [ ] Add class-level documentation
- [ ] Document complex logic

#### 1.6 TypeScript
- [ ] Add proper type annotations
- [ ] Create interfaces for complex return types
- [ ] Use type safety throughout
- [ ] Remove `any` types

### Step 2: Test Spec Refactoring

#### 2.1 Remove Direct Page Calls
- [ ] Remove all `page.locator()` calls
- [ ] Remove all `page.waitForSelector()` calls
- [ ] Remove all `page.waitForURL()` calls
- [ ] Remove all `page.waitForLoadState()` calls
- [ ] Remove all `page.waitForTimeout()` calls
- [ ] Replace with page object methods

#### 2.2 Remove Timeouts
- [ ] Remove all `page.waitForTimeout()` calls
- [ ] Remove all `pageObject.page.waitForTimeout()` calls
- [ ] Use page object methods with proper waiting

#### 2.3 Test Structure
- [ ] Follow Arrange-Act-Assert (AAA) pattern in all tests
- [ ] Add clear comments for each section (Arrange/Act/Assert)
- [ ] Use descriptive test names
- [ ] Group related tests with `test.describe()`

#### 2.4 Helper Functions
- [ ] Extract common setup logic into helper functions
- [ ] Extract common teardown logic into helper functions
- [ ] Create reusable test data setup functions
- [ ] Use test fixtures where appropriate

#### 2.5 Validation Logic
- [ ] Move all validation logic to page objects
- [ ] Tests should only call page object methods
- [ ] Page object methods should use `expect` internally
- [ ] Tests should be declarative, not imperative

#### 2.6 Test Annotations
- [ ] Use `test.beforeEach()` for common setup
- [ ] Use `test.afterEach()` for cleanup if needed
- [ ] Use `test.describe()` for logical grouping
- [ ] Add test descriptions and tags if needed

### Step 3: Code Quality

#### 3.1 Code Organization
- [ ] Single responsibility principle
- [ ] DRY (Don't Repeat Yourself)
- [ ] Clear method names
- [ ] Logical method grouping

#### 3.2 Best Practices
- [ ] Use Playwright's built-in waiting mechanisms
- [ ] Avoid flaky selectors
- [ ] Use data-testid attributes when possible
- [ ] Follow Playwright's recommended patterns

#### 3.3 Type Safety
- [ ] No `any` types
- [ ] Proper interfaces for complex objects
- [ ] Type annotations for all methods
- [ ] Type-safe return values

## ✅ Post-Refactoring Verification

### 1. Code Quality Checks
- [ ] Run `npx tsc --noEmit` - No TypeScript errors
- [ ] Run linter - Fix all warnings (or document why they're acceptable)
- [ ] No `waitForTimeout()` calls remain
- [ ] No direct page method calls in test file

### 2. Page Object Model Compliance
- [ ] All locators in page object
- [ ] All actions in page object
- [ ] All validations in page object
- [ ] Test file only contains test logic

### 3. Functionality Verification
- [ ] Run tests: `npx playwright test tests/[spec-name].spec.ts`
- [ ] All tests pass
- [ ] No regressions introduced
- [ ] Test execution time improved (no artificial delays)

### 4. Documentation
- [ ] Update `TEST_ORGANIZATION.md` with test table
- [ ] Update `REFACTORING_SUMMARY.md` if needed
- [ ] Document any breaking changes
- [ ] Add migration notes if applicable

## 📝 Example Refactoring Pattern

### Before (Bad):
```typescript
test('Login test', async ({ page }) => {
  await page.goto('/web/login');
  await page.waitForTimeout(2000);
  await page.locator('input[placeholder="Enter your email"]').fill('test@test.com');
  await page.locator('input[placeholder="Enter your password"]').fill('password');
  await page.locator('button:has-text("Login")').click();
  await page.waitForTimeout(1000);
  expect(page.url()).toContain('/web/products');
});
```

### After (Good):
```typescript
test('Login test', async ({ page }) => {
  // Arrange
  loginPage = new LoginPage(page);
  
  // Act
  await loginPage.navigateTo();
  await loginPage.login('test@test.com', 'password');
  await loginPage.waitForPostLoginNavigation();
  
  // Assert
  expect(page.url()).toContain('/web/products');
});
```

## 🎯 Success Criteria

A refactored test class is considered complete when:

1. ✅ **Zero timeouts**: No `waitForTimeout()` calls anywhere
2. ✅ **Pure POM**: No direct page method calls in test file
3. ✅ **Clean tests**: Tests are declarative and easy to read
4. ✅ **Reusable methods**: Common operations are in page objects
5. ✅ **Type safe**: Proper TypeScript typing throughout
6. ✅ **Documented**: JSDoc comments for all methods
7. ✅ **Tested**: All tests pass after refactoring
8. ✅ **Maintainable**: Easy to update and extend

## 📚 Files to Update After Refactoring

1. **TEST_ORGANIZATION.md**
   - Add/update test table for the refactored spec
   - Update test descriptions and priorities

2. **REFACTORING_SUMMARY.md** (if creating new one)
   - Document changes made
   - List improvements
   - Note any breaking changes

3. **README.md** (if exists)
   - Update any examples
   - Document new patterns

## 🔄 Migration Path for Other Tests

When refactoring other test files, follow this order:

1. **Start with simpler tests** (e.g., `login.spec.ts`)
2. **Move to medium complexity** (e.g., `products.spec.ts`)
3. **Handle complex tests last** (e.g., `cart.spec.ts`)

For each test file:
1. Read the current implementation
2. Identify all violations of this checklist
3. Refactor page object first
4. Refactor test file second
5. Verify tests pass
6. Update documentation

## 📋 Quick Reference: Common Patterns

### Navigation Pattern
```typescript
// In Page Object
async navigateTo(): Promise<void> {
  await this.page.goto('/web/page', { waitUntil: 'networkidle' });
  await this.pageHeading.waitFor({ state: 'visible' });
}

async waitForPageNavigation(): Promise<void> {
  await this.page.waitForURL('**/web/page**', { timeout: 10000 });
}
```

### Validation Pattern
```typescript
// In Page Object
async validateElementVisible(): Promise<void> {
  await expect(this.element).toBeVisible();
}
```

### Action Pattern
```typescript
// In Page Object
async performAction(): Promise<void> {
  await this.button.waitFor({ state: 'visible' });
  await this.button.click();
  await this.page.waitForLoadState('networkidle');
}
```

### Dialog Handling Pattern
```typescript
// In Page Object
async clickWithDialog(accept: boolean): Promise<void> {
  const dialogPromise = new Promise<void>((resolve) => {
    this.page.once('dialog', async dialog => {
      if (accept) await dialog.accept();
      else await dialog.dismiss();
      resolve();
    });
  });
  await this.button.click();
  await dialogPromise;
}
```

## 🚀 Ready to Refactor?

Use this checklist step-by-step for each test class. Check off items as you complete them to track progress.

**Next files to refactor:**
- [ ] `tests/login.spec.ts` + `pages/LoginPage.ts`
- [ ] `tests/products.spec.ts` + `pages/ProductsPage.ts`
- [ ] `tests/product-details.spec.ts` + `pages/ProductDetailsPage.ts`
- [ ] `tests/cart.spec.ts` + `pages/CartPage.ts`
- [ ] `tests/register.spec.ts` + `pages/RegisterPage.ts`
- [ ] `tests/homepage.spec.ts` + `pages/HomePage.ts`

