@isTest
private class InvokeProcessLargeDataFunctionFlowTest {
  @isTest
  static void returnsResponseOnSuccessfulInvocation() {
    // GIVEN
    FunctionsInvokeMockInner mock = new FunctionsInvokeMockInner();
    Test.setMock(functions.FunctionInvokeMock.class, mock);

    // WHEN
    Test.startTest();
    List<InvokeProcessLargeDataFunctionFlow.Input> inputs = new List<InvokeProcessLargeDataFunctionFlow.Input>();
    InvokeProcessLargeDataFunctionFlow.Input input = new InvokeProcessLargeDataFunctionFlow.Input();
    input.latitude = '33';
    input.longitude = '-11';
    inputs.add(input);

    List<InvokeProcessLargeDataFunctionFlow.School> response = InvokeProcessLargeDataFunctionFlow.findSchools(
      inputs
    );
    Test.stopTest();

    // THEN
    Assert.areEqual('ApexSchool', response.get(0).name, 'name should be equal');
    Assert.areEqual(
      'Apex is fun',
      response.get(0).description,
      'description should be equal'
    );
    Assert.areEqual(
      '123 Apex',
      response.get(0).street,
      'street should be equal'
    );
    Assert.areEqual('Apexville', response.get(0).city, 'city should be equal');
    Assert.areEqual('12345', response.get(0).zip, 'zip should be equal');
    Assert.areEqual('CA', response.get(0).state, 'state should be equal');
  }

  @IsTest
  static void throwsExceptionOnErrorInvocation() {
    // GIVEN
    FunctionsInvokeMockInner mock = new FunctionsInvokeMockInner();
    mock.throwError = true;
    Test.setMock(functions.FunctionInvokeMock.class, mock);

    // WHEN
    try {
      Test.startTest();
      List<InvokeProcessLargeDataFunctionFlow.Input> inputs = new List<InvokeProcessLargeDataFunctionFlow.Input>();
      InvokeProcessLargeDataFunctionFlow.Input input = new InvokeProcessLargeDataFunctionFlow.Input();
      input.latitude = '33';
      input.longitude = '-11';
      inputs.add(input);

      InvokeProcessLargeDataFunctionFlow.findSchools(inputs);
      Test.stopTest();
      Assert.fail('Exception expected');
    } catch (Exception e) {
      // THEN
      System.assert(e instanceof CalloutException, 'Expected CalloutException');
      Assert.areEqual(
        mock.error,
        e.getMessage(),
        'error message should be equal'
      );
    }
  }

  public class FunctionsInvokeMockInner implements functions.FunctionInvokeMock {
    public String response = '{ "schools": [{"name": "ApexSchool", "zip": "12345", "description": "Apex is fun", "street": "123 Apex", "city": "Apexville", "state": "CA"}] }';
    public String error = 'Function returned an error!';
    public Boolean throwError = false;
    private String invocationId = '000000000000000';

    public functions.FunctionInvocation respond(
      String functionName,
      String payload
    ) {
      if (throwError) {
        return functions.MockFunctionInvocationFactory.createErrorResponse(
          invocationId,
          functions.FunctionErrorType.FUNCTION_EXCEPTION,
          error
        );
      }

      return functions.MockFunctionInvocationFactory.createSuccessResponse(
        invocationId,
        response
      );
    }
  }
}
