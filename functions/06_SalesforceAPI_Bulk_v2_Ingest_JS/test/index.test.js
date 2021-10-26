import { expect } from "chai";
import createSandbox from "sinon/lib/sinon/create-sandbox.js";

import execute from "../index.js";

/**
 * Bulkapijs unit tests.
 */

describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;
  let accounts;

  beforeEach(() => {
    mockContext = {
      org: {
        dataApi: { query: () => {} }
      },
      logger: { info: () => {} }
    };

    mockLogger = mockContext.logger;
    sandbox = createSandbox();

    sandbox.stub(mockContext.org.dataApi, "query");
    sandbox.stub(mockLogger, "info");

    accounts = {
      totalSize: 3,
      done: true,
      records: [
        {
          type: "Account",
          fields: { Name: "Global Media" }
        },
        {
          type: "Account",
          fields: { Name: "Acme" }
        },
        {
          type: "Account",
          fields: { Name: "salesforce.com" }
        }
      ]
    };

    mockContext.org.dataApi.query.callsFake(() => {
      return Promise.resolve(accounts);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke Bulkapijs", async () => {
    const results = await execute({ data: {} }, mockContext, mockLogger);

    expect(mockContext.org.dataApi.query.callCount).to.be.eql(1);
    expect(mockLogger.info.callCount).to.be.eql(2);
    expect(results).to.be.not.undefined;
    expect(results).has.property("totalSize");
    expect(results.totalSize).to.be.eql(accounts.totalSize);
  });
});
