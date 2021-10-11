package com.salesforce.functions.recipes;

public class FunctionInput {
  private String accountName;
  private String firstName;
  private String lastName;
  private String subject;
  private String description;

  public FunctionInput() {}

  public FunctionInput(
      String accountName, String firstName, String lastName, String subject, String description) {
    this.accountName = accountName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.subject = subject;
    this.description = description;
  }

  public String getAccountName() {
    return this.accountName;
  }

  public String getFirstName() {
    return this.firstName;
  }

  public String getLastName() {
    return this.lastName;
  }

  public String getSubject() {
    return this.subject;
  }

  public String getDescription() {
    return this.description;
  }
}
