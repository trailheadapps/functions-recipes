package com.salesforce.functions.recipes;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.Test;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;
import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.recipes.db.InvocationsManager;
import com.salesforce.functions.recipes.utils.Environment;

public class FunctionTest {

  private final String INVOCATION_ID = "c4f3c4f3-c4f3-c4f3-c4f3-c0ff33c0ff33";
  private final List<Invocation> INVOCATIONS = new ArrayList<Invocation>(
      Arrays.asList(new Invocation(INVOCATION_ID, Timestamp.valueOf("2022-11-24 12:30:00")),
          new Invocation("7e2b97ba-8950-4e83-90c9-441b04b30737",
              Timestamp.valueOf("2022-11-25 11:11:00"))));

  @Test
  public void testSuccess() throws Exception {
    PostgresJavaFunction function = new PostgresJavaFunction();
    FunctionInput input = new FunctionInput();
    input.setLimit(2);

    // Create a mock of the InvocationsManager
    try (MockedConstruction<InvocationsManager> mocked =
        mockConstruction(InvocationsManager.class, (mock, context) -> {
          context.arguments().forEach(arg -> {
            if (arg instanceof String) {
              mockStatic(Environment.class).when(Environment::getDatabaseUrl)
                  .thenReturn("postgres://localhost:5432");
            }
          });

          verify(mock, times(1)).addInvocation(INVOCATION_ID);
          verify(mock, times(1)).getInvocations(input.getLimit());
          when(mock.getInvocations(2)).thenReturn(new Invocations(INVOCATIONS));
          Invocations invocations = function.apply(createEventMock(input), createContextMock());
          assertEquals(invocations.getInvocations().size(), 2);
          assertEquals(invocations.getInvocations().get(0).getId(), INVOCATION_ID);
          assertEquals(invocations.getInvocations(), INVOCATIONS);
        });) {
    }
  }

  @Test
  public void testNoUrl() {
    PostgresJavaFunction function = new PostgresJavaFunction();

    // Create a mock of the InvocationsManager
    try (MockedConstruction<InvocationsManager> mocked =
        mockConstruction(InvocationsManager.class, (mock, context) -> {
          context.arguments().forEach(arg -> {
            if (arg instanceof String) {
              // It should throw an exception if the URL is not set
              mockStatic(Environment.class).when(Environment::getDatabaseUrl)
                  .thenThrow(IllegalStateException.class);
            }
          });
          // It should fail when the Environment class returns an empty URL
          assertThrows(IllegalStateException.class, () -> {
            function.apply(createEventMock(new FunctionInput()), createContextMock());
          });
        })) {}
  }

  @Test
  public void testEnvironmentSuccess() {
    try (MockedStatic<Environment> mockEnvironment = mockStatic(Environment.class)) {
      mockEnvironment.when(Environment::getDatabaseUrl)
          .thenReturn("jdbc:postgresql://localhost:5432/postgres");
      assertEquals(Environment.getDatabaseUrl(), "jdbc:postgresql://localhost:5432/postgres");
    }
  }

  @Test
  public void testEnvironmentFail() {
    // It should fail when the Environment class throws an exception
    try (MockedStatic<Environment> mockEnvironment = mockStatic(Environment.class)) {
      mockEnvironment.when(Environment::getDatabaseUrl).thenThrow(IllegalStateException.class);
      assertThrows(IllegalStateException.class, () -> {
        Environment.getDatabaseUrl();
      });
    }
  }

  /**
   * Creates a mock for Context
   *
   * @return Context
   */
  private Context createContextMock() {
    Context mockContext = mock(Context.class);
    when(mockContext.getId()).thenReturn(INVOCATION_ID);
    return mockContext;
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
