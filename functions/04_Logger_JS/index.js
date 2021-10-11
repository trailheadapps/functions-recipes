/**
 * Generates an amount of log messages every number of seconds.
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
    `Invoking loggerjs Function with payload ${JSON.stringify(
      event.data || {}
    )}`
  );

  let { amount = 5, timeout = 5 } = event.data;

  let count = 0;
  setInterval(() => {
    if (+amount <= count) return;
    count++;

    logger.info(
      `${count} ${
        count == 1 ? "elephant" : "elephants"
      } balancing over a spiderweb at ${new Date()}`
    );
  }, timeout * 1000);

  return {
    status: `Logger Started: Generating ${amount} log messages every ${timeout} seconds`
  };
}
