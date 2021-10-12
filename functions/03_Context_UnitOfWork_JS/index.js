/**
 * Receives a payload containing Account, Contact, and Case details and uses the
 * Unit of Work pattern to assign the corresponding values to to its Record
 * while maintaining the relationships. It then commits the unit of work and
 * returns the Record Id's for each object.
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
    `Invoking unitofworkjs Function with payload ${JSON.stringify(
      event.data || {}
    )}`
  );

  // Validate Input
  const payload = event.data;
  validateField("accountName", payload.accountName);
  validateField("lastName", payload.lastName);
  validateField("subject", payload.subject);

  // Create a unit of work that inserts multiple objects.
  const uow = context.org.dataApi.newUnitOfWork();

  // Register a new Account for Creation
  const accountId = uow.registerCreate({
    type: "Account",
    fields: {
      Name: payload.accountName
    }
  });

  // Register a new Contact for Creation
  const contactId = uow.registerCreate({
    type: "Contact",
    fields: {
      FirstName: payload.firstName,
      LastName: payload.lastName,
      AccountId: accountId // Get the ReferenceId from previous operation
    }
  });

  // Register a new Case for Creation
  const serviceCaseId = uow.registerCreate({
    type: "Case",
    fields: {
      Subject: payload.subject,
      Description: payload.description,
      Origin: "Web",
      Status: "New",
      AccountId: accountId, // Get the ReferenceId from previous operation
      ContactId: contactId // Get the ReferenceId from previous operation
    }
  });

  // Register a follow up Case for Creation
  const followupCaseId = uow.registerCreate({
    type: "Case",
    fields: {
      ParentId: serviceCaseId, // Get the ReferenceId from previous operation
      Subject: "Follow Up",
      Description: "Follow up with Customer",
      Origin: "Web",
      Status: "New",
      AccountId: accountId, // Get the ReferenceId from previous operation
      ContactId: contactId // Get the ReferenceId from previous operation
    }
  });

  try {
    // Commit the Unit of Work with all the previous registered operations
    const response = await context.org.dataApi.commitUnitOfWork(uow);
    // Construct the result by getting the Id from the successful inserts
    const result = {
      accountId: response.get(accountId).id,
      contactId: response.get(contactId).id,
      cases: {
        serviceCaseId: response.get(serviceCaseId).id,
        followupCaseId: response.get(followupCaseId).id
      }
    };
    return result;
  } catch (err) {
    const errorMessage = `Failed to insert record. Root Cause : ${err.message}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Throws an Error if a value isn't present
 * @param {String} field
 * @param {any} value
 */
function validateField(field, value) {
  if (!value) throw new Error(`Please provide ${field}`);
}
