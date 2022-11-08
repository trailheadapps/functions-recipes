package com.salesforce.functions.recipes;

import java.sql.Timestamp;

public class Invocation {

  private String id;
  private Timestamp createdAt;

  public Invocation(String id, Timestamp date) {
    this.id = id;
    this.createdAt = date;
  }

  public String getId() {
    return id;
  }

  public Timestamp getCreatedAt() {
    return createdAt;
  }
}
