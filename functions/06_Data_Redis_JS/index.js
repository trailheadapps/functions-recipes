import "dotenv/config";
import { redisConnect } from "./lib/db.js";

/**
 * Connects to a Redis instance and perform the following operations:
 * 1. Stores the last invocation ID in Redis
 * 2. Stores the last invocation time in Redis
 * 3. Adds the invocation ID to a list in Redis
 * 4. Returns the list of invocation IDs from Redis
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */

// Expiration time for Redis keys
const FIVE_MINUTES = 5 * 60;

export default async function (event, context, logger) {
  logger.info(
    `Invoking redisjs with payload ${JSON.stringify(event.data || {})}`
  );

  // Get the number of invocations to return
  const limit = event.data.limit ?? 5;

  let client;
  try {
    // Connect to Redis instance
    client = await redisConnect({
      url: process.env.REDIS_URL
    });

    // Set the last invocation id into the database with expiration set to 5 minutes
    const lastInvocationId = context.id;
    await client.set("lastInvocationId", lastInvocationId, "EX", FIVE_MINUTES);

    // Set the last invocation time into the database with expiration set to 5 minutes
    const lastInvocationTime = new Date().toISOString();
    await client.set(
      "lastInvocationTime",
      lastInvocationTime,
      "EX",
      FIVE_MINUTES
    );

    // Add the invocation id to a list in the database
    await client.lPush("invocations", context.id);

    // If no expiration is set, set the expiration to 5 minutes
    const ttl = await client.ttl("invocations");
    if (ttl < 0) {
      await client.expire("invocations", FIVE_MINUTES);
    }

    // Get the list of invocations
    const invocations = await client.lRange("invocations", 0, limit - 1);

    // Return the results
    const results = {
      invocations,
      lastInvocationId,
      lastInvocationTime
    };
    return results;
  } catch (error) {
    logger.error(`An error ocurred: ${error.message}`);
    throw error;
  } finally {
    // Close the database connection if the client exists
    if (client) await client.quit();
  }
}
