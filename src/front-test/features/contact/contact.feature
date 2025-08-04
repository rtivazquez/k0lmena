
@salesforcedev @smoke
Feature: Contact Creation

Scenario: Create a new contact
  Given the user is logged into Salesforce
  When the user navigates to the "Contacts" tab
  And clicks "New"
  And fills out the required contact details
  Then the contact should be created successfully



