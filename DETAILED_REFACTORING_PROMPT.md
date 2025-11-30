# Detailed Refactoring Prompt for Playwright Test Classes

This prompt provides comprehensive guidance for refactoring Playwright test classes and page objects to follow professional best practices using the Page Object Model (POM) pattern with playwright-mcp server integration.

## 1. Programming Languages and Frameworks

- **Primary Language**: TypeScript (ESNext)
- **Testing Framework**: Playwright Test (v1.40.0+)
- **Reporting**: monocart-reporter (v2.9.23+)
- **Build Tool**: TypeScript Compiler (v5.9.3+)
- **Module System**: CommonJS with Node module resolution
- **Runtime**: Node.js environment with @types/node

## 2. Refactoring Requirements and Objectives

### Key Refactoring Goals:
1. Remove all artificial timeouts (`page.waitForTimeout()`) and replace with proper Playwright waiting mechanisms
2. Implement proper Page Object Model (POM) pattern with separation of concerns
3. Add comprehensive TypeScript typing and interfaces for type safety
4. Implement JSDoc documentation for all methods
5. Follow Arrange-Act-Assert (AAA) pattern in all tests
6. Add proper error handling with meaningful error messages
7. Create reusable helper functions to reduce code duplication
8. Ensure all tests use proper Playwright waiting mechanisms instead of fixed timeouts
9. Integrate data-driven testing using JSON files from @data/** directory
10. Integrate with playwright-mcp for enhanced server-side capabilities

### Page Object Refactoring Requirements:
- All locators defined as readonly properties in constructor
- No locators created inline in methods
- Locators use stable, maintainable selectors
- Replace all `page.waitForTimeout()` with proper waiting mechanisms:
  - `waitFor({ state: 'visible' })` for element visibility
  - `waitForLoadState('networkidle')` for page readiness
  - `waitForURL()` for navigation verification
  - Custom wait methods for specific conditions
- Create reusable methods for all user actions
- Create validation methods that use Playwright's `expect`
- Create navigation methods with proper waiting
- Add proper try-catch blocks where needed
- Add meaningful error messages
- Handle edge cases gracefully
- Add JSDoc comments to all public methods
- Add proper type annotations
- Create interfaces for complex return types
- Use type safety throughout
- Remove `any` types

### Test Spec Refactoring Requirements:
- Remove all direct page calls (`page.locator()`, `page.waitForSelector()`, etc.)
- Replace with page object methods
- Remove all `page.waitForTimeout()` calls
- Follow Arrange-Act-Assert (AAA) pattern in all tests
- Add clear comments for each section (Arrange/Act/Assert)
- Use descriptive test names
- Group related tests with `test.describe()`
- Extract common setup logic into helper functions
- Move all validation logic to page objects
- Tests should only call page object methods
- Page object methods should use `expect` internally
- Tests should be declarative, not imperative
- Implement data-driven testing by importing test data from @data/** JSON files
- Use test data for user credentials, product information, and other test parameters
- Create parameterized tests when appropriate using test data
- Replace ALL hardcoded values in tests with data from JSON files
- Never use hardcoded strings, numbers, or credentials directly in test logic

## 3. Expected Refactoring Outcomes and Quality Standards

### Data-Driven Testing Implementation:
- **JSON Data Files**: All test data stored in structured JSON files in @data/** directory
- **Parameterized Tests**: Tests use data from JSON files instead of hardcoded values
- **Maintainable Data**: Test data easily updated in JSON files without modifying test code
- **Multiple Scenarios**: Single test can validate multiple data sets using test data
- **Data Separation**: Clear separation between test logic and test data
- **Reusable Data**: Same data structures can be used across multiple test files

### Code Quality Metrics:
- **Zero instances** of `page.waitForTimeout()` calls
- **Proper waiting mechanisms** throughout:
  - `waitFor({ state: 'visible' })` for element visibility
  - `waitForLoadState('networkidle')` for page readiness
  - `waitForURL()` for navigation verification
  - Custom wait methods for specific conditions
- **Comprehensive JSDoc** for all methods and classes
- **TypeScript interfaces** for complex objects with proper typing
- **Single responsibility principle** applied to all methods
- **DRY (Don't Repeat Yourself)** principle implemented through helper functions
- **Code duplication** reduced through reusable methods
- **Proper error handling** with meaningful messages throughout

### Performance Improvements:
- **Faster test execution** due to condition-based waits instead of fixed timeouts
- **More reliable tests** that adapt to actual page state
- **Better debugging capabilities** with clear error messages and proper element waiting
- **Reduced flakiness** through proper synchronization mechanisms

### Maintainability:
- **Easy to update and extend** with clear separation of concerns
- **Declarative test logic** that is easy to read and understand
- **Reusable components** that can be used across multiple tests
- **Consistent code style** following established patterns

## 4. Validation Criteria for Successful Implementation

### Code Quality Verification:
- ✅ Run `npx tsc --noEmit` - No TypeScript errors
- ✅ Run linter - Fix all warnings (or document why they're acceptable)
- ✅ No `waitForTimeout()` calls remain in any files
- ✅ No direct page method calls in test files
- ✅ All methods have proper JSDoc comments
- ✅ No hardcoded values remain in test files - all data comes from JSON files

### Page Object Model Compliance:
- ✅ All locators in page objects
- ✅ All actions in page objects
- ✅ All validations in page objects
- ✅ Test files only contain test logic
- ✅ Proper separation of concerns maintained

### Functionality Verification:
- ✅ Run tests: `npx playwright test tests/[spec-name].spec.ts`
- ✅ All tests pass without modifications to test logic
- ✅ No regressions introduced
- ✅ Test execution time improved (no artificial delays)
- ✅ All expected behaviors still function as before

### Documentation Verification:
- ✅ Update `TEST_ORGANIZATION.md` with test table
- ✅ Update `REFACTORING_SUMMARY.md` if needed
- ✅ All methods have proper JSDoc comments
- ✅ Complex interfaces are properly documented

## 5. Constraints and Special Considerations

### Project Configuration Constraints:
- **Timeouts**: Global timeout of 60000ms, expect timeout of 10000ms
- **Workers**: Sequential execution (workers: 1) to avoid state conflicts
- **Parallel Execution**: Disabled (fullyParallel: false) for tests with shared state
- **Navigation Timeout**: 30000ms increased for parallel/sequential execution
- **Action Timeout**: 15000ms for actions
- **Viewport**: 1280x720 resolution
- **Headless**: Disabled by default (headless: false)

### Path Alias Configuration:
- `@pages/*` → `pages/*`
- `@tests/*` → `tests/*`
- `@utils/*` → `utils/*`
- `@data/*` → `data/*`

### Type Safety Constraints:
- Strict TypeScript compilation enabled
- No `any` types allowed
- Proper interfaces for complex return types
- Type annotations required for all methods

### Integration Considerations:
- Must maintain compatibility with existing test execution workflows
- Should work with existing CI/CD pipelines
- Maintain backward compatibility where possible
- Preserve existing test IDs and descriptions in documentation

## 6. Implementation Instructions

### Step-by-Step Refactoring Process:

#### Phase 1: Preparation
1. **Identify Files to Refactor**
   - Locate the test spec file (e.g., `tests/login.spec.ts`)
   - Identify the corresponding page object (e.g., `pages/LoginPage.ts`)
   - Check for any related page objects that might need updates
   - Review existing test cases and their requirements

2. **Assess Current State**
   - Count number of `page.waitForTimeout()` calls in test file
   - Count number of `page.waitForTimeout()` calls in page object
   - Identify direct locator usage in test file (`page.locator()`, `page.waitForSelector()`)
   - Identify direct page method calls (`page.waitForURL()`, `page.waitForLoadState()`)
   - Review test structure (AAA pattern compliance)
   - Check for code duplication

#### Phase 2: Page Object Refactoring
1. **Define Locators**
   - Convert all inline locators to readonly properties in constructor
   - Use stable, maintainable selectors (prefer data-testid attributes)
   - Follow consistent naming conventions

2. **Remove Timeouts**
   - Replace all `page.waitForTimeout()` with proper waiting mechanisms
   - Use `waitFor({ state: 'visible' })` for element visibility
   - Use `waitForLoadState('networkidle')` for page readiness
   - Use `waitForURL()` for navigation verification
   - Create custom wait methods for specific conditions

3. **Add Methods**
   - Create reusable methods for all user actions
   - Create validation methods that use Playwright's `expect`
   - Create navigation methods with proper waiting
   - Create helper methods for common operations
   - Ensure each method has single responsibility

4. **Implement Error Handling**
   - Add proper try-catch blocks where needed
   - Add meaningful error messages
   - Handle edge cases gracefully
   - Use Playwright's built-in retry mechanisms

5. **Add Documentation**
   - Add JSDoc comments to all public methods
   - Document parameters and return types
   - Add class-level documentation
   - Document complex logic

6. **Enhance Type Safety**
   - Add proper type annotations
   - Create interfaces for complex return types
   - Use type safety throughout
   - Remove `any` types

#### Phase 3: Test Spec Refactoring
1. **Remove Direct Page Calls**
   - Remove all `page.locator()` calls
   - Remove all `page.waitForSelector()` calls
   - Remove all `page.waitForURL()` calls
   - Remove all `page.waitForLoadState()` calls
   - Remove all `page.waitForTimeout()` calls
   - Replace with page object methods

2. **Reorganize Test Structure**
   - Follow Arrange-Act-Assert (AAA) pattern in all tests
   - Add clear comments for each section (Arrange/Act/Assert)
   - Use descriptive test names
   - Group related tests with `test.describe()`

3. **Extract Helper Functions**
   - Extract common setup logic into helper functions
   - Extract common teardown logic into helper functions
   - Create reusable test data setup functions
   - Use test fixtures where appropriate

4. **Move Validation Logic**
   - Move all validation logic to page objects
   - Tests should only call page object methods
   - Page object methods should use `expect` internally
   - Tests should be declarative, not imperative

5. **Implement Data-Driven Testing**
   - Import test data from JSON files in @data/** directory
   - Use structured data from data.json and users.json for test parameters
   - Create parameterized tests when appropriate
   - Replace hardcoded values with data from JSON files
   - Organize test data logically (credentials, products, error messages, etc.)

#### Phase 4: Validation and Testing
1. **Code Quality Checks**
   - Run `npx tsc --noEmit` - Verify no TypeScript errors
   - Run linter - Fix all warnings
   - Verify no `waitForTimeout()` calls remain
   - Verify no direct page method calls in test file

2. **Functionality Verification**
   - Run tests: `npx playwright test tests/[spec-name].spec.ts`
   - Verify all tests pass
   - Verify no regressions introduced
   - Verify test execution time improved

3. **Documentation Updates**
   - Update `TEST_ORGANIZATION.md` with test table
   - Update `REFACTORING_SUMMARY.md` if needed
   - Document any breaking changes
   - Add migration notes if applicable

### Common Pattern Implementations:

#### Navigation Pattern:
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

#### Validation Pattern:
```typescript
// In Page Object
async validateElementVisible(): Promise<void> {
  await expect(this.element).toBeVisible();
}
```

#### Action Pattern:
```typescript
// In Page Object
async performAction(): Promise<void> {
  await this.button.waitFor({ state: 'visible' });
  await this.button.click();
  await this.page.waitForLoadState('networkidle');
}
```

#### Dialog Handling Pattern:
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

#### Data-Driven Testing Pattern:
```typescript
// Import test data
import testData from '../data/data.json';
import users from '../data/users.json';

// Use test data in tests
test('Example data-driven test', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);

  // Use data from JSON files
  const { email, password } = testData.login.validCredentials;

  // Act
  await loginPage.login(email, password);

  // Assert
  await expect(page.url()).toContain('/dashboard');
});

// Parameterized test example
test.describe('Parameterized tests', () => {
  const invalidCredentials = [
    { email: testData.login.invalidCredentials.wrongEmail, password: testData.login.validCredentials.password },
    { email: testData.login.validCredentials.email, password: testData.login.invalidCredentials.wrongPassword }
  ];

  invalidCredentials.forEach(({ email, password }) => {
    test(`Validate login fails with invalid credentials: ${email}`, async ({ page }) => {
      // Test implementation using parameters
    });
  });
});
```

## 7. playwright-mcp Integration Guidelines

### Server-Side Capabilities:
- When implementing playwright-mcp server integration, ensure all client-side methods have appropriate server-side equivalents
- Use the MCP server for complex operations that might benefit from server-side processing
- Maintain consistent API between client and server implementations
- Implement proper error propagation from server to client

### Communication Patterns:
- Ensure all server-side operations follow the same timeout and error handling patterns
- Use the same TypeScript interfaces for data exchange between client and server
- Implement proper serialization/deserialization for complex objects
- Maintain consistent logging and reporting across client and server

### Performance Monitoring:
- Use MCP server metrics to monitor performance improvements
- Track execution time differences between client and server implementations
- Monitor resource usage on both client and server
- Ensure server-side operations don't introduce new bottlenecks

## 8. Success Criteria

A refactored test class is considered complete when:

1. ✅ **Zero timeouts**: No `waitForTimeout()` calls anywhere
2. ✅ **Pure POM**: No direct page method calls in test file
3. ✅ **Clean tests**: Tests are declarative and easy to read
4. ✅ **Reusable methods**: Common operations are in page objects
5. ✅ **Type safe**: Proper TypeScript typing throughout
6. ✅ **Documented**: JSDoc comments for all methods
7. ✅ **Tested**: All tests pass after refactoring
8. ✅ **Maintainable**: Easy to update and extend
9. ✅ **Data-driven**: Uses JSON data from @data/** directory
10. ✅ **No hardcoded values**: All test data comes from JSON files, no hardcoded strings/credentials in test logic
11. ✅ **MCP integrated**: Properly integrated with playwright-mcp server where applicable
12. ✅ **Performance improved**: Execution time reduced from timeout-based approach