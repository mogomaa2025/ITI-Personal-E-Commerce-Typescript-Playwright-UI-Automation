import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { faker } from '@faker-js/faker';
import usersData from '../data/users.json';
import urlsData from '../data/urls.json';
import authData from '../data/auth.json';
import { BasePage } from '../pages/BasePage';

test.describe('Auth Tests', () => {
    let loginPage: LoginPage;
    let registerPage: RegisterPage;
    let basePage: BasePage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        registerPage = new RegisterPage(page);
        basePage = new BasePage(page);
    });

    test('AT-TC-001: Successful user registration', async ({ page }) => {
        await page.goto(urlsData.registerUrl);
        await expect(registerPage.registerCart).toMatchAriaSnapshot(registerPage.registerFormSnapshot);
        await expect(registerPage.registerButton).toBeVisible();
        await registerPage.register({
            name: faker.person.firstName(),
            email: faker.internet.email(),
            password: "1" + faker.internet.password(),
            phone: "+2010" + faker.number.int({ min: 1000000, max: 9999999 }),
            address: faker.location.streetAddress()
        });
        await expect(registerPage.userSuccessRegisterALert).toBeVisible();
    });

    test('AT-TC-002: Verify registration with existing email fails', async ({ page }) => {
        await page.goto(urlsData.registerUrl);
        await registerPage.register({
            name: faker.person.firstName(),
            email: usersData.validUser.email,
            password: "1" + faker.internet.password(),
            phone: "+2010" + faker.number.int({ min: 1000000, max: 9999999 }),
            address: faker.location.streetAddress()
        });
        await expect(registerPage.userAlreadyExistsAlert).toBeVisible();
    });

    test('AT-TC-003: Verify registration with invalid email fails', async ({ page }) => {
        await page.goto(urlsData.registerUrl);
        await registerPage.register({
            name: faker.person.firstName(),
            email: "invalid-email",
            password: "1" + faker.internet.password(),
            phone: "+2010" + faker.number.int({ min: 1000000, max: 9999999 }),
            address: faker.location.streetAddress()
        });
        // await expect(registerPage.getEmailValidationMessage()).toContainText("Please"); // cuz work with strings and promises error
        // await expect(registerPage.getEmailValidationMessage()).resolves.toContain("Please"); //solution 1 : use resolves for promises
        const message = await registerPage.getEmailValidationMessage(); // soluation 2 : use await
        expect(message).toContain("@");

    });



    test('AT-TC-004: Verify Registration with short password fails', async ({ page }) => {
        await page.goto(urlsData.registerUrl);
        await registerPage.register({
            name: faker.person.firstName(),
            email: faker.internet.email(),
            password: "123",
            phone: "+2010" + faker.number.int({ min: 1000000, max: 9999999 }),
            address: faker.location.streetAddress()
        });
        const message = await registerPage.getPasswordValidationMessage(); // cuz work with strings and promises
        expect(message).toContain(authData.passwordStrenght);
    });

    test('AT-TC-005: Successful user login', async ({ page }) => {
        await page.goto(urlsData.loginUrl);
        await expect(loginPage.loginCart).toMatchAriaSnapshot(loginPage.loginFormSnapshot);
        await loginPage.login(usersData.validUser.email, usersData.validUser.password);
        await expect(loginPage.successMessageAlert).toBeVisible();
    });

    test('AT-TC-006: Login with incorrect password fails', async ({ page }) => {
        await page.goto(urlsData.loginUrl);
        await loginPage.login(usersData.validUser.email, "wrongpassword");
        await expect(loginPage.errorMessageAlert).toBeVisible();
    });

    test('AT-TC-007: Login with unregistered email', async ({ page }) => {
        await page.goto(urlsData.loginUrl);
        await loginPage.login("Unregistered Email", usersData.validUser.password);
        const message = await loginPage.getEmailValidationMessage();
        expect(message).toContain(authData.email);
    });

    test('AT-TC-008: Login with empty email', async ({ page }) => {
        await page.goto(urlsData.loginUrl);
        await loginPage.login("", usersData.validUser.password);
        const message = await loginPage.getEmailValidationMessage();
        expect(message).toContain(authData.fillOut);
    });

    test('AT-TC-009: Login with empty password', async ({ page }) => {
        await page.goto(urlsData.loginUrl);
        await loginPage.login(usersData.validUser.email, "");
        const message = await loginPage.getPasswordValidationMessage();
        expect(message).toContain(authData.fillOut);
    });

    test('AT-TC-010: Login with empty credentials', async ({ page }) => {
        await page.goto(urlsData.loginUrl);
        await loginPage.login("", "");
        const message = await loginPage.getEmailValidationMessage();
        expect(message).toContain(authData.fillOut);
    });

    test('AT-TC-011: Successful user logout', async ({ page }) => {
        await page.goto(urlsData.loginUrl);
        await loginPage.login(usersData.validUser.email, usersData.validUser.password);
        await expect(loginPage.successMessageAlert).toBeVisible();
        await page.waitForLoadState('networkidle'); // saves time
        await expect(basePage.logoutButton).toBeVisible();
        await basePage.logoutButton.click();
        await page.waitForLoadState('networkidle'); // saves time
        await expect(basePage.logoutButton).not.toBeVisible();
    });

});