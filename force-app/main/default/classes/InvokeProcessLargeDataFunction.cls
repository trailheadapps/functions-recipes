public inherited sharing class InvokeProcessLargeDataFunction {
  @AuraEnabled
  public static String invoke(String payload) {
    // Instantiate the function
    functions.Function ldvFunction = functions.Function.get(
      'functions_recipes.processlargedatajs'
    );

    // Invoke the function
    functions.FunctionInvocation invocation = ldvFunction.invoke(payload);

    // Check if there is any error during the invocation
    if (invocation.getStatus() == functions.FunctionInvocationStatus.ERROR) {
      throw new CalloutException(
        (invocation.getError() != null
          ? invocation.getError().getMessage()
          : 'UNKNOWN')
      );
    }

    String response = invocation.getResponse();

    // Return the response to the flow
    return response;
  }
}
