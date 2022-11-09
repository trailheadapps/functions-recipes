import pg from "pg";
const { Client } = pg;

/**
 * Represents the options to create a PostgreSQL client.
 * @typedef {Object} ClientOptions
 * @property {string} url - The URL of the PostgreSQL instance
 */

/**
 * Connects to the PostgreSQL instance.
 * @param {ClientOptions} input The options to create a PostgreSQL client
 * @returns {Client} A connected PostgreSQL client
 */
export async function pgConnect({ url }) {
  if (!url) {
    throw new Error(
      "database url is not set, please set up the DATABASE_URL environment variable"
    );
  }

  // Connect to PostgreSQL
  const client = new Client({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  // Create a invocations table if it doesn't exist
  // Note: It is recommended to create this table outside the function execution
  // using a provision script or a migration tool. This is just for demo purposes.
  await client.query(`
    CREATE TABLE IF NOT EXISTS invocations (
        id VARCHAR(255) PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return client;
}
