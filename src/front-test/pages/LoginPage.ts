import { Page } from '@playwright/test';
import { loginLocators } from '../locators/loginLocator';
import { pages } from '../hooks/hook';
import { BASEURL } from '../config';


export class LoginPage {


  async navigate() {
   
    for (const page of pages) {
    console.log(`Ejecutando prueba en navegador: ${page.context().browser()?.browserType().name()}`);
    await page.goto(BASEURL);}
  }

  async login() {
     for (const page of pages) {
    await loginLocators.usernameInput(page).fill(process.env.SF_USERNAME!);
    await loginLocators.passwordInput(page).fill(process.env.SF_PASSWORD!);
    await loginLocators.loginButton(page).click();
     }
  }

  async isOnDashboard(): Promise<boolean> {
    for (const page of pages) {
      if (await loginLocators.dashboardIdentifier(page).isVisible()) {
        return true;
      }
    }
    return false;
  }

  async isErrorVisible(): Promise<boolean> {
    for (const page of pages) {
      if (await loginLocators.errorMessage(page).isVisible()) {
        return true;
      }
    }
    return false;
  }
}
