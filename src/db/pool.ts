import { Pool } from 'pg';

/**
 * Shared PostgreSQL connection pool used across middleware and routes.
 */
export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Gracefully closes pooled database connections.
 */
export async function closeDbPool(): Promise<void> {
  await dbPool.end();
}
