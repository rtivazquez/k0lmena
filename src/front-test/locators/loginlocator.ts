export const loginLocators = {
  usernameInput: (page) => page.locator('#username'),
  passwordInput: (page) => page.locator('#password'),
  loginButton: (page) => page.locator('#Login'),
  dashboardIdentifier: (page) => page.locator('div[title="Seller Home"]'), // Ajusta el selector real
  errorMessage: (page) => page.locator('#error') // Ajusta según tu HTML
};
