import { Pool, type PoolClient } from "pg";

const globalForPg = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  return new Pool({
    connectionString,
    max: 5,
  });
}

const pool = globalForPg.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export default pool;

// Compatibility wrapper for routes being migrated.
// Callers must use PostgreSQL query syntax and APIs.
export async function getDatabaseConnection(): Promise<PoolClient> {
  return pool.connect();
}