import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
import quibble from "quibble";

chai.use(chaiAsPromised);
const expect = chai.expect;

/**
 * postgresjs unit tests.
 */
describe("Unit Tests", () => {
  const DATABASE_URL = "postgres://postgres:postgres@localhost:5432/postgres";
  let execute;
  let sandbox;
  let mockDb;
  let mockClient;
  let mockContext;
  let mockLogger;
  let results;

  beforeEach(async () => {
    process.env.DATABASE_URL = DATABASE_URL;

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
          id: mockContext.id,
          created_at: "2022-11-24T05:00:00.000Z"
        },
        {
          id: "cd076488-1600-4fe2-99ba-36f872a3f185",
          created_at: "2022-11-24T05:10:00.000Z"
        },
        {
          id: "7e2b97ba-8950-4e83-90c9-441b04b30737",
          created_at: "2022-11-24T05:20:00.000Z"
        }
      ]
    };

    // Mock the pgConnect function with specific input parameters
    mockDb.pgConnect.withArgs({ url: DATABASE_URL }).resolves(mockClient);
    // Mock the pgConnect function without input parameters
    mockDb.pgConnect.rejects(
      new Error(
        "database url is not set, please set up the DATABASE_URL environment variable"
      )
    );

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

  it("Invoke postgresjs without DATABASE_URL", async () => {
    delete process.env.DATABASE_URL;
    await expect(
      execute({ data: {} }, mockContext, mockLogger)
    ).to.be.rejectedWith(
      /database url is not set, please set up the DATABASE_URL environment variable/
    );
  });

  it("Invoke postgresjs with DATABASE_URL", async () => {
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
