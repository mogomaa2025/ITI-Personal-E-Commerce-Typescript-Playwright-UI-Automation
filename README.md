# E-Commerce Playwright Test Automation Suite

## Overview
Comprehensive Playwright test automation suite for E-Commerce application using Page Object Model (POM), data-driven approach, soft assertions, and smart waits.

## Project Structure
```
playwright-tests3/
├── pages/              # Page Object Model classes
│   ├── BasePage.js     # Base page with common elements and methods
│   ├── RegisterPage.js # Register page objects and methods
│   ├── LoginPage.js    # Login page objects and methods
│   ├── HomePage.js     # Homepage objects and methods
│   └── ProductsPage.js # Products page objects and methods
├── tests/              # Test specifications
│   ├── register.spec.js # Register page tests (24 tests)
│   ├── login.spec.js    # Login page tests (15 tests)
│   ├── homepage.spec.js # Homepage tests (23 tests)
│   └── products.spec.js # Products page tests (24 tests)
├── data/               # Test data files
│   ├── users.json      # User credentials (admin, valid user, new user)
│   └── data.json       # Test data for validation scenarios
├── test-cases/         # Test case documentation
│   ├── register-testcases.csv
│   ├── login-testcases.csv
│   ├── homepage-testcases.csv
│   └── products-testcases.csv
├── utils/              # Utility functions
│   └── helpers.js      # Helper functions for waits and assertions
├── playwright.config.js # Playwright configuration
└── package.json        # Project dependencies and scripts
```

## Features
- ✅ **Page Object Model (POM)** - Maintainable and reusable page objects
- ✅ **Data-Driven Testing** - External JSON files for test data
- ✅ **Soft Assertions** - Tests continue after failures
- ✅ **Smart Waits** - Auto-wait for elements, alerts, and navigation
- ✅ **Boundary Value Analysis (BVA)** - Testing min/max boundaries
- ✅ **Equivalence Partitioning (EP)** - Valid/invalid input classes
- ✅ **Screenshots on Failure** - Automatic screenshot capture
- ✅ **Video Recording** - Video capture for failed tests
- ✅ **HTML Reports** - Comprehensive test reports
- ✅ **Multiple User States** - Tests for guest, user, and admin

## Test Coverage

### Register Page (24 tests)
- UI element visibility
- Form label verification
- Password masking
- Name validation (BVA: <3, =3, >3 characters)
- Email validation (with/without @, empty)
- Password validation (length, numbers, letters)
- Phone validation (BVA: <8, =8, =20, >20 characters, letters)
- Address validation
- Existing user registration
- Successful registration

### Login Page (15 tests)
- UI element visibility
- Form label verification
- Password masking
- Empty field validation
- Email format validation
- Invalid credentials
- Successful login (user and admin)
- Post-login navigation
- Navbar changes after login

### Homepage (23 tests)
- Guest user view
- Logged in user view
- Admin user view
- Shop Now button navigation
- Category navigation
- Cart/Orders access control
- Why Choose Us section
- Footer visibility
- Logout functionality

### Products Page (24 tests)
- Product display and UI
- Product card elements
- Price format validation
- View Details navigation
- Add to Cart functionality
- Like button toggle
- Search functionality (valid/invalid)
- Category filtering
- Price filtering (valid/invalid ranges)
- Clear filters
- Pagination (navigation, active state, last page)
- Multiple filters combined
- Stock display

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- E-Commerce application running on http://127.0.0.1:5000

## Installation
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Configuration
Edit `playwright.config.js` to customize:
- **baseURL**: Default is http://127.0.0.1:5000
- **headless**: Default is false (headed mode)
- **workers**: Default is 1 (single browser, no parallel)
- **viewport**: Default is 1280x720
- **actionTimeout**: Default is 10000ms
- **navigationTimeout**: Default is 15000ms
- **screenshot**: Default is 'only-on-failure'
- **video**: Default is 'retain-on-failure'

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headed mode
```bash
npm run test:headed
```

### Run specific test suite
```bash
npm run test:register   # Register page tests
npm run test:login      # Login page tests
npm run test:homepage   # Homepage tests
npm run test:products   # Products page tests
```

### View test report
```bash
npm run report
```

### Debug tests
```bash
npm run test:debug
```

## Test Data

### Users (data/users.json)
- **Admin**: admin@test.com / admin123
- **Valid User**: test@test.test / test@123
- **New User**: Template for registration tests

### Test Data (data/data.json)
- Register validation data (valid/invalid inputs)
- Login validation data
- Products search terms and filters
- Expected error messages

## Test Results
- **HTML Report**: `playwright-report/index.html`
- **Screenshots**: Captured on failure in test results
- **Videos**: Recorded for failed tests in test results
- **Traces**: Available for failed tests for debugging

## Best Practices Implemented
1. **Wait Strategies**: Smart waits for alerts, navigation, and dynamic content
2. **Error Handling**: Soft assertions to continue test execution
3. **Clean Code**: Reusable methods in page objects
4. **Test Independence**: Each test can run independently
5. **Data Management**: Centralized test data in JSON files
6. **Documentation**: CSV test case files for manual review
7. **Reporting**: Comprehensive HTML reports with screenshots

## Validation Techniques

### Boundary Value Analysis (BVA)
- Name: 2 chars (invalid), 3 chars (valid boundary)
- Password: 5 chars (invalid), 6 chars (valid boundary)
- Phone: 7 chars (invalid), 8 chars (valid), 20 chars (valid), 21 chars (invalid)

### Equivalence Partitioning (EP)
- Valid inputs: Properly formatted data
- Invalid inputs: Empty, malformed, out of range

## Known Limitations
- Tests require the application to be running
- Some validations depend on server-side behavior
- Dynamic product IDs may vary between test runs

## Maintenance
- Update `data/users.json` if user credentials change
- Update `data/data.json` if validation messages change
- Update page objects if UI selectors change
- Add new test cases to respective spec files

## Support
For issues or questions, refer to:
- Playwright Documentation: https://playwright.dev
- Test Case CSV files in `test-cases/` directory
- Code comments in page objects and test files

---
**Author**: Test Automation Engineer
**Version**: 1.0.0
**Last Updated**: 2025-11-23
