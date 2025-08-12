import { When, Then } from '@cucumber/cucumber';
import { AccountsPage } from '../pages/AccountsPage';

const accounts = new AccountsPage();

When('the user navigates to the "Accounts" tab', async () => {
  await accounts.goToTab();
});

When('clicks "New"', async () => {
  await accounts.openNewModal();
});

When('fills in the account details', async () => {
  await accounts.fillMandatoryFields('Test Automation Account', {
    phone: '5491122334455',
    website: 'https://example.com',
    rating: 'Hot',
    type: 'Customer - Direct',
  });
});

When('clicks "Save"', async () => {
  await accounts.save();
});



