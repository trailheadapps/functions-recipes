import { expect } from "chai";
import createSandbox from "sinon/lib/sinon/create-sandbox.js";
import { readFileSync } from "fs";
const testPayload = JSON.parse(
  readFileSync(new URL("../data/sample-payload.json", import.meta.url))
);
import execute from "../index.js";
/**
 * unitofworkjs Function unit tests.
 */
describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;
  let mockResponse;
  let mockUnitOfWork;

  const resultIds = {
    accountId: "0012F000ACTFN",
    contactId: "0012F000CTCFN",
    serviceCaseId: "0012F000CSELFN",
    folowupCaseId: "0012F000CSALFN"
  };

  beforeEach(() => {
    mockContext = {
      org: {
        dataApi: { newUnitOfWork: () => {}, commitUnitOfWork: () => {} },
        user: { id: "0052F000009KLZS" }
      },
      logger: { info: () => {}, error: () => {} }
    };
    mockUnitOfWork = {
      registerCreate: () => {}
    };
    mockResponse = {
      get: () => {}
    };
    mockLogger = mockContext.logger;

    sandbox = createSandbox();
    sandbox.stub(mockContext.org.dataApi, "newUnitOfWork");
    sandbox.stub(mockContext.org.dataApi, "commitUnitOfWork");
    sandbox.stub(mockUnitOfWork, "registerCreate");
    sandbox.stub(mockResponse, "get");
    sandbox.stub(mockLogger, "info");
    sandbox.stub(mockLogger, "error");
    mockContext.org.dataApi.newUnitOfWork.callsFake(() => {
      return mockUnitOfWork;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke unitofworkjs Function successfully", async () => {
    mockUnitOfWork.registerCreate.callsFake(() => {
      return "referenceId";
    });
    mockResponse.get.onCall(0).returns({ id: "0012F000ACTFN" });
    mockResponse.get.onCall(1).returns({ id: "0012F000CTCFN" });
    mockResponse.get.onCall(2).returns({ id: "0012F000CSELFN" });
    mockResponse.get.onCall(3).returns({ id: "0012F000CSALFN" });

    // set the mock promise response for work.commit()
    mockContext.org.dataApi.commitUnitOfWork.callsFake(() => {
      return Promise.resolve(mockResponse);
    });

    // Invoke functions
    const results = await execute(
      { data: testPayload },
      mockContext,
      mockLogger
    );

    // Validate
    expect(mockContext.org.dataApi.commitUnitOfWork.callCount).to.be.eql(1);
    expect(results).to.be.not.undefined;
    expect(results).has.property("accountId");
    expect(results).has.property("contactId");
    expect(results).has.property("cases");
    expect(results.accountId).to.be.eql(resultIds.accountId);
    expect(results.contactId).to.be.eql(resultIds.contactId);
    expect(results.cases.serviceCaseId).to.be.eql(resultIds.serviceCaseId);
    expect(results.cases.followupCaseId).to.be.eql(resultIds.folowupCaseId);
  });
});
