
@account

Feature: Account Creation



Scenario: Create a new account
  Given the user navigates to the login page
  When the user enters valid credentials and clicks the login button
  And the user should be redirected to the dashboard of Salesforce
  And the user navigates to the "Accounts" tab
  And clicks "New"
  And fills out the required account details
  Then the account should be created successfully





