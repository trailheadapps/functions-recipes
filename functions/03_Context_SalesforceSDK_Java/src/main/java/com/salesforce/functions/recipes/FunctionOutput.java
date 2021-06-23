package com.salesforce.functions.recipes;

import java.util.List;

public class FunctionOutput {
  private final List<Account> accounts;

  public FunctionOutput(List<Account> accounts) {
    this.accounts = accounts;
  }

  public List<Account> getAccounts() {
    return accounts;
  }
}
