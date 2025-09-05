import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Clerk Authentication
  CLERK_SECRET_KEY: z.string().min(32, 'CLERK_SECRET_KEY must be at least 32 characters'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(32, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be at least 32 characters'),
  
  // Encryption
  MESSAGE_ENCRYPTION_KEY: z.string().min(32, 'MESSAGE_ENCRYPTION_KEY must be at least 32 characters'),
  
  // R2 Configuration
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required'),
  R2_PUBLIC_BUCKET_NAME: z.string().min(1, 'R2_PUBLIC_BUCKET_NAME is required'),
  R2_PUBLIC_URL: z.string().url('R2_PUBLIC_URL must be a valid URL').optional(),
  NEXT_PUBLIC_R2_PUBLIC_URL: z.string().url('NEXT_PUBLIC_R2_PUBLIC_URL must be a valid URL').optional(),
  // R2_PRIVATE_BUCKET_NAME is required in production, optional in development
  R2_PRIVATE_BUCKET_NAME: z.string().min(1, 'R2_PRIVATE_BUCKET_NAME is required in production').optional().refine(
    (val) => {
      // In production, this field is required
      if (process.env.NODE_ENV === 'production' && !val) {
        return false;
      }
      return true;
    },
    {
      message: 'R2_PRIVATE_BUCKET_NAME is required in production environment'
    }
  ),
  
  // Optional Redis for production
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),
  
  // Cron job authentication
  CRON_SECRET_TOKEN: z.string().min(32, 'CRON_SECRET_TOKEN must be at least 32 characters').optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Vercel specific (optional)
  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  
  // Domain configuration
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL').optional(),
});

// Type for validated environment variables
export type Env = z.infer<typeof envSchema>;

// Validate environment variables
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      
      console.error('❌ Environment validation failed:');
      console.error(missingVars.join('\n'));
      
      // In development, provide helpful guidance
      if (process.env.NODE_ENV === 'development') {
        console.error('\n📝 Create a .env.local file with the following variables:');
        console.error(missingVars.map(v => v.split(':')[0] + '=your_value_here').join('\n'));
      }
      
      process.exit(1);
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Helper function to check if we're in production
export const isProduction = env.NODE_ENV === 'production';

// Helper function to get the app URL
export const getAppUrl = (): string => {
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }
  
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }
  
  return isProduction ? 'https://updrafted.us' : 'http://localhost:3000';
};

// Helper function to check if Redis is available
export const isRedisEnabled = (): boolean => {
  return !!env.REDIS_URL && isProduction;
};

// Security configuration based on environment
export const getSecurityConfig = () => ({
  corsOrigins: isProduction 
    ? [getAppUrl(), 'https://updrafted.us'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  
  rateLimits: {
    strict: isProduction,
    fileUpload: isProduction ? 5 : 50, // Much stricter for file uploads
    database: isProduction ? 100 : 500, // DB operation limits
    r2Operations: isProduction ? 20 : 100, // R2 operation limits
    general: isProduction ? 200 : 500,
    messaging: isProduction ? 100 : 200,
  },
  
  encryption: {
    required: isProduction,
    algorithm: 'aes-256-gcm' as const,
  },
});

// Validate environment on module load
if (typeof window === 'undefined') {
  // Only validate on server side
  validateEnv();
} 