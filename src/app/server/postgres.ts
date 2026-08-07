import "server-only";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __bloomPgPool: Pool | undefined;
}

export function getPool(): Pool {
  if (global.__bloomPgPool) {
    return global.__bloomPgPool;
  }

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL (or POSTGRES_URL) is required for sync API.");
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  global.__bloomPgPool = pool;
  return pool;
}
