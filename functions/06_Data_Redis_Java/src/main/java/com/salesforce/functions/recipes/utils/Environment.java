package com.salesforce.functions.recipes.utils;

public class Environment {

  public static String getDatabaseUrl() {
    String databaseUrl = System.getenv("REDIS_URL");
    if (databaseUrl == null) {
      throw new IllegalStateException("REDIS_URL environment variable is not set");
    }
    return databaseUrl;
  }
}