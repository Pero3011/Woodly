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

// Temporary compatibility export for routes still being migrated.
export async function getDatabaseConnection(): Promise<PoolClient> {
  return pool.connect();
}
