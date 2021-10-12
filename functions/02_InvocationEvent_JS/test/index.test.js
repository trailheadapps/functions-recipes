import { expect } from "chai";
import createSandbox from "sinon/lib/sinon/create-sandbox.js";

import execute from "../index.js";

/**
 * invocationeventjs Function unit tests.
 */
describe("Unit Tests", () => {
  let time = Date.now();
  const event = {
    id: "c0ffee-00000-00000-00000000",
    dataContentType: "application/json; charset=utf-8",
    source: "urn:event:from:test",
    type: "com.evergreen.functions.test",
    time
  };

  let sandbox;
  let mockContext;
  let mockLogger;
  let mockEvent;

  beforeEach(() => {
    mockEvent = event;
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

  it("Invoke InvocationEvent with an object", async () => {
    // Invoke function
    mockEvent.data = {
      name: "payload",
      is: "object"
    };
    const results = await execute(mockEvent, mockContext, mockLogger);

    // Validate CloudEvent
    expect(mockLogger.info.callCount).to.be.eql(2);
    expect(results).to.be.not.undefined;
    expect(results.id).to.be.eql(event.id);
    expect(results.dataContentType).to.be.eql(event.dataContentType);
    expect(results.source).to.eql(event.source);
    expect(results.type).to.eql(event.type);
    expect(results.time).to.eql(event.time);

    // Validate payload info
    expect(results.payloadInfo).has.property("keys");
    expect(results.payloadInfo.keys).to.be.deep.eql(["name", "is"]);
    expect(results.payloadInfo.type).to.be.eql("object");
  });

  it("Invoke InvocationEvent with a number (invalid data)", async () => {
    try {
      // Invoke function with invalid input
      mockEvent.data = 42;
      await execute(mockEvent, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(/not supported/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });
});
