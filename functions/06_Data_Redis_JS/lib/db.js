import { createClient } from "redis";

/**
 * Represents the options to create a Redis client.
 * @typedef {Object} ClientOptions
 * @property {string} url - The URL of the Redis instance
 */

/**
 * Connects to a Redis instance.
 * @param {ClientOptions} input The options to create a Redis client
 * @returns {RedisClientType} A connected Redis client
 */
export async function redisConnect({ url }) {
  if (!url) {
    throw new Error(`url is not set`);
  }

  // Connect to Redis
  const redisClient = createClient({
    url,
    socket: {
      tls: true,
      rejectUnauthorized: false
    }
  });
  await redisClient.connect();
  return redisClient;
}
