package com.salesforce.functions.recipes;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.SalesforceFunction;
import com.salesforce.functions.recipes.db.InvocationsManager;
import com.salesforce.functions.recipes.utils.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Connects to a PostgreSQL instance and perform two operations:
 * 1. Insert a new row into the "invocations" table with an invocation ID
 * 2. Query the "invocations" table for all the invocation IDs
 */
public class PostgresJavaFunction implements SalesforceFunction<FunctionInput, Invocations> {
  private static final Logger LOGGER = LoggerFactory.getLogger(PostgresJavaFunction.class);
  private InvocationsManager invocationsManager;

  @Override
  public Invocations apply(InvocationEvent<FunctionInput> event, Context context)
      throws Exception {

    LOGGER.info("Invoked with input: {}", event.getData());

    try {
      Integer limit = event.getData().getLimit();

      // If invocationsManager isn't set, instantiate a new one (Useful for testing)
      if (invocationsManager == null) {
        invocationsManager = new InvocationsManager(Environment.getDatabaseUrl());
      }

      // Insert a new row into the "invocations" table with an invocation ID
      invocationsManager.insertInvocation(context.getId());

      // Query the "invocations" table for all the invocation IDs
      Invocations invocations = invocationsManager.selectInvocations(limit);

      LOGGER.info("Retrieved {} invocations from the database",
          invocations.getInvocations().size());

      return invocations;
    } catch (Exception e) {
      LOGGER.error("Error while connecting to the database", e);
      throw e;
    }
  }

  public void setInvocationsManager(InvocationsManager invocationsManager) {
    this.invocationsManager = invocationsManager;
  }
}
