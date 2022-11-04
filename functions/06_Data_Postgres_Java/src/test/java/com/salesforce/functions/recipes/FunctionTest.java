package com.salesforce.functions.recipes;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.sql.Date;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.Test;
import org.mockito.MockedStatic;
import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.recipes.db.InvocationsManager;
import com.salesforce.functions.recipes.utils.Environment;

public class FunctionTest {

  private final String INVOCATION_ID = "c4f3c4f3-c4f3-c4f3-c4f3-c0ff33c0ff33";
  private final List<Invocation> INVOCATIONS = new ArrayList<Invocation>(
      Arrays.asList(new Invocation(INVOCATION_ID, Date.valueOf("2022-11-24")),
          new Invocation("7e2b97ba-8950-4e83-90c9-441b04b30737", Date.valueOf("2022-11-25"))));

  @Test
  public void testSuccess() throws Exception {
    PostgresJavaFunction function = new PostgresJavaFunction();

    // Create a mock of the InvocationsManager
    InvocationsManager invocationsManager = createInvocationsManagerMock();
    function.setInvocationsManager(invocationsManager);

    FunctionInput input = new FunctionInput();
    input.setLimit(2);

    Invocations invocations = function.apply(createEventMock(input), createContextMock());
    verify(invocationsManager, times(1)).insertInvocation(INVOCATION_ID);
    assertEquals(invocations.getInvocations().size(), 2);
    assertEquals(invocations.getInvocations().get(0).getId(), INVOCATION_ID);
    assertEquals(invocations.getInvocations(), INVOCATIONS);
  }

  @Test
  public void testNoUrl() throws Exception {
    PostgresJavaFunction function = new PostgresJavaFunction();

    // It should fail when the Environment class returns an empty URL
    assertThrows(IllegalStateException.class, () -> {
      function.apply(createEventMock(new FunctionInput()), createContextMock());
    });
  }

  @Test
  public void testEnvironmentSuccess() throws Exception {
    try (MockedStatic<Environment> mockEnvironment = mockStatic(Environment.class)) {
      mockEnvironment.when(Environment::getDatabaseUrl).thenReturn("jdbc:postgresql://localhost:5432/postgres");
      assertEquals(Environment.getDatabaseUrl(), "jdbc:postgresql://localhost:5432/postgres");
    }
  }

  @Test
  public void testEnvironmentFail() {
    // It should fail when the Environment class returns an empty URL
    assertThrows(IllegalStateException.class, () -> {
      Environment.getDatabaseUrl();
    });
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

  /**
   * Creates a mock for InvocationsManager
   * @return InvocationsManager
   */
  private InvocationsManager createInvocationsManagerMock() {
    InvocationsManager mockInvocationsManager = mock(InvocationsManager.class);
    try {
      when(mockInvocationsManager.selectInvocations(2)).thenReturn(new Invocations(INVOCATIONS));
    } catch (SQLException e) {
      throw new RuntimeException(e);
    }
    return mockInvocationsManager;
  }
}
