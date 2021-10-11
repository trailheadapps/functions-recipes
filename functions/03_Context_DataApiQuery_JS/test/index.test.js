import { expect } from "chai";
import createSandbox from "sinon/lib/sinon/create-sandbox.js";

import execute from "../index.js";

/**
 * dataapiqueryjs Function unit tests.
 */
describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;

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
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke dataapiqueryjs Function with keyword", async () => {
    // Mock Accounts query
    const accounts = {
      totalSize: 1,
      done: true,
      records: [
        {
          attributes: {
            type: "Account",
            url: "/services/data/v53.0/sobjects/Account/0018A00000bmUOkQAM"
          },
          Id: "0018A00000bmUOkQAM",
          Name: "Burlington Textiles Corp of America",
          Contacts: {
            totalSize: 1,
            done: true,
            records: [
              {
                attributes: {
                  type: "Contact",
                  url: "/services/data/v53.0/sobjects/Contact/0038A00000YJqSvQAL"
                },
                Name: "Jack Rogers",
                Email: "jrogers@burlington.com"
              }
            ]
          }
        }
      ]
    };

    mockContext.org.dataApi.query.callsFake(() => {
      return Promise.resolve(accounts);
    });

    // Invoke function
    const results = await execute(
      { data: { keyword: "america" } },
      mockContext,
      mockLogger
    );

    // Validate
    expect(mockContext.org.dataApi.query.callCount).to.be.eql(1);
    expect(mockLogger.info.callCount).to.be.eql(2);
    expect(results).to.be.not.undefined;
    expect(results).has.property("totalSize");
    expect(results.totalSize).to.be.eql(accounts.totalSize);
  });

  it("Invoke dataapiqueryjs Function without keyword", async () => {
    try {
      // Invoke function without keyword
      await execute({ data: {} }, mockContext, mockLogger);
    } catch (err) {
      expect(mockContext.org.dataApi.query.callCount).to.be.eql(0);
      expect(mockLogger.info.callCount).to.be.eql(1);
      expect(err).to.be.not.null;
      expect(err.message).to.match(/specify a keyword/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });
});
