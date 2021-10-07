public with sharing class InvokeProcessLargeDataFunctionFlow {
  @InvocableMethod(label='Find Schools')
  public static List<School> findSchools(List<Input> input) {
    Input payload = input.get(0);
    // Get a Reference of the ProcessLargeData Function
    functions.Function fn = functions.Function.get(
      'functions_recipes.processlargedatajs'
    );
    // Invoke the ProcessLargeData Function
    functions.FunctionInvocation invocation = fn.invoke(
      JSON.serialize(payload)
    );

    // Check if there is any error during the invocation
    if (invocation.getStatus() == functions.FunctionInvocationStatus.ERROR) {
      throw new CalloutException(
        (invocation.getError() != null
          ? invocation.getError().getMessage()
          : 'UNKNOWN')
      );
    }

    String response = invocation.getResponse();
    // Serialize the Response into an Object
    Output output = (Output) JSON.deserialize(response, Output.class);
    return output.schools;
  }

  public class Input {
    @InvocableVariable
    public String latitude;
    @InvocableVariable
    public String longitude;
    @InvocableVariable
    public Integer length;
  }

  public class Output {
    @InvocableVariable
    public List<School> schools;
  }

  public class School {
    @InvocableVariable
    public String name;
    @InvocableVariable
    public String description;
    @InvocableVariable
    public String street;
    @InvocableVariable
    public String city;
    @InvocableVariable
    public String state;
    @InvocableVariable
    public String zip;
  }
}
