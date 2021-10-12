import { expect } from "chai";
import createSandbox from "sinon/lib/sinon/create-sandbox.js";
import { readFileSync } from "fs";
const testResponse = JSON.parse(
  readFileSync(new URL("../data/test-data.json", import.meta.url))
);
const testPayload = JSON.parse(
  readFileSync(new URL("../data/sample-payload.json", import.meta.url))
);
const testInvalidPayload = JSON.parse(
  readFileSync(new URL("../data/sample-invalid-payload.json", import.meta.url))
);
import execute from "../index.js";
/**
 * salesforcesdkjs Function unit tests.
 */
describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;

  beforeEach(() => {
    mockContext = {
      org: {
        dataApi: { query: () => {}, create: () => {} }
      },
      logger: { info: () => {}, error: () => {} }
    };

    mockLogger = mockContext.logger;
    sandbox = createSandbox();

    sandbox.stub(mockContext.org.dataApi, "query");
    sandbox.stub(mockContext.org.dataApi, "create");
    sandbox.stub(mockLogger, "info");
    sandbox.stub(mockLogger, "error");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke salesforcesdkjs Function with correct data", async () => {
    const accounts = testResponse;
    const payload = testPayload;

    mockContext.org.dataApi.create.callsFake(() => {
      return Promise.resolve({ id: "0010x00001Di8z7AAB" });
    });

    mockContext.org.dataApi.query.callsFake(() => {
      return Promise.resolve(accounts);
    });

    // Invoke function
    const results = await execute({ data: payload }, mockContext, mockLogger);

    // Validate
    expect(mockContext.org.dataApi.create.callCount).to.be.eql(1);
    expect(mockContext.org.dataApi.query.callCount).to.be.eql(1);
    expect(results).to.be.not.undefined;
    expect(results.totalSize).to.be.eql(accounts.totalSize);
  });

  it("Invoke salesforcesdkjs Function without an Account Name", async () => {
    const payload = {};

    try {
      // Invoke function with an empty payload
      await execute({ data: payload }, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(/provide account name/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });

  it("Invoke salesforcesdkjs Function with an invalid payload", async () => {
    const payload = testInvalidPayload;

    // Simulate a DML error
    mockContext.org.dataApi.create.callsFake(() => {
      return Promise.reject(new Error("error"));
    });

    // Invoke function
    try {
      await execute({ data: payload }, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(
        /Failed to insert record. Root Cause: error/
      );
    }
  });
});
