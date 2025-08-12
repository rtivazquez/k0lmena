// src/front-test/locators/loginlocator.ts
export const loginLocators = {
  username:        (page) => page.getByLabel('Username').or(page.locator('#username')),
  password:        (page) => page.getByLabel('Password').or(page.locator('#password')),
  submit:          (page) => page.getByRole('button', { name: /log in|login/i }).or(page.locator('input#Login')),
  homeIdentifier:  (page) => page.getByRole('heading', { name: /seller home/i })
};
