import { expect } from "chai";
import createSandbox from "sinon/lib/sinon/create-sandbox.js";

import execute from "../index.js";

/**
 * environmentjs Function unit tests.
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

  it("Invoke SecretsFunction without password", async () => {
    try {
      // Invoke function without a password
      await execute({ data: {} }, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(/provide a password/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });

  it("Invoke SecretsFunction without secrets", async () => {
    try {
      // Invoke function without secrets
      await execute({ data: { password: "test" } }, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(/setup PASSWORD_SALT as Environment/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });

  it("Invoke SecretsFunction successfully", async () => {
    // Return Secrets
    // Setup Environment
    process.env.PASSWORD_SALT = "make this a random passphrase";

    // Invoke function
    const results = await execute(
      { data: { password: "test" } },
      mockContext,
      mockLogger
    );

    // Validate
    expect(results).to.be.not.undefined;
    expect(results).to.be.equal(
      "65caefdd6c5ca8d667ee4ec37b5df42cdac0803dc4e9b963be4c4d18d06cbcd5"
    );
  });
});
