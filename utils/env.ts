
/**
 * Environment variables access layer
 * No runtime validation to keep it lightweight - relies on deployment config being correct
 */

// Helper to check environment
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Core application URL
export const getAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return isProduction ? 'https://updrafted.us' : 'http://localhost:3000';
};

// Redis configuration
export const getRedisConfig = () => {
  return {
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
    enabled: !!(process.env.REDIS_URL && process.env.REDIS_TOKEN)
  };
};

// Security Helpers
export const getSecurityConfig = () => ({
  corsOrigins: isProduction
    ? [getAppUrl(), 'https://updrafted.us']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
});

// Simple typed access to important vars if needed elsewhere
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

  // R2
  R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL,
};
