import "dotenv/config";
import pg from "pg";
const { Client } = pg;

/**
 * Connects to the PostgreSQL instance.
 * @returns {Client} A connected PostgreSQL client
 */
export async function pgConnect() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  // Connect to PostgreSQL
  const client = new Client({
    connectionString: DATABASE_URL,
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
