
@account
Feature: Account Creation

Scenario: Create a new account
  Given the user navigates to the login page
  When the user enters valid credentials and clicks the login button
  And the user should be redirected to the dashboard of Salesforce
  And the user navigates to the "Accounts" tab
  And clicks "New"
  And fills in the account details
  And clicks "Save"
  