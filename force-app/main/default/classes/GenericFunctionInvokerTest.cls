@isTest
private class GenericFunctionInvokerTest {
  @isTest
  static void returnsResponseOnSuccessfulInvocation() {
    // GIVEN
    FunctionsInvokeMockInner mock = new FunctionsInvokeMockInner();
    Test.setMock(functions.FunctionInvokeMock.class, mock);

    // WHEN
    Test.startTest();
    String response = GenericFunctionInvoker.invoke(
      'functions_recipes.processlargedatajs',
      '{ "recordId" : "111"}'
    );
    Test.stopTest();

    // THEN
    Assert.areEqual(mock.response, response, 'response should be equal');
  }

  @isTest
  static void throwsExceptionOnErrorInvocation() {
    // GIVEN
    FunctionsInvokeMockInner mock = new FunctionsInvokeMockInner();
    mock.throwError = true;
    Test.setMock(functions.FunctionInvokeMock.class, mock);

    // WHEN
    try {
      Test.startTest();
      GenericFunctionInvoker.invoke(
        'functions_recipes.processlargedatajs',
        '{ "recordId" : "111"}'
      );
      Test.stopTest();
      Assert.fail('Exception expected');
    } catch (Exception e) {
      // THEN
      Assert.isInstanceOfType(
        e,
        CalloutException.class,
        'Expected CalloutException'
      );
      Assert.areEqual(
        mock.error,
        e.getMessage(),
        'error message should be equal'
      );
    }
  }

  public class FunctionsInvokeMockInner implements functions.FunctionInvokeMock {
    public String response = 'Success!';
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
