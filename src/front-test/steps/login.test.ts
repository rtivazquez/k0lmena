import { Given, When, Then } from '@cucumber/cucumber';
import { pages } from '../hooks/hook';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// Usamos la primera página del array
const loginPage = new LoginPage(); 



Given('the user navigates to the login page', async () => {
  await loginPage.navigate();
});

When('the user enters valid credentials and clicks the login button', async () => {
  await loginPage.login();
});

Then('the user should be redirected to the dashboard of Salesforce', async () => {
  await expect(pages[0]).toHaveURL(/lightning\.force\.com/);
});

