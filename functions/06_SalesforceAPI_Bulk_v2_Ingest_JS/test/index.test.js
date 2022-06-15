import { expect } from "chai";
import { MockAgent, setGlobalDispatcher } from "undici";
import createSandbox from "sinon/lib/sinon/create-sandbox.js";

import execute from "../index.js";

const mockAgent = new MockAgent();
setGlobalDispatcher(mockAgent);

const baseUrl = "https://test.salesforce.com";
const apiVersion = "53.0";
const accessToken = "this-is-so-secure";

const jobId = "7505e000007L8etAAC";
const accountsCsv = `
ExternalID__c,Name,Description,Website
aa51eb49-da99-4066-9ea5-c411fa3ed971,McLaughlin-Cruickshank,Persevering modular open architecture,http://zdnet.com
30061018-053d-4df3-b9d4-97c7beffc0ad,Davis-McCullough,Programmable neutral standardization,http://wired.com
6e8115d2-442b-4a32-9a04-0cf278a514fb,"Abbott, Kreiger and Hudson",Synchronised directional standardization,https://cpanel.net
0956c8a0-354b-4324-be38-87027ebd27c7,"Treutel, Conroy and Heathcote",Implemented value-added encoding,https://mozilla.org
fdc9486a-3cdb-4294-9758-34bb054eea92,Steuber-Jerde,Horizontal user-facing workforce,https://rakuten.co.jp
`;

// Mock HTTP Requests
const mockExternal = mockAgent.get(
  "https://external-accounts-site.herokuapp.com"
);
const mockSalesforce = mockAgent.get(baseUrl);
mockAgent.disableNetConnect();

/**
 *  bulkingestjs unit tests.
 */
describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;

  beforeEach(() => {
    // Mock External API Request
    mockExternal
      .intercept({
        path: "/accounts.csv",
        method: "GET"
      })
      .reply(200, accountsCsv);

    // Mock Salesforce Auth Token
    const authHeaders = {
      Authorization: `Bearer ${accessToken}`
    };

    // Mock Create Job
    mockSalesforce
      .intercept({
        path: `/services/data/v${apiVersion}/jobs/ingest`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders
        },
        body: JSON.stringify({
          operation: "upsert",
          object: "Account",
          contentType: "CSV",
          externalIdFieldName: "ExternalID__c"
        })
      })
      .reply(200, {
        id: jobId,
        operation: "upsert",
        object: "Account",
        createdById: "0055e0000046G6VAAU",
        createdDate: "2021-10-26T20:22:57.000+0000",
        systemModstamp: "2021-10-26T20:22:57.000+0000",
        state: "Open",
        concurrencyMode: "Parallel",
        contentType: "CSV",
        apiVersion: apiVersion,
        contentUrl: `services/data/v${apiVersion}/jobs/ingest/${jobId}/batches`,
        lineEnding: "LF",
        columnDelimiter: "COMMA"
      });

    // Mock Upload Batch
    mockSalesforce
      .intercept({
        path: `/services/data/v${apiVersion}/jobs/ingest/${jobId}/batches`,
        method: "PUT",
        headers: {
          "Content-Type": "text/csv",
          ...authHeaders
        }
      })
      .reply(201, "");

    // Mock Close Job
    mockSalesforce
      .intercept({
        path: `/services/data/v${apiVersion}/jobs/ingest/${jobId}`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders
        },
        body: JSON.stringify({
          state: "UploadComplete"
        })
      })
      .reply(200, {
        id: jobId,
        operation: "upsert",
        object: "Account",
        createdById: "0055e0000046G6VAAU",
        createdDate: "2021-10-26T20:22:57.000+0000",
        systemModstamp: "2021-10-26T20:22:57.000+0000",
        state: "UploadComplete",
        concurrencyMode: "Parallel",
        contentType: "CSV",
        apiVersion: apiVersion
      });

    mockContext = {
      org: {
        dataApi: {
          baseUrl,
          apiVersion,
          accessToken
        }
      },
      logger: { info: () => {}, error: () => {} }
    };

    mockLogger = mockContext.logger;
    sandbox = createSandbox();

    sandbox.stub(mockLogger, "info");
    sandbox.stub(mockLogger, "error");
  });

  afterEach(() => {
    sandbox.restore();
    mockExternal.close();
    mockSalesforce.close();
  });

  it("Invoke bulkingestjs", async () => {
    const results = await execute({ data: {} }, mockContext, mockLogger);

    expect(results).to.be.not.undefined;
    expect(results).to.have.property("id");
    expect(results).to.have.property("operation");
    expect(results).to.have.property("object");
    expect(results).to.have.property("state");
    expect(results.id).to.equal(jobId);
    expect(results.operation).to.equal("upsert");
    expect(results.object).to.equal("Account");
    expect(results.state).to.equal("UploadComplete");
  });
});
