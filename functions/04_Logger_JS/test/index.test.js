import { expect } from "chai";
import createSandbox from "sinon/lib/sinon/create-sandbox.js";
import { useFakeTimers } from "sinon/lib/sinon/util/fake-timers.js";

import execute from "../index.js";
/**
 * loggerjs unit tests.
 */
describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;

  beforeEach(() => {
    mockContext = {
      logger: { info: () => {} }
    };

    mockLogger = mockContext.logger;
    sandbox = createSandbox();

    sandbox.stub(mockLogger, "info");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke loggerjs Function with default parameters", async () => {
    const clock = useFakeTimers();
    const results = await execute({ data: {} }, mockContext, mockLogger);

    // Advance the clock a full second
    clock.tick(60000);

    // Default amount is 5, 6 including the initial log message
    expect(mockLogger.info.callCount).to.be.eql(6);
    expect(results).to.be.not.undefined;
    expect(results).has.property("status");
    expect(results.status).match(/Generating 5 log messages/);
  });

  it("Invoke loggerjs Function with specific amount", async () => {
    const clock = useFakeTimers();
    const results = await execute(
      { data: { amount: 10 } },
      mockContext,
      mockLogger
    );

    // Advance the clock a full second
    clock.tick(60000);

    // Amount 10, 11 including the initial log message
    expect(mockLogger.info.callCount).to.be.eql(11);
    expect(results).to.be.not.undefined;
    expect(results).has.property("status");
    expect(results.status).match(/Generating 10 log messages/);
  });
});
