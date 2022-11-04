package com.salesforce.functions.recipes.utils;

public class Environment {

  public static String getDatabaseUrl() {
    String databaseUrl = System.getenv("DATABASE_URL");
    if (databaseUrl == null) {
      throw new IllegalStateException("DATABASE_URL environment variable is not set");
    }
    return databaseUrl;
  }
}
