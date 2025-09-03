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

const pool = new Pool({ 
  connectionString,
  max: 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Connection health monitoring
pool.on('error', (err) => {
  const sanitizedMsg = err.message.replace(/(password|pwd|token|key|secret)=[^&\s]+/gi, '$1=***');
  console.error('Unexpected database connection error:', sanitizedMsg);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  await pool.end();
  process.exit(0);
});

export const db = drizzle(pool, { schema });

export { pool };