import { expect } from '@playwright/test';
import { getPage } from '../hooks/hook';
import { BASEURL, SF_USERNAME, SF_PASSWORD } from '../config/env';
import { loginLocators } from '../locators/loginLocator';

export class LoginPage {
 
  async goto() {
    const page = getPage();
    await page.goto(BASEURL, { waitUntil: 'load' });
  }

  async login(username = SF_USERNAME, password = SF_PASSWORD) {
    const page = getPage();

    if (await loginLocators.homeIdentifier(page).isVisible().catch(() => false)) {
      return;
    }

    // Espera el form de login visible
    await expect(loginLocators.username(page)).toBeVisible({ timeout: 20_000 });
    await loginLocators.username(page).fill(username);
    await loginLocators.password(page).fill(password);
    await loginLocators.submit(page).click();

    // Redirección a Lightning (My Domain): espera hasta que aparezca el home
    await this.assertDashboardVisible();
  }

  
  async assertDashboardVisible() {
    const page = getPage();
    const home = loginLocators.homeIdentifier(page);
    await expect(home).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/lightning\.force\.com\/.*lightning\/.*/i, {
      timeout: 30_000,
    });
  }
}

