package com.salesforce.functions.recipes;

public class FunctionOutput {
  private final String accountId;
  private final String contactId;
  private final Cases cases;

  public FunctionOutput(String accountId, String contactId, Cases cases) {
    this.accountId = accountId;
    this.contactId = contactId;
    this.cases = cases;
  }

  public String getAccountId() {
    return this.accountId;
  }

  public String getContactId() {
    return this.contactId;
  }

  public Cases getCases() {
    return this.cases;
  }
}
