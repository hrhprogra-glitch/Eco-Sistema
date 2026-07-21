import { Pool, types, type QueryResultRow } from "pg";

// Postgres numeric/decimal (OID 1700) comes back as a string by default to avoid
// float precision loss on very large numbers. Our app's numeric columns (precios,
// costos, etc.) are small enough that this isn't a concern, and every type in
// src/components/*/types.ts declares these fields as `number` — so parse them as
// floats here once, instead of every caller having to coerce them individually.
types.setTypeParser(1700, (value) => parseFloat(value));

const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export function query<T extends QueryResultRow>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params as unknown[]);
}
