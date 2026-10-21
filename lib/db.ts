import { Pool, PoolClient } from "pg";

let pool: Pool;

export async function getDatabaseConnection(): Promise<PoolClient> {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
    });
  }
  return await pool.connect();
}
