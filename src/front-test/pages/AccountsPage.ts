// src/front-test/pages/AccountsPage.ts
import { expect } from '@playwright/test';
import { getPage } from '../hooks/hook';
import { accountLocators } from '../locators/accountLocator';

type CreateOpts = {
  phone?: string;
  website?: string;
  rating?: string; // ej: "Hot"
  type?: string;   // ej: "Customer - Direct"
};

export class AccountsPage {
  async goToTab() {
    const page = getPage();
    const tab = accountLocators.accountsTab(page);
    await tab.waitFor({ state: 'visible' });
    await tab.click();
    await expect(accountLocators.newButton(page)).toBeVisible({ timeout: 20_000 });
  }

  async openNewModal() {
    const page = getPage();
    await accountLocators.newButton(page).click();
    await expect(accountLocators.newAccountDialog(page)).toBeVisible({ timeout: 15_000 });
    await expect(accountLocators.accountNameInput(page)).toBeVisible({ timeout: 15_000 });
  }

  private async selectCombo(label: 'Rating' | 'Type', option: string) {
    const page = getPage();
    const combo = label === 'Rating'
      ? accountLocators.ratingCombo(page)
      : accountLocators.typeCombo(page);

    await combo.click();

    const listbox = page.getByRole('listbox').last();
    await expect(listbox).toBeVisible({ timeout: 5_000 });
    await listbox.getByRole('option', { name: option, exact: true }).click();
    await expect(listbox).toBeHidden({ timeout: 3_000 });
  }

  async fillMandatoryFields(name: string, opts?: CreateOpts) {
    const page = getPage();


    const nameInput = accountLocators.accountNameInput(page);
    await nameInput.scrollIntoViewIfNeeded();
    await expect(nameInput).toBeVisible({ timeout: 10_000 });
    await expect(nameInput).toBeEditable({ timeout: 10_000 });
    await nameInput.click();
    await nameInput.fill(name);

    if (opts?.phone)   await accountLocators.phoneInput(page).fill(opts.phone);
    if (opts?.website) await accountLocators.websiteInput(page).fill(opts.website);
    if (opts?.rating)  await this.selectCombo('Rating', opts.rating);
    if (opts?.type)    await this.selectCombo('Type',   opts.type);
  }

  async save() {
    const page = getPage();
    await accountLocators.saveButton(page).click();


    const toast = page.locator(`.slds-notify_toast, [role="alertdialog"]`);
    await toast.waitFor({ state: 'visible', timeout: 7000 }).catch(() => {});
  }

  async assertCreated(name: string) {
    const page = getPage();
    await expect(
      accountLocators.recordHeaderByName(page, name)
    ).toBeVisible({ timeout: 20_000 });
  }

  // Flujo end‑to‑end
  async create(name: string, opts?: CreateOpts) {
    await this.goToTab();
    await this.openNewModal();
    await this.fillMandatoryFields(name, opts);
    await this.save();
    await this.assertCreated(name);
  }
}
