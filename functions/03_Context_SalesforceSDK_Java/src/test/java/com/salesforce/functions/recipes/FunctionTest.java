package com.salesforce.functions.recipes;

import static com.spotify.hamcrest.pojo.IsPojo.pojo;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.beans.HasPropertyWithValue.hasProperty;
import static org.hamcrest.core.StringContains.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.Org;
import com.salesforce.functions.jvm.sdk.data.Record;
import com.salesforce.functions.jvm.sdk.data.RecordModificationResult;
import com.salesforce.functions.jvm.sdk.data.RecordQueryResult;
import com.salesforce.functions.jvm.sdk.data.error.DataApiError;
import com.salesforce.functions.jvm.sdk.data.error.DataApiException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.junit.Test;
import org.mockito.Mockito;

public class FunctionTest {

  @Test
  public void testValid() throws Exception {
    SalesforceSDKFunction function = new SalesforceSDKFunction();
    FunctionInput input = createValidInput();
    FunctionOutput functionOutput =
        function.apply(createEventMock(input), createValidContextMock(input));

    assertThat(
        functionOutput.getAccounts(),
        hasItems(
            pojo(Account.class)
                .withProperty("id", equalTo("5003000000D8cuIQAA"))
                .withProperty("name", containsString("MyAccount"))));
  }

  @Test
  public void testInvalid() throws Exception {
    SalesforceSDKFunction function = new SalesforceSDKFunction();
    FunctionInput functionInput = createInvalidInput();

    // Assert a specific DataApiExeption containing an input validation error
    DataApiException ex =
        assertThrows(
            DataApiException.class,
            () -> {
              function.apply(createEventMock(functionInput), createInvalidContext(functionInput));
            });

    assertThat(ex.getDataApiErrors(), contains(hasProperty("errorCode", is("STRING_TOO_LONG"))));
    assertEquals("One or more API errors occurred", ex.getMessage());
  }

  @Test
  public void testEmpty() throws Exception {
    SalesforceSDKFunction function = new SalesforceSDKFunction();
    FunctionInput functionInput = createEmptyInput();

    // Assert a generic Exception
    assertThrows(
        Exception.class,
        () -> {
          function.apply(createEventMock(functionInput), createEmptyContext(functionInput));
        });
  }

  private Context createValidContextMock(FunctionInput input) {
    Context mockContext = mock(Context.class);

    when(mockContext.getOrg())
        .then(
            i1 -> {
              Org mockOrg = mock(Org.class, Mockito.RETURNS_DEEP_STUBS);

              Record accountRecord = mock(Record.class);
              RecordModificationResult createResult = mock(RecordModificationResult.class);
              String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
              String accountNameWithTimestamp = String.format("%s-%s", input.getName(), timeStamp);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Account")
                      .withField("Name", accountNameWithTimestamp)
                      .withField("AccountNumber", input.getAccountNumber())
                      .withField("Industry", input.getIndustry())
                      .withField("Type", input.getType())
                      .withField("Website", input.getWebsite())
                      .build())
                  .thenReturn(accountRecord);

              when(mockOrg.getDataApi().create(accountRecord)).thenReturn(createResult);
              when(createResult.getId()).thenReturn("5003000000D8cuIQAA");

              String queryString =
                  String.format(
                      "SELECT Id, Name FROM Account WHERE Id = '%s'", createResult.getId());
              when(mockOrg.getDataApi().query(queryString))
                  .then(
                      i2 -> {
                        RecordQueryResult mockResult = mock(RecordQueryResult.class);

                        Record firstRecord = mock(Record.class);
                        when(firstRecord.getStringField("Id"))
                            .thenReturn(Optional.of("5003000000D8cuIQAA"));
                        when(firstRecord.getStringField("Name"))
                            .thenReturn(Optional.of(accountNameWithTimestamp));

                        when(mockResult.getRecords()).thenReturn(Arrays.asList(firstRecord));

                        return mockResult;
                      });

              return Optional.of(mockOrg);
            });

    return mockContext;
  }

  /**
   * Create a mock for Context with an invalid input
   *
   * @param input
   * @return Context
   */
  private Context createInvalidContext(FunctionInput input) {
    Context mockContext = mock(Context.class);

    when(mockContext.getOrg())
        .then(
            i1 -> {
              Org mockOrg = mock(Org.class, Mockito.RETURNS_DEEP_STUBS);

              Record accountRecord = mock(Record.class);
              String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
              String accountNameWithTimestamp = String.format("%s-%s", input.getName(), timeStamp);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Account")
                      .withField("Name", accountNameWithTimestamp)
                      .withField("AccountNumber", input.getAccountNumber())
                      .withField("Industry", input.getIndustry())
                      .withField("Type", input.getType())
                      .withField("Website", input.getWebsite())
                      .build())
                  .thenReturn(accountRecord);

              // Create a custom DataApiError for input validation
              List<DataApiError> errors = new ArrayList<>();
              DataApiError validationError =
                  new DataApiError() {

                    @Override
                    public String getMessage() {
                      return "Last Name: data value too large: This is a very long string that"
                          + " isn't valid in this line, please reduce it. (max length=80)";
                    }

                    @Override
                    public String getErrorCode() {
                      return "STRING_TOO_LONG";
                    }

                    @Override
                    public List<String> getFields() {
                      return List.of("AccountNumber");
                    }
                  };
              errors.add(validationError);
              when(mockOrg.getDataApi().create(accountRecord))
                  .thenThrow(new DataApiException("One or more API errors occurred", errors));

              return Optional.of(mockOrg);
            });

    return mockContext;
  }

  /**
   * Create a mock for Context with an empty input
   *
   * @param input
   * @return Context
   */
  private Context createEmptyContext(FunctionInput input) {
    return mock(Context.class);
  }

  /**
   * Creates a valid Input Object
   *
   * @return FunctionInput
   */
  private FunctionInput createValidInput() {
    return new FunctionInput("MyAccount", "123456789", "Technology", "prospect", "salesforce.com");
  }

  /**
   * Creates an empty Input Object
   *
   * @return FunctionInput
   */
  private FunctionInput createEmptyInput() {
    return new FunctionInput();
  }

  /**
   * Creates an invalid Input Object
   *
   * @return FunctionInput
   */
  private FunctionInput createInvalidInput() {
    return new FunctionInput(
        "MyAccount",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "Technology",
        "prospect",
        "salesforce.com");
  }

  /**
   * Creates a mock for InvocationEvent
   *
   * @param input FunctionInput
   * @return InvocationEvent<FunctionInput>
   */
  @SuppressWarnings("unchecked")
  private InvocationEvent<FunctionInput> createEventMock(FunctionInput input) {
    InvocationEvent<FunctionInput> mockEvent = mock(InvocationEvent.class);
    when(mockEvent.getData()).thenReturn(input);
    return mockEvent;
  }
}
