import { expect } from "chai";
import { createSandbox } from "sinon";
import quibble from "quibble";

/**
 * postgresjs unit tests.
 */
describe("Unit Tests", () => {
  let execute;
  let sandbox;
  let mockDb;
  let mockClient;
  let mockContext;
  let mockLogger;
  let results;

  beforeEach(async () => {
    mockContext = {
      id: "c4f3c4f3-c4f3-c4f3-c4f3-c0ff33c0ff33"
    };
    mockDb = {
      pgConnect: () => {}
    };

    mockClient = {
      query: () => {},
      end: () => {}
    };

    mockLogger = {
      info: () => {},
      error: () => {}
    };
    sandbox = createSandbox();

    sandbox.stub(mockLogger, "info");
    sandbox.stub(mockLogger, "error");
    sandbox.stub(mockDb, "pgConnect");
    sandbox.stub(mockClient, "query");
    sandbox.stub(mockClient, "end");

    results = {
      rows: [
        {
          id: "c4f3c4f3-c4f3-c4f3-c4f3-c0ff33c0ff33",
          crated_at: "2022-10-24T19:26:40.629379+00"
        },
        {
          id: "cd076488-1600-4fe2-99ba-36f872a3f185",
          crated_at: "2022-10-24T19:26:48.23341+00"
        },
        {
          id: "7e2b97ba-8950-4e83-90c9-441b04b30737",
          crated_at: "2022-10-24T19:27:28.422286+00"
        }
      ]
    };

    mockDb.pgConnect.resolves(mockClient);

    mockClient.query.onCall(0).callsFake(() => {
      return Promise.resolve();
    });

    mockClient.query.onCall(1).callsFake(() => {
      return Promise.resolve(results);
    });

    mockClient.end.callsFake(() => {
      return Promise.resolve();
    });

    // Mock the db.js library
    await quibble.esm("../lib/db.js", mockDb);
    execute = (await import("../index.js")).default;
  });

  afterEach(() => {
    sandbox.restore();
    quibble.reset();
  });

  it("Invoke postgresjs", async () => {
    const invocations = await execute({ data: {} }, mockContext, mockLogger);

    expect(mockClient.query.callCount, "Execute 2 queries").to.be.eql(2);
    expect(mockClient.end.callCount, "Close the connection").to.be.eql(1);
    expect(mockLogger.info.callCount, "Log the payload").to.be.eql(1);
    expect(invocations, "Return invocations").to.be.not.undefined;
    expect(invocations, "Return the expected invocations").to.be.eql(
      results.rows
    );
  });
});
