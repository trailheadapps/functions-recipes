/**
 * Receives a payload and returns information about it.
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
  const data = event.data || {};
  logger.info(
    `Invoking invocationeventjs with payload ${JSON.stringify(data)}`
  );

  // Extract information from the event (https://cloudevents.io/)
  const { id, dataContentType, source, type, time } = event;
  const results = {
    id,
    data,
    dataContentType,
    source,
    type,
    time,
    payloadInfo: {}
  };

  // Identify the payload type
  if (typeof data === "object") {
    results.payloadInfo.type = "object";
    results.payloadInfo.keys = Object.keys(data);
  } else {
    throw new Error(`Payload of type '${typeof data}' not supported`);
  }

  logger.info(JSON.stringify(results));
  return results;
}
