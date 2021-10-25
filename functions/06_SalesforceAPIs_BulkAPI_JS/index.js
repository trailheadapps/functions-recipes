import jsforce from "jsforce";
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";

/**
 * Describe Bulkapijs here.
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
    `Invoking Bulkapijs with payload ${JSON.stringify(event.data || {})}`
  );
  const results = {
    success: 0,
    failures: 0
  };

  // Establish JSForce Connection from Context
  const conn = new jsforce.Connection({
    accessToken: context.org.accessToken,
    instanceUrl: context.org.baseUrl,
    version: context.org.apiVersion
  });

  // Load CSV file from File using Stream
  const csvStream = createReadStream(
    new URL("./data/accountData.csv", import.meta.url)
  );

  // Create Bulk API Batch
  const batch = conn.bulk.load("Account", "upsert", {
    extIdField: "ExternalID"
  });

  batch.on("queue", (batchInfo) => {
    logger.info(`Batch ${batchInfo.id} queued.`);
  });

  batch.on("response", (rets) => {
    for (let i = 0; i < rets.length; i++) {
      if (rets[i].success) {
        results.success++;
        logger.info(`#${i + 1} loaded with id = ${rets[i].id}`);
      } else {
        results.failures++;
        logger.info(
          `#${i + 1} an error occurred = ${rets[i].errors.join(", ")}`
        );
      }
    }
  });

  batch.on("error", (err) => {
    logger.error(`An error occurred = ${err}`);
  });

  await pipeline(csvStream, batch.stream());

  return results;
}
