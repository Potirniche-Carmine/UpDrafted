import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables based on environment
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
} else {
  config(); // Use default .env file or system environment variables
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

export default defineConfig({
  schema: './database/schema.ts',
  out: './database/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
}); 