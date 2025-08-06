
@salesforcedev @smoke
Feature: Opportunity Creation

Scenario: Create a new opportunity
  Given the user is logged into Salesforce
  When the user navigates to the "Opportunities" tab
  And clicks "New"
  And fills out the required opportunity details
  Then the opportunity should be created successfully


