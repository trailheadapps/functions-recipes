import { expect } from "chai";
import { readFileSync } from "fs";
import createSandbox from "sinon/lib/sinon/create-sandbox.js";

import execute from "../index.js";
const payload = JSON.parse(
  readFileSync(new URL("../data/sample-payload.json", import.meta.url))
);

/**
 * processlargedatajs Function unit tests.
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

  it("Invoke ProcessLargeData with valid data", async () => {
    // Invoke function
    const results = await execute({ data: payload }, mockContext, mockLogger);

    // Validate
    expect(results).to.be.not.undefined;
    expect(results.schools).to.be.an("array");
    expect(results.schools.length).to.be.eql(payload.length);
  });

  it("Invoke ProcessLargeData with missing coordinates", async () => {
    try {
      // Invoke function with missing coordinates
      await execute({ data: {} }, mockContext, mockLogger);
    } catch (err) {
      expect(mockLogger.info.callCount).to.be.eql(1);
      expect(err.message).to.match(/provide latitude and longitude/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });
});
