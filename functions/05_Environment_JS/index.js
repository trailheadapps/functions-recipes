import crypto from "crypto";
import { promisify } from "util";

// Turn pbkdf2 function from callback based to Promises
const pbkdf2 = promisify(crypto.pbkdf2);

/**
 * Returns the derivate password hash using pbkdf2 getting the salt from the Environment.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
export default async function (event, context, logger) {
  logger.info(
    `Invoking environmentjs Function with payload ${JSON.stringify(
      event.data || {}
    )}`
  );

  const keyLength = event.data.keyLength || 32;
  const password = event.data.password;

  if (!password || typeof password !== "string") {
    throw new Error("Please provide a password to encrypt");
  }

  // Get secret "salt" from "private" secrets store
  const salt = process.env.PASSWORD_SALT;
  if (!salt) {
    throw new Error("Please setup PASSWORD_SALT as Environment Variable");
  }

  // Calculate the password derivate using the pbkdf2 algorithm
  // More information can be found here:
  // https://nodejs.org/dist/latest-v14.x/docs/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
  const results = await pbkdf2(password, salt, 10e3, keyLength, "sha512");
  return results.toString("hex");
}
