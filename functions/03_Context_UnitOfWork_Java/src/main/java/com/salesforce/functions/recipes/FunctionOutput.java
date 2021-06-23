package com.salesforce.functions.recipes;

public class FunctionOutput {
  private final String accountId;
  private final String contactId;
  private final String caseId;

  public FunctionOutput(String accountId, String contactId, String caseId) {
    this.accountId = accountId;
    this.contactId = contactId;
    this.caseId = caseId;
  }

  public String getAccountId() {
    return this.accountId;
  }

  public String getContactId() {
    return this.contactId;
  }

  public String getCaseId() {
    return this.caseId;
  }
}
