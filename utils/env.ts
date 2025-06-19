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
  
  // AWS/R2 Configuration
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  AWS_S3_BUCKET_NAME: z.string().min(1, 'AWS_S3_BUCKET_NAME is required'),
  AWS_S3_ENDPOINT: z.string().url('AWS_S3_ENDPOINT must be a valid URL'),
  
  // Optional Redis for production
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),
  
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
    fileUpload: isProduction ? 20 : 50,
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