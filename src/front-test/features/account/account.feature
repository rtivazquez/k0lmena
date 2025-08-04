
@salesforcedev @smoke
Feature: Account Creation

Scenario: Create a new account
  Given the user is logged into Salesforce
  When the user navigates to the "Accounts" tab
  And clicks "New"
  And fills out the required account details
  Then the account should be created successfully





