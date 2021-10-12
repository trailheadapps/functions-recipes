/**
 * Returns accounts and its contacts by keyword.
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
    `Invoking datapiqueryjs Function with payload ${JSON.stringify(
      event.data || {}
    )}`
  );

  const keyword = event.data.keyword;
  if (!keyword || typeof keyword !== "string") {
    throw new Error("Please specify a keyword to search accounts");
  }

  const results = await context.org.dataApi.query(
    `SELECT Id, Name, (SELECT Name, Email FROM Contacts) FROM Account WHERE Name LIKE '%${keyword}%'`
  );
  logger.info(JSON.stringify(results));
  return results;
}
