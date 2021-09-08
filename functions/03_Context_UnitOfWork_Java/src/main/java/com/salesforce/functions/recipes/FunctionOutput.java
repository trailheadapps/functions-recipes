package com.salesforce.functions.recipes;

import java.util.List;

public class FunctionOutput {
  private final String accountId;
  private final String contactId;
  private final String caseId;
  private final List<String> taskIds;

  public FunctionOutput(String accountId, String contactId, String caseId, List<String> taskIds) {
    this.accountId = accountId;
    this.contactId = contactId;
    this.caseId = caseId;
    this.taskIds = taskIds;
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

  public List<String> getTaskIds() {
    return this.taskIds;
  }
}
