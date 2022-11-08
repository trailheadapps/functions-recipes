package com.salesforce.functions.recipes;

public class FunctionInput {
  private Integer limit = 5;

  public Integer getLimit() {
    return limit;
  }

  public void setLimit(Integer limit) {
    this.limit = limit;
  }

  @Override
  public String toString() {
    return "FunctionInput [limit=" + limit + "]";
  }
}
