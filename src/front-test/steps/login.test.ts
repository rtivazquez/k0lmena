import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { accountLocators } from '../locators/accountLocator';
import { getPage } from '../hooks/hook';

const loginPage = new LoginPage();

Given('the user navigates to the login page', async () => {
  await loginPage.goto();
});

When('the user enters valid credentials and clicks the login button', async () => {
  await loginPage.login();
});

Then('the user should be redirected to the dashboard of Salesforce', async () => {
  const page = getPage();

  await expect(page).toHaveURL(/\/lightning\//, { timeout: 30_000 });

    await expect(accountLocators.accountsTab(page)).toBeVisible({ timeout: 30_000 });
  });