package com.salesforce.functions.recipes;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.SalesforceFunction;
import com.salesforce.functions.jvm.sdk.data.DataApi;
import com.salesforce.functions.jvm.sdk.data.Record;
import com.salesforce.functions.jvm.sdk.data.RecordModificationResult;
import com.salesforce.functions.jvm.sdk.data.ReferenceId;
import com.salesforce.functions.jvm.sdk.data.builder.UnitOfWorkBuilder;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This function takes a payload containing Account, Contact, and Case details and uses the Unit of
 * Work pattern to assign the corresponding values to it's Record while maintaining the
 * relationships. It then commits the Unit of Work and returns the record Id's for each object.
 */
public class UnitOfWorkFunction implements SalesforceFunction<FunctionInput, FunctionOutput> {
  private static final Logger LOGGER = LoggerFactory.getLogger(UnitOfWorkFunction.class);

  @Override
  public FunctionOutput apply(InvocationEvent<FunctionInput> event, Context context)
      throws Exception {

    String accountName = event.getData().getAccountName();
    String firstName = event.getData().getFirstName();
    String lastName = event.getData().getLastName();
    String subject = event.getData().getSubject();
    String description = event.getData().getDescription();

    DataApi dataApi = context.getOrg().get().getDataApi();

    // Create a Unit of Work that inserts multiple objects
    UnitOfWorkBuilder unitOfWork = dataApi.newUnitOfWorkBuilder();

    // You can use the DataApi to create a new Record
    Record account = dataApi.newRecordBuilder("Account").withField("Name", accountName).build();
    // A ReferenceId will be returned to assign relationships with other objects within the same
    // transaction
    ReferenceId accountRefId = unitOfWork.registerCreate(account);

    Record contact =
        dataApi
            .newRecordBuilder("Contact")
            .withField("FirstName", firstName)
            .withField("LastName", lastName)
            .build();
    ReferenceId contactRefId = unitOfWork.registerCreate(contact);

    // Here we are using the accountRefId and contactRefId to specify the relationship with the
    // temporary Id's created by the Unit of Work builder
    Record serviceCase =
        dataApi
            .newRecordBuilder("Case")
            .withField("Subject", subject)
            .withField("Description", description)
            .withField("Origin", "Web")
            .withField("Status", "New")
            .withField("AccountId", accountRefId)
            .withField("ContactId", contactRefId)
            .build();
    ReferenceId serviceCaseRefId = unitOfWork.registerCreate(serviceCase);

    // The transaction will be commited and all the three objects are going to be created. The
    // resulting map contains the Id's of the created objects
    Map<ReferenceId, RecordModificationResult> result =
        dataApi.commitUnitOfWork(unitOfWork.build());

    LOGGER.info("Function successfully commited UoW with {} affected records!", result.size());

    // Construct the result by getting de Id's from the created objects
    return new FunctionOutput(
        result.get(accountRefId).getId(),
        result.get(contactRefId).getId(),
        result.get(serviceCaseRefId).getId());
  }
}
