import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '../../.env.local'),
  path.resolve(__dirname, '../../../.env.local'),
];

const envPath = envCandidates.find((candidate) => existsSync(candidate));

if (process.env.NODE_ENV !== 'production') {
  config(envPath ? { path: envPath } : undefined);
} else {
  config();
}

const connectionString = process.env.DATABASE_URL;

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