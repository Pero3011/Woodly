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

  const isLocal =
    /localhost|127\.0\.0\.1/.test(connectionString) &&
    !connectionString.includes("neon.tech");

  const pool = new Pool({
    connectionString,
    max: 5,
    // Neon (and most hosted Postgres) requires TLS outside local dev.
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
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
