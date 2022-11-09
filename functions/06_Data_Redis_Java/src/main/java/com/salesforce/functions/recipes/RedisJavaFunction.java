package com.salesforce.functions.recipes;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.SalesforceFunction;
import com.salesforce.functions.recipes.db.InvocationsManager;
import com.salesforce.functions.recipes.utils.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * Connects to a Redis instance and perform the following operations:
 * 1. Stores the last invocation ID in Redis
 * 2. Stores the last invocation time in Redis
 * 3. Adds the invocation ID to a list in Redis
 * 4. Returns the list of invocation IDs from Redis
 */
public class RedisJavaFunction implements SalesforceFunction<FunctionInput, Invocations> {
  private static final Logger LOGGER = LoggerFactory.getLogger(RedisJavaFunction.class);

  @Override
  public Invocations apply(InvocationEvent<FunctionInput> event, Context context) throws Exception {

    LOGGER.info("Invoked with input: {}", event.getData());

    try (InvocationsManager invocationsManager = new InvocationsManager(Environment.getDatabaseUrl())) {
      Integer limit = event.getData().getLimit();

      // Insert a new invocation to the "invocations" list
      // Also set the last invocation ID and last invocation time
      invocationsManager.addInvocation(context.getId());

      // Query the "invocations" list for all the invocation IDs
      Invocations invocations = invocationsManager.getInvocations(limit);
      LOGGER.info("Retrieved {} invocations from the database", invocations.getInvocations().size());
      return invocations;
    } catch (Exception e) {
      LOGGER.error("Error while connecting to the database", e);
      throw e;
    }
  }
}
