import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection pool for better performance
const pool = new Pool({ 
  connectionString,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Timeout after 5 seconds if no connection is available
});

// Export the pool for database operations
export { pool };

// Helper function for single queries (non-pooled)
export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
} 