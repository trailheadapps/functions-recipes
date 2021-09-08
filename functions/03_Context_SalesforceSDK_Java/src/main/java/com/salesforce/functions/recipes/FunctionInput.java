package com.salesforce.functions.recipes;

public class FunctionInput {
  private String name;
  private String accountNumber;
  private String industry;
  private String type;
  private String website;

  public FunctionInput() {}

  public FunctionInput(
      String name, String accountNumber, String industry, String type, String website) {
    this.name = name;
    this.accountNumber = accountNumber;
    this.industry = industry;
    this.type = type;
    this.website = website;
  }

  public String getName() {
    return this.name;
  }

  public String getAccountNumber() {
    return this.accountNumber;
  }

  public String getIndustry() {
    return this.industry;
  }

  public String getType() {
    return this.type;
  }

  public String getWebsite() {
    return this.website;
  }
}
