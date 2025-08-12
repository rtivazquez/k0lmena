import { Page } from '@playwright/test';

export const accountLocators = {
  // Navegación
  accountsTab: (page: Page) =>
    page.getByRole('link', { name: /^accounts\b/i }),

  newButton: (page: Page) =>
    page.getByRole('button', { name: /^new$/i }),

  newAccountDialog: (page: Page) =>
  page.getByRole('dialog').last(),

  accountNameInput: (page: Page) =>
  accountLocators
    .newAccountDialog(page)
    .locator(':light(input[name="Name"][type="text"])'),

  phoneInput: (page: Page) =>
    accountLocators.newAccountDialog(page)
      .getByRole('textbox', { name: /^phone$/i }),

  websiteInput: (page: Page) =>
    accountLocators.newAccountDialog(page)
      .getByRole('textbox', { name: /^website$/i }),

  ratingCombo: (page: Page) =>
    accountLocators.newAccountDialog(page)
      .getByRole('combobox', { name: /^rating$/i }),

  typeCombo: (page: Page) =>
    accountLocators.newAccountDialog(page)
      .getByRole('combobox', { name: /^type$/i }),

  optionByName: (page: Page, name: string) =>
    page.getByRole('listbox').last().getByRole('option', { name, exact: true }),

  saveButton: (page: Page) =>
    accountLocators.newAccountDialog(page)
      .getByRole('button', { name: /^(save|guardar)$/i }),

  recordHeaderByName: (page: Page, name: string) =>
    page.getByRole('heading', { name, exact: true }),
};
