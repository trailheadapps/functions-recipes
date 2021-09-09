import "mocha";
import { expect } from "chai";
import { createSandbox, SinonSandbox } from "sinon";

import execute from "../index";
import { OrgInfo } from "../dist";

/**
 * orginfots Function unit tests.
 */
describe("Unit Tests", () => {
  let sandbox: SinonSandbox;
  let mockContext;
  let mockLogger;

  beforeEach(() => {
    sandbox = createSandbox();
    mockContext = {
      org: {
        id: "00D2F00C00L0RG",
        apiVersion: "53.0",
        baseUrl: "https://test.my.salesforce.com",
        domainUrl: "https://test.my.salesforce.com",
        user: {
          id: "",
          username: "test@salesforce.com",
          onBehalfOfUserId: ""
        },
        dataApi: { query: () => undefined }
      },
      logger: { info: () => undefined }
    };
    mockLogger = mockContext.logger;
    sandbox.stub(mockContext.org.dataApi, "query");
    sandbox.stub(mockLogger, "info");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke OrgInfo Function without an org", async () => {
    try {
      // Invoke function without a bind Org
      mockContext.org = null;
      await execute({ data: {} } as any, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(/isn't bind to any organization/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });

  it("Invoke OrgInfo Function with an org", async () => {
    // Invoke function with a bind Org
    const result: OrgInfo = await execute(
      { data: {} } as any,
      mockContext,
      mockLogger
    );

    expect(result).to.not.be.undefined;
    expect(result.id).to.be.eq(mockContext.org.id);
    expect(result.apiVersion).to.be.eq(mockContext.org.apiVersion);
    expect(result.baseUrl).to.be.eq(mockContext.org.baseUrl);
    expect(result.domainUrl).to.be.eq(mockContext.org.domainUrl);
    expect(result.user).to.be.deep.equal(mockContext.org.user);
  });
});
