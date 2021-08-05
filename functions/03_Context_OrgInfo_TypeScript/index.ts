import { InvocationEvent, Context, Logger, Org } from "sf-fx-sdk-nodejs";

/**
 * Returns the Salesforce Org information attached to the context.
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
export default async function execute(
  event: InvocationEvent<any>,
  context: Context,
  logger: Logger
): Promise<OrgInfo> {
  logger.info(
    `Invoking orginfots Function with payload ${JSON.stringify(
      event.data || {}
    )}`
  );

  // Check if org is null or undefined
  if (context.org == null) {
    throw new Error("Function isn't bind to any organization");
  }

  // Extract Org info metadata into its own object and return it
  const orgInfo: OrgInfo = new OrgInfo(context.org);
  return orgInfo;
}

// OrgInfo represents Org's metadata
export class OrgInfo {
  apiVersion: string;
  baseUrl: string;
  domainUrl: string;
  id: string;
  user: any;

  constructor(org: Org) {
    this.apiVersion = org.apiVersion;
    this.baseUrl = org.baseUrl;
    this.domainUrl = org.domainUrl;
    this.id = org.id;
    this.user = org.user;
  }
}
