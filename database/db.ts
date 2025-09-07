import { config } from 'dotenv';

// Load environment variables based on environment
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
} else {
  config(); // Use default .env file or system environment variables
}

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from '../utils/env';

const connectionString = env.DATABASE_URL;

// Singleton pattern for database connection
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createDatabaseConnection() {
  if (pool && db) {
    return { pool, db };
  }

  pool = new Pool({ 
    connectionString,
    max: 20, 
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('Database connection error:', err.message);
    pool = null;
    db = null;
  });

  if (!process.listenerCount('SIGINT')) {
    process.on('SIGINT', async () => {
      if (pool) {
        await pool.end();
        pool = null;
        db = null;
      }
    });
  }

  db = drizzle(pool, { schema });
  return { pool, db };
}

const { pool: dbPool, db: database } = createDatabaseConnection();

export { database as db, dbPool as pool };