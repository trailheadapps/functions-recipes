import "dotenv/config";
import { pgConnect } from "./lib/db.js";

/**
 * Connects to a PostgreSQL instance and perform two operations:
 * 1. Insert a new row into the "invocations" table with an invocation ID
 * 2. Query the "invocations" table for all the invocation IDs
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
export default async function (event, context, logger) {
  logger.info(
    `Invoking postgresjs with payload ${JSON.stringify(event.data || {})}`
  );

  // Get the number of invocations to return
  const limit = event.data.limit ?? 5;

  let client;
  try {
    // Connect to PostgreSQL instance
    client = await pgConnect({
      url: process.env.DATABASE_URL
    });

    // Insert a new invocation id into the database
    await client.query(`INSERT INTO invocations (id) VALUES ($1)`, [
      context.id
    ]);

    // Return all the invocation ids from the database
    const { rows: results } = await client.query(
      `SELECT id, created_at FROM invocations ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );

    return results;
  } catch (error) {
    logger.error(`An error ocurred: ${error.message}`);
    throw error;
  } finally {
    // Close the database connection if the client exists
    if (client) await client.end();
  }
}
