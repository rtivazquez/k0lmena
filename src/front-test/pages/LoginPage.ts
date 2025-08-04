import { Page } from '@playwright/test';
import { loginLocators } from '../locators/loginlocator';

export class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto(process.env.BASEURL!);
  }

  async login() {
    await loginLocators.usernameInput(this.page).fill(process.env.SF_USERNAME!);
    await loginLocators.passwordInput(this.page).fill(process.env.SF_PASSWORD!);
    await loginLocators.loginButton(this.page).click();
  }

  async isOnDashboard(): Promise<boolean> {
    return loginLocators.dashboardIdentifier(this.page).isVisible();
  }

  async isErrorVisible(): Promise<boolean> {
    return loginLocators.errorMessage(this.page).isVisible();
  }
}
