import { NextRequest, NextResponse } from 'next/server';

// Production configuration
export const PRODUCTION_CONFIG = {
  isProduction: process.env.NODE_ENV === 'production',
  redis: {
    url: process.env.REDIS_URL,
    enabled: !!process.env.REDIS_URL,
  },
  cache: {
    profileInfo: 300, // 5 minutes
    searchResults: 180, // 3 minutes
    userConnections: 120, // 2 minutes
  },
  rateLimit: {
    fileUpload: { requests: 20, windowMs: 60 * 60 * 1000 }, // 20/hour
    general: { requests: 200, windowMs: 15 * 60 * 1000 }, // 200/15min
    search: { requests: 100, windowMs: 60 * 1000 }, // 100/minute
  },
} as const;

// Redis client
let redisClient: unknown = null;

async function getRedisClient() {
  if (!PRODUCTION_CONFIG.redis.enabled || !PRODUCTION_CONFIG.redis.url) return null;
  
  if (!redisClient) {
    try {
      const Redis = (await import('ioredis')).default;
      redisClient = new Redis(PRODUCTION_CONFIG.redis.url);
    } catch {
      return null; // Fallback to memory if Redis fails
    }
  }
  
  return redisClient;
}

// Production-ready rate limiter
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class ProductionRateLimiter {
  private static instance: ProductionRateLimiter;
  private memoryStore = new Map<string, RateLimitEntry>();

  static getInstance(): ProductionRateLimiter {
    if (!ProductionRateLimiter.instance) {
      ProductionRateLimiter.instance = new ProductionRateLimiter();
    }
    return ProductionRateLimiter.instance;
  }

  private constructor() {
    // Clean memory store every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  async checkLimit(
    key: string, 
    maxRequests: number, 
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const redis = await getRedisClient();
    
    if (redis) {
      return this.checkLimitRedis(redis as Record<string, unknown>, key, maxRequests, windowMs);
    } else {
      return this.checkLimitMemory(key, maxRequests, windowMs);
    }
  }

  private async checkLimitRedis(
    redis: Record<string, unknown>, 
    key: string, 
    maxRequests: number, 
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const redisKey = `ratelimit:${key}:${window}`;

    try {
      const current = await (redis.incr as (key: string) => Promise<number>)(redisKey);
      
      if (current === 1) {
        await (redis.expire as (key: string, seconds: number) => Promise<void>)(redisKey, Math.ceil(windowMs / 1000));
      }

      const resetTime = (window + 1) * windowMs;
      
      return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        resetTime,
      };
    } catch {
      // Fallback to memory if Redis fails
      return this.checkLimitMemory(key, maxRequests, windowMs);
    }
  }

  private checkLimitMemory(
    key: string, 
    maxRequests: number, 
    windowMs: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.memoryStore.get(key);

    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.memoryStore.set(key, newEntry);
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    this.memoryStore.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore.entries()) {
      if (now > entry.resetTime) {
        this.memoryStore.delete(key);
      }
    }
  }
}

// Production-ready cache
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class ProductionCache {
  private static instance: ProductionCache;
  private memoryCache = new Map<string, CacheEntry<unknown>>();

  static getInstance(): ProductionCache {
    if (!ProductionCache.instance) {
      ProductionCache.instance = new ProductionCache();
    }
    return ProductionCache.instance;
  }

  private constructor() {
    // Clean expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const redis = await getRedisClient() as Record<string, unknown> | null;
    
    if (redis) {
      try {
        const data = await (redis.get as (key: string) => Promise<string | null>)(key);
        return data ? JSON.parse(data) : null;
      } catch {
        // Fallback to memory
      }
    }

    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (!entry || Date.now() > entry.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    const redis = await getRedisClient() as Record<string, unknown> | null;
    
    if (redis) {
      try {
        await (redis.setex as (key: string, seconds: number, value: string) => Promise<void>)(key, ttlSeconds, JSON.stringify(data));
        return;
      } catch {
        // Fallback to memory
      }
    }

    const entry: CacheEntry<T> = {
      data,
      expiry: Date.now() + (ttlSeconds * 1000),
    };
    
    this.memoryCache.set(key, entry as CacheEntry<unknown>);
  }

  async del(pattern: string): Promise<void> {
    const redis = await getRedisClient() as Record<string, unknown> | null;
    
    if (redis) {
      try {
        const keys = await (redis.keys as (pattern: string) => Promise<string[]>)(`*${pattern}*`);
        if (keys.length > 0) {
          await (redis.del as (...keys: string[]) => Promise<number>)(...keys);
        }
      } catch {
        // Continue with memory cleanup
      }
    }

    // Clean memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiry) {
        this.memoryCache.delete(key);
      }
    }
  }
}

// Rate limiting middleware
export async function withRateLimit(
  request: NextRequest,
  type: keyof typeof PRODUCTION_CONFIG.rateLimit,
  userId?: string
): Promise<{ success: boolean; response?: NextResponse; headers: Record<string, string> }> {
  const limiter = ProductionRateLimiter.getInstance();
  const config = PRODUCTION_CONFIG.rateLimit[type];
  
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const key = userId ? `${type}:user:${userId}` : `${type}:ip:${ip}`;
  const result = await limiter.checkLimit(key, config.requests, config.windowMs);
  
  const headers = {
    'X-RateLimit-Limit': config.requests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter,
        },
        { 
          status: 429,
          headers: {
            ...headers,
            'Retry-After': retryAfter.toString(),
          },
        }
      ),
      headers,
    };
  }

  return { success: true, headers };
}

// Cache helpers
export async function getCached<T>(key: string): Promise<T | null> {
  const cache = ProductionCache.getInstance();
  return cache.get<T>(key);
}

export async function setCached<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  const cache = ProductionCache.getInstance();
  return cache.set(key, data, ttlSeconds);
}

export async function invalidateCache(pattern: string): Promise<void> {
  const cache = ProductionCache.getInstance();
  return cache.del(pattern);
}

// File validation for production
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large (max 5MB)' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }

  return { valid: true };
}

// Content scanning for production
export async function scanContent(buffer: ArrayBuffer): Promise<{ safe: boolean; reason?: string }> {
  const content = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  
  const patterns = [
    /<script/gi,
    /javascript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /<iframe/gi,
    /eval\s*\(/gi,
    /<object/gi,
    /vbscript:/gi,
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      return { safe: false, reason: 'Malicious content detected' };
    }
  }

  return { safe: true };
}

// Response helpers
export function createErrorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse(
  data: Record<string, unknown>,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json({ success: true, ...data }, { headers });
}

// Get client IP
export function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
} 