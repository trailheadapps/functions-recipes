public with sharing class GenericFunctionInvoker {
  @AuraEnabled
  public static String invoke(String functionName, String payload) {
    // Instantiate the function
    functions.Function function = functions.Function.get(functionName);

    // Invoke the function
    functions.FunctionInvocation invocation = function.invoke(payload);

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
