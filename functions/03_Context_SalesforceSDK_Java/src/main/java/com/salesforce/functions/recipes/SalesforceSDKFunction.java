package com.salesforce.functions.recipes;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.SalesforceFunction;
import com.salesforce.functions.jvm.sdk.data.DataApi;
import com.salesforce.functions.jvm.sdk.data.Record;
import com.salesforce.functions.jvm.sdk.data.RecordModificationResult;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This function takes a payload containing account details, and creates the record. It then uses a
 * SOQL query to return the newly created Account.
 */
public class SalesforceSDKFunction implements SalesforceFunction<FunctionInput, FunctionOutput> {
  private static final Logger LOGGER = LoggerFactory.getLogger(SalesforceSDKFunction.class);

  @Override
  public FunctionOutput apply(InvocationEvent<FunctionInput> event, Context context)
      throws Exception {

    // Retrieve payload fields
    String accountName = event.getData().getName();

    if (accountName == null) {
      throw new Exception("Account Name is required");
    }

    String accountNumber = event.getData().getAccountNumber();
    String industry = event.getData().getIndustry();
    String type = event.getData().getType();
    String website = event.getData().getWebsite();

    // Insert the record using the SalesforceSDK DataApi and get the new Record Id from the result
    DataApi dataApi = context.getOrg().get().getDataApi();

    String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
    String accountNameWithTimestamp = String.format("%s-%s", accountName, timeStamp);

    Record account =
        dataApi
            .newRecordBuilder("Account")
            .withField("Name", accountNameWithTimestamp)
            .withField("AccountNumber", accountNumber)
            .withField("Industry", industry)
            .withField("Type", type)
            .withField("Website", website)
            .build();

    RecordModificationResult createResult = dataApi.create(account);

    // Query Accounts using the SalesforceSDK DataApi to verify that our new Account was created.
    String queryString =
        String.format("SELECT Id, Name FROM Account WHERE Id = '%s'", createResult.getId());
    List<Record> records = dataApi.query(queryString).getRecords();

    LOGGER.info("Function successfully queried {} account records!", records.size());

    List<Account> accounts = new ArrayList<>();
    for (Record record : records) {
      String id = record.getStringField("Id").get();
      String name = record.getStringField("Name").get();
      accounts.add(new Account(id, name));
    }

    return new FunctionOutput(accounts);
  }
}
