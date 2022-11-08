package com.salesforce.functions.recipes;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.SalesforceFunction;
import com.salesforce.functions.recipes.db.InvocationsManager;
import com.salesforce.functions.recipes.utils.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * Describe RedisjavaFunction here.
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
      return invocations;
    } catch (Exception e) {
      LOGGER.error("Error while connecting to the database", e);
      throw e;
    }
  }
}
