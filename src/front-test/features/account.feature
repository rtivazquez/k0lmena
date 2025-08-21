
@account @smoke
Feature: Account Creation

Scenario: Create a new account
  Given the user navigates to the login page
  When the user enters valid credentials and clicks the login button
  And the user should be redirected to the dashboard of Salesforce
  And the user navigates to the "Accounts" tab
  And clicks "New"
  And fills in the account details
  And clicks "Save"

  Scenario: Create a new account (negative)
  Given the user navigates to the login page  
  When the user enters valid credentials and clicks the login button  
  Then the user should be redirected to the dashboard of Salesforce  
  And the user navigates to the "Accounts" tab  
  And clicks "New"  
  And fills in the account details with invalid data
    | Field       | Value           |
    | Account Name|                 |
    | Phone       | abc123          |
    | Email       | invalid-email   |
  And clicks "Save"  
  Then the account should not be created  
  And an error message should be displayed  

  