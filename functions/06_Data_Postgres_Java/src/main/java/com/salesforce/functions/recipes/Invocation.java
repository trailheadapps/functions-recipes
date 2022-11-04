package com.salesforce.functions.recipes;

import java.sql.Date;

public class Invocation {

  private String id;
  private Date createdAt;

  public Invocation(String id, Date date) {
    this.id = id;
    this.createdAt = date;
  }

  public String getId() {
    return id;
  }

  public Date getCreatedAt() {
    return createdAt;
  }
}
