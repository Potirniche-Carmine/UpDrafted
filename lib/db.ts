import { config } from 'dotenv';

// Load environment variables based on environment
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
} else {
  config(); // Use default .env file or system environment variables
}

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ 
  connectionString,
  max: 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, 
});

export const db = drizzle(pool, { schema });

export { pool };