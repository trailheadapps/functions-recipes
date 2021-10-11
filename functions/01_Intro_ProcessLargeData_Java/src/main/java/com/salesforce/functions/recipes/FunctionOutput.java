package com.salesforce.functions.recipes;

import java.util.List;

public class FunctionOutput {
  private final List<School> schools;

  public FunctionOutput(List<School> schools) {
    this.schools = schools;
  }

  public List<School> getSchools() {
    return schools;
  }
}
