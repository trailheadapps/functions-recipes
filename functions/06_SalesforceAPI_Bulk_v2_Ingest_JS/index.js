import { request } from "undici";

/**
 * Fetches an external CSV file and uses the Salesforce Bulk API v2.0 to ingest it.
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
    `Invoking bulkingestjs with payload ${JSON.stringify(event.data || {})}`
  );

  // Extract dataApi information from context
  const { accessToken, baseUrl, apiVersion } = context.org.dataApi;

  // Setup Bulk API Authorization headers
  const authHeaders = {
    Authorization: `Bearer ${accessToken}`
  };

  // Construct API URL for Bulk API v2
  const apiUrl = `${baseUrl}/services/data/v${apiVersion}`;

  // Load CSV file from external site
  const { statusCode: statusCodeCsv, body: csvStream } = await request(
    "https://external-accounts-site.herokuapp.com/accounts.csv",
    {
      method: "GET"
    }
  );

  if (statusCodeCsv !== 200) {
    throw new Error(
      `Failed to load CSV file from external site. Status code: ${statusCodeCsv}`
    );
  }

  // Create a new Bulk API Job
  const { statusCode: statusCodeJob, body: bodyJob } = await request(
    `${apiUrl}/jobs/ingest`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders
      },
      body: JSON.stringify({
        operation: "upsert",
        object: "Account",
        contentType: "CSV",
        externalIdFieldName: "ExternalID__c"
      })
    }
  );

  // Get Job Response
  const createJobResponse = await bodyJob.json();

  if (statusCodeJob !== 200) {
    logger.error(JSON.stringify(createJobResponse));
    throw new Error(`Create job failed`);
  }

  logger.info(`Job created. Id: ${createJobResponse.id}`);

  // Upload CSV file to Bulk API Job
  const { statusCode: statusCodeUpload } = await request(
    `${apiUrl}/jobs/ingest/${createJobResponse.id}/batches`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "text/csv",
        ...authHeaders
      },
      body: csvStream
    }
  );

  if (statusCodeUpload !== 201) {
    throw new Error(`Upload failed`);
  }

  logger.info(`Upload complete. Status code: ${statusCodeUpload}`);

  // Close Job
  const { statusCode, body } = await request(
    `${apiUrl}/jobs/ingest/${createJobResponse.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders
      },
      body: JSON.stringify({
        state: "UploadComplete"
      })
    }
  );

  const result = await body.json();

  if (statusCode !== 200) {
    logger.error(JSON.stringify(result));
    throw new Error(`Close job failed`);
  }

  logger.info(`Job closed. Status code: ${statusCode}`);

  return result;
}
