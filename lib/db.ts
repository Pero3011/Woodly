import { Pool, type PoolClient } from "pg";

const globalForPg = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

function getPool(): Pool {
  if (globalForPg.pgPool) {
    return globalForPg.pgPool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const pool = new Pool({
    connectionString,
    max: 5,
  });

  globalForPg.pgPool = pool;

  return pool;
}

export async function getDatabaseConnection(): Promise<PoolClient> {
  return getPool().connect();
}

export default {
  query: (...args: Parameters<Pool["query"]>) => getPool().query(...args),
  connect: () => getPool().connect(),
};
