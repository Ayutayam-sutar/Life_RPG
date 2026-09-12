import { Pool, PoolClient } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[Neon DB] ERROR: DATABASE_URL environment variable is not set.');
}

/**
 * Neon PostgreSQL Serverless Connection Pool
 * Uses the pooled DATABASE_URL string from .env.
 */
export const pool = new Pool({
  connectionString: connectionString || '',
});

/**
 * Parameterized query runner — prevents SQL injection via $1, $2, etc.
 */
export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

/**
 * ACID Transaction runner
 * Automatically issues BEGIN, runs callback, and performs COMMIT or ROLLBACK
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
