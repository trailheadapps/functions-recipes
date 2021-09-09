@isTest
private class GenericFunctionInvokerTest {
    /*@isTest
    static void returnsResponseOnSuccessfulInvocation() {
        // GIVEN
        Test.setMock(functions.FunctionInvokeMock.class, new FunctionsInvokeMockInner());

        // WHEN
        Test.startTest();
        String response = GenericFunctionInvoker.invoke('myFunc', '{ recordId : "111"}');
        Test.stopTest();

        // THEN
        System.assertEquals(FunctionsInvokeMockInner.response, response);
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
            GenericFunctionInvoker.invoke('myFunc', '{ recordId : "111"}');
            Test.stopTest();
            System.assert(false, 'Exception expected');
        } catch (Exception e) {
            // THEN
            System.assert(e instanceof CalloutException, 'Expected CalloutException');
            System.assertEquals(FunctionsInvokeMockInner.error, e.getMessage());
        }
    }

    public class FunctionsInvokeMockInner implements functions.FunctionInvokeMock {
        public static String response = 'Success!';
        public static String error = 'Function returned an error!';
        public Boolean throwError = false;
        private String invocationId = '000000000000000';

        public functions.FunctionInvocation respond(String functionName, String payload) {
            if(throwError) {
                return functions.MockFunctionInvocationFactory.createErrorResponse(
                    invocationId,
                    functions.FunctionErrorType.FUNCTION_EXCEPTION,
                    error);
            }
    
            return functions.MockFunctionInvocationFactory.createSuccessResponse(invocationId, response);
       }
    }*/
}