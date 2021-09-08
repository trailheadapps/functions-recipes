package com.salesforce.functions.recipes;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.SalesforceFunction;
import com.salesforce.functions.jvm.sdk.data.DataApi;
import com.salesforce.functions.jvm.sdk.data.Record;
import com.salesforce.functions.jvm.sdk.data.RecordModificationResult;
import com.salesforce.functions.jvm.sdk.data.ReferenceId;
import com.salesforce.functions.jvm.sdk.data.builder.UnitOfWorkBuilder;
import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
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
  private Clock clock = Clock.systemUTC();

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

    // Calculate two days from now to set a reminder date
    long twoDaysFromNow = clock.millis() + 2 * 24 * 60 * 60 * 1000;

    // Here we will create two Tasks related to the case
    // Call reminder task
    Record reminderTask =
        dataApi
            .newRecordBuilder("Task")
            .withField("Subject", "Call")
            .withField("WhatId", serviceCaseRefId)
            .withField("WhoId", contactRefId)
            .withField("Description", "Please call customer to verify service location")
            .withField("Priority", "High")
            .withField("isReminderSet", true)
            .withField("ActivityDate", twoDaysFromNow)
            .build();

    // Email follow up task
    Record followupTask =
        dataApi
            .newRecordBuilder("Task")
            .withField("Subject", "Email")
            .withField("WhatId", serviceCaseRefId)
            .withField("WhoId", contactRefId)
            .withField(
                "Description", "Please follow up with customer after verifying service location")
            .build();

    // Register the tasks to be created
    ReferenceId reminderTaskRefId = unitOfWork.registerCreate(reminderTask);
    ReferenceId followupTaskRefId = unitOfWork.registerCreate(followupTask);

    // The transaction will be committed and all the objects are going to be created.
    // The resulting map contains the Id's of the created objects
    Map<ReferenceId, RecordModificationResult> result =
        dataApi.commitUnitOfWork(unitOfWork.build());

    // Create a List with the multiple Task Reference Ids
    List<String> taskIds = new ArrayList<>();
    taskIds.add(result.get(reminderTaskRefId).getId());
    taskIds.add(result.get(followupTaskRefId).getId());

    LOGGER.info("Function successfully commited UoW with {} affected records!", result.size());

    // Construct the result by getting de Id's from the created objects
    return new FunctionOutput(
        result.get(accountRefId).getId(),
        result.get(contactRefId).getId(),
        result.get(serviceCaseRefId).getId(),
        taskIds);
  }

  /**
   * Sets the clock used to calculate the reminder date. Useful for testing.
   *
   * @param clock
   */
  public void setClock(Clock clock) {
    this.clock = clock;
  }
}
