package com.salesforce.functions.recipes;

import java.util.List;

public class JsonResponse {
  private List<School> schools;

  public List<School> getSchools() {
    return schools;
  }

  public void setSchools(List<School> schools) {
    this.schools = schools;
  }
}
