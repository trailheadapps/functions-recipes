package com.salesforce.functions.recipes.utils;

/**
 * This class contains the environment variables used by the Function.
 */
public class Environment {

  /**
   * The URL of the PostgreSQL instance.
   * @return String
   */
  public static String getDatabaseUrl() {
    String databaseUrl = System.getenv("DATABASE_URL");
    if (databaseUrl == null) {
      throw new IllegalStateException("DATABASE_URL environment variable is not set");
    }
    return databaseUrl;
  }
}
