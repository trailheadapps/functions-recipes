package com.salesforce.functions.recipes;

public class Cases {
  private final String serviceCaseId;
  private final String followupCaseId;

  public Cases(String serviceCaseId, String followupCaseId) {
    this.serviceCaseId = serviceCaseId;
    this.followupCaseId = followupCaseId;
  }

  public String getServiceCaseId() {
    return serviceCaseId;
  }

  public String getFollowupCaseId() {
    return followupCaseId;
  }
}
