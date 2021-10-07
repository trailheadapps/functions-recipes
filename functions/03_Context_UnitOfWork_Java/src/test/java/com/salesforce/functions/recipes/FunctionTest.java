package com.salesforce.functions.recipes;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.beans.HasPropertyWithValue.hasProperty;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.Org;
import com.salesforce.functions.jvm.sdk.data.Record;
import com.salesforce.functions.jvm.sdk.data.RecordModificationResult;
import com.salesforce.functions.jvm.sdk.data.ReferenceId;
import com.salesforce.functions.jvm.sdk.data.UnitOfWork;
import com.salesforce.functions.jvm.sdk.data.builder.UnitOfWorkBuilder;
import com.salesforce.functions.jvm.sdk.data.error.DataApiError;
import com.salesforce.functions.jvm.sdk.data.error.DataApiException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.Test;
import org.mockito.Mockito;

public class FunctionTest {

  @Test
  public void testSuccess() throws Exception {
    UnitOfWorkFunction function = new UnitOfWorkFunction();

    FunctionInput functionInput = createValidInput();
    FunctionOutput functionOutput =
        function.apply(createEventMock(functionInput), createValidContextMock(functionInput));

    assertEquals("0019A00000J28zaQAB", functionOutput.getAccountId());
    assertEquals("0039A00000DkhvnQAB", functionOutput.getContactId());
    assertEquals("5009A000002GYCrQAO", functionOutput.getCases().getServiceCaseId());
    assertEquals("5009A000002GXCrQBO", functionOutput.getCases().getFollowupCaseId());
  }

  @Test
  public void testEmpty() throws Exception {
    UnitOfWorkFunction function = new UnitOfWorkFunction();
    FunctionInput functionInput = createEmptyInput();

    // Assert a generic DataApiException
    assertThrows(
        DataApiException.class,
        () -> {
          function.apply(createEventMock(functionInput), createEmptyContext(functionInput));
        });
  }

  @Test
  public void testInvalid() throws Exception {
    UnitOfWorkFunction function = new UnitOfWorkFunction();
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

  /**
   * Create a mock for Context using a valid input object
   *
   * @param input
   * @return Context
   */
  private Context createValidContextMock(FunctionInput input) {
    Context mockContext = mock(Context.class);

    when(mockContext.getOrg())
        .then(
            i1 -> {
              Org mockOrg = mock(Org.class, Mockito.RETURNS_DEEP_STUBS);

              UnitOfWorkBuilder unitOfWorkBuilder = mock(UnitOfWorkBuilder.class);
              UnitOfWork unitOfWork = mock(UnitOfWork.class);

              when(mockOrg.getDataApi().newUnitOfWorkBuilder()).thenReturn(unitOfWorkBuilder);

              ReferenceId accountRefId = mock(ReferenceId.class);
              ReferenceId contactRefId = mock(ReferenceId.class);
              ReferenceId serviceCaseRefId = mock(ReferenceId.class);
              ReferenceId followupCaseRefId = mock(ReferenceId.class);

              Record accountRecord = mock(Record.class);
              Record contactRecord = mock(Record.class);
              Record serviceCaseRecord = mock(Record.class);
              Record followupCaseRecord = mock(Record.class);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Account")
                      .withField("Name", input.getAccountName())
                      .build())
                  .thenReturn(accountRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Contact")
                      .withField("FirstName", input.getFirstName())
                      .withField("LastName", input.getLastName())
                      .build())
                  .thenReturn(contactRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("Subject", input.getSubject())
                      .withField("Description", input.getDescription())
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(serviceCaseRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("ParentId", serviceCaseRefId)
                      .withField("Subject", "Follow Up")
                      .withField("Description", "Follow up with Customer")
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(followupCaseRecord);

              when(unitOfWorkBuilder.registerCreate(accountRecord)).thenReturn(accountRefId);
              when(unitOfWorkBuilder.registerCreate(contactRecord)).thenReturn(contactRefId);
              when(unitOfWorkBuilder.registerCreate(serviceCaseRecord))
                  .thenReturn(serviceCaseRefId);
              when(unitOfWorkBuilder.registerCreate(followupCaseRecord))
                  .thenReturn(followupCaseRefId);
              when(unitOfWorkBuilder.build()).thenReturn(unitOfWork);

              when(mockOrg.getDataApi().commitUnitOfWork(unitOfWork))
                  .then(
                      i3 -> {
                        RecordModificationResult accountResult =
                            mock(RecordModificationResult.class);
                        when(accountResult.getId()).thenReturn("0019A00000J28zaQAB");

                        RecordModificationResult contactResult =
                            mock(RecordModificationResult.class);
                        when(contactResult.getId()).thenReturn("0039A00000DkhvnQAB");

                        RecordModificationResult serviceCaseResult =
                            mock(RecordModificationResult.class);
                        when(serviceCaseResult.getId()).thenReturn("5009A000002GYCrQAO");

                        RecordModificationResult followupCaseResult =
                            mock(RecordModificationResult.class);
                        when(followupCaseResult.getId()).thenReturn("5009A000002GXCrQBO");

                        Map<ReferenceId, RecordModificationResult> result = new HashMap<>();
                        result.put(accountRefId, accountResult);
                        result.put(contactRefId, contactResult);
                        result.put(serviceCaseRefId, serviceCaseResult);
                        result.put(followupCaseRefId, followupCaseResult);
                        return result;
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

              UnitOfWorkBuilder unitOfWorkBuilder = mock(UnitOfWorkBuilder.class);
              UnitOfWork unitOfWork = mock(UnitOfWork.class);

              when(mockOrg.getDataApi().newUnitOfWorkBuilder()).thenReturn(unitOfWorkBuilder);

              ReferenceId accountRefId = mock(ReferenceId.class);
              ReferenceId contactRefId = mock(ReferenceId.class);
              ReferenceId serviceCaseRefId = mock(ReferenceId.class);
              ReferenceId followupCaseRefId = mock(ReferenceId.class);

              Record accountRecord = mock(Record.class);
              Record contactRecord = mock(Record.class);
              Record serviceCaseRecord = mock(Record.class);
              Record followupCaseRecord = mock(Record.class);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Account")
                      .withField("Name", input.getAccountName())
                      .build())
                  .thenReturn(accountRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Contact")
                      .withField("FirstName", input.getFirstName())
                      .withField("LastName", input.getLastName())
                      .build())
                  .thenReturn(contactRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("Subject", input.getSubject())
                      .withField("Description", input.getDescription())
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(serviceCaseRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("ParentId", serviceCaseRefId)
                      .withField("Subject", "Follow Up")
                      .withField("Description", "Follow up with Customer")
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(followupCaseRecord);

              when(unitOfWorkBuilder.registerCreate(accountRecord)).thenReturn(accountRefId);
              when(unitOfWorkBuilder.registerCreate(contactRecord)).thenReturn(contactRefId);
              when(unitOfWorkBuilder.registerCreate(serviceCaseRecord))
                  .thenReturn(serviceCaseRefId);
              when(unitOfWorkBuilder.registerCreate(followupCaseRecord))
                  .thenReturn(followupCaseRefId);
              when(unitOfWorkBuilder.build()).thenReturn(unitOfWork);

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
                      return List.of("LastName");
                    }
                  };
              errors.add(validationError);
              when(mockOrg.getDataApi().commitUnitOfWork(unitOfWork))
                  .thenThrow(new DataApiException("One or more API errors occurred", errors));

              return Optional.of(mockOrg);
            });

    return mockContext;
  }

  /**
   * Create a mock for Context with an empty input object
   *
   * @param input
   * @return Context
   */
  private Context createEmptyContext(FunctionInput input) {
    Context mockContext = mock(Context.class);

    when(mockContext.getOrg())
        .then(
            i1 -> {
              Org mockOrg = mock(Org.class, Mockito.RETURNS_DEEP_STUBS);

              UnitOfWorkBuilder unitOfWorkBuilder = mock(UnitOfWorkBuilder.class);
              UnitOfWork unitOfWork = mock(UnitOfWork.class);

              when(mockOrg.getDataApi().newUnitOfWorkBuilder()).thenReturn(unitOfWorkBuilder);

              ReferenceId accountRefId = mock(ReferenceId.class);
              ReferenceId contactRefId = mock(ReferenceId.class);
              ReferenceId serviceCaseRefId = mock(ReferenceId.class);
              ReferenceId followupCaseRefId = mock(ReferenceId.class);

              Record accountRecord = mock(Record.class);
              Record contactRecord = mock(Record.class);
              Record serviceCaseRecord = mock(Record.class);
              Record followupCaseRecord = mock(Record.class);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Account")
                      .withField("Name", input.getAccountName())
                      .build())
                  .thenReturn(accountRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Contact")
                      .withField("FirstName", input.getFirstName())
                      .withField("LastName", input.getLastName())
                      .build())
                  .thenReturn(contactRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("Subject", input.getSubject())
                      .withField("Description", input.getDescription())
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(serviceCaseRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("ParentId", serviceCaseRefId)
                      .withField("Subject", "Follow Up")
                      .withField("Description", "Follow up with Customer")
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(followupCaseRecord);

              when(unitOfWorkBuilder.registerCreate(accountRecord)).thenReturn(accountRefId);
              when(unitOfWorkBuilder.registerCreate(contactRecord)).thenReturn(contactRefId);
              when(unitOfWorkBuilder.registerCreate(serviceCaseRecord))
                  .thenReturn(serviceCaseRefId);
              when(unitOfWorkBuilder.registerCreate(followupCaseRecord))
                  .thenReturn(followupCaseRefId);
              when(unitOfWorkBuilder.build()).thenReturn(unitOfWork);

              when(mockOrg.getDataApi().commitUnitOfWork(unitOfWork))
                  .thenThrow(DataApiException.class);

              return Optional.of(mockOrg);
            });

    return mockContext;
  }

  /**
   * Creates a valid Input Object
   *
   * @return FunctionInput
   */
  private FunctionInput createValidInput() {
    return new FunctionInput("a", "b", "c", "d", "e");
  }

  /**
   * Creates an invalid Input Object
   *
   * @return FunctionInput
   */
  private FunctionInput createInvalidInput() {
    return new FunctionInput(
        "a",
        "data value too large: This is a very long string that isn't valid in this line, please"
            + " reduce it",
        "c",
        "d",
        "e");
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
