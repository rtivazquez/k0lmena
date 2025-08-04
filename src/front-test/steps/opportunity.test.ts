import { expect } from '@playwright/test';
import { Given, When, Then } from '@cucumber/cucumber';
import { BASEURL } from '../config';
import { pages } from '../hooks/hook';
import { validateFirstLocator } from '../utils/validations';
import {
  
  changelog,
  version,
  performanceText
} from '../locators/exampleLocators';
import {
  getByPlaceholderAndClickIt,
  getByPlaceholderAndFillIt,
  getByText
} from '../utils/interactions';


Given('El usuario esta en la pagina de k0lmema', async () => {
  for (const page of pages) {
    console.log(`Ejecutando prueba en navegador: ${page.context().browser()?.browserType().name()}`);
    await page.goto(BASEURL);
  }
});

When('El usuario clickea el link de change log', async function () {
  for (const page of pages) {
    await page.getByText(changelog).click();
  }
});
When('El usuario clickea la version 2.0', async function () {
  for (const page of pages) {
    await page.getByRole('link',{name:version})
  }
});

Then('El usuario ve la informacion de la version 2.0', async function () {
  for (const page of pages) {
    await expect(page.locator(`text=${version}`).first()).toBeVisible();
  }
});
