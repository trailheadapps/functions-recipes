import chai from "chai";
import sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
import quibble from "quibble";

chai.use(chaiAsPromised);
const expect = chai.expect;

/**
 * redisjs unit tests.
 */

describe("Unit Tests", () => {
  const REDIS_URL = "redis://localhost:6379";
  let clock;
  let execute;
  let sandbox;
  let mockDb;
  let mockClient;
  let mockContext;
  let mockLogger;
  let results;

  beforeEach(async () => {
    process.env.REDIS_URL = REDIS_URL;

    mockContext = {
      id: "c4f3c4f3-c4f3-c4f3-c4f3-c0ff33c0ff33"
    };

    mockDb = {
      redisConnect: () => {}
    };

    mockClient = {
      set: () => {},
      lPush: () => {},
      lRange: () => {},
      ttl: () => {},
      expire: () => {},
      quit: () => {}
    };

    mockLogger = {
      info: () => {},
      error: () => {}
    };

    sandbox = createSandbox();

    sandbox.stub(mockLogger, "info");
    sandbox.stub(mockLogger, "error");
    sandbox.stub(mockDb, "redisConnect");
    sandbox.stub(mockClient, "set");
    sandbox.stub(mockClient, "lPush");
    sandbox.stub(mockClient, "lRange");
    sandbox.stub(mockClient, "ttl");
    sandbox.stub(mockClient, "expire");
    sandbox.stub(mockClient, "quit");

    results = {
      invocations: [
        mockContext.id,
        "cd076488-1600-4fe2-99ba-36f872a3f185",
        "7e2b97ba-8950-4e83-90c9-441b04b30737"
      ],
      lastInvocationId: mockContext.id,
      lastInvocationTime: "2022-11-24T05:00:00.000Z"
    };

    // Mock the pgConnect function with specific input parameters
    mockDb.redisConnect.withArgs({ url: REDIS_URL }).resolves(mockClient);
    // Mock the pgConnect function without input parameters
    mockDb.redisConnect.rejects(
      new Error(
        "database url is not set, please set up the REDIS_URL environment variable"
      )
    );

    mockClient.set.onCall(0).callsFake(() => {
      return Promise.resolve();
    });

    mockClient.set.onCall(1).callsFake(() => {
      return Promise.resolve();
    });

    mockClient.lPush.callsFake(() => {
      return Promise.resolve();
    });

    mockClient.lRange.callsFake(() => {
      return Promise.resolve(results.invocations);
    });

    mockClient.ttl.callsFake(() => {
      return Promise.resolve(-1);
    });

    mockClient.expire.callsFake(() => {
      return Promise.resolve();
    });

    mockClient.quit.callsFake(() => {
      return Promise.resolve();
    });

    clock = sinon.useFakeTimers({
      now: new Date(2022, 10, 24, 0, 0),
      shouldAdvanceTime: true,
      toFake: ["Date"]
    });

    // Mock the db.js library
    await quibble.esm("../lib/db.js", mockDb);
    execute = (await import("../index.js")).default;
  });

  afterEach(() => {
    sandbox.restore();
    quibble.reset();
    clock.restore();
  });

  it("Invoke redisjs without REDIS_URL", async () => {
    delete process.env.REDIS_URL;
    await expect(
      execute({ data: {} }, mockContext, mockLogger)
    ).to.be.rejectedWith(
      /database url is not set, please set up the REDIS_URL environment variable/
    );
  });

  it("Invoke redisjs with REDIS_URL", async () => {
    const result = await execute({ data: {} }, mockContext, mockLogger);

    expect(mockClient.set.callCount, "Execute 2 SET").to.be.eql(2);
    expect(mockClient.lPush.callCount, "Execute 1 LPUSH").to.be.eql(1);
    expect(mockClient.lRange.callCount, "Execute 1 LRANGE").to.be.eql(1);
    expect(mockClient.ttl.callCount, "Execute 1 TTL").to.be.eql(1);
    expect(mockClient.expire.callCount, "Execute 1 EXPIRE").to.be.eql(1);
    expect(mockClient.quit.callCount, "Close the connection").to.be.eql(1);
    expect(mockLogger.info.callCount, "Log the payload").to.be.eql(1);
    expect(result, "Return invocations").to.be.not.undefined;
    expect(result, "Return the expected invocations").to.be.eql(results);
    expect(
      result.lastInvocationId,
      "Return the expected lastInvocationId"
    ).to.be.eql(mockContext.id);
  });
});
