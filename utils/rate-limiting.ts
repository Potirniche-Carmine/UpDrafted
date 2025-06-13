import { NextRequest, NextResponse } from 'next/server';

// ==================== CONFIGURATION ====================

const isDev = process.env.NODE_ENV === 'development';

export const RATE_LIMIT_CONFIG = {
  redis: {
    url: process.env.REDIS_URL,
    enabled: !!process.env.REDIS_URL,
  },
  limits: {
    // More generous limits for dev, stricter for production
    fileUpload: {
      athlete: { requests: isDev ? 50 : 20, windowMs: 60 * 60 * 1000 },
      coach: { requests: isDev ? 100 : 30, windowMs: 60 * 60 * 1000 },
      recruiter: { requests: isDev ? 100 : 30, windowMs: 60 * 60 * 1000 },
      admin: { requests: isDev ? 200 : 100, windowMs: 60 * 60 * 1000 }
    },
    general: {
      athlete: { requests: isDev ? 500 : 200, windowMs: 15 * 60 * 1000 },
      coach: { requests: isDev ? 1000 : 300, windowMs: 15 * 60 * 1000 },
      recruiter: { requests: isDev ? 1000 : 300, windowMs: 15 * 60 * 1000 },
      admin: { requests: isDev ? 2000 : 1000, windowMs: 15 * 60 * 1000 }
    },
    messaging: {
      athlete: { requests: isDev ? 200 : 100, windowMs: 60 * 60 * 1000 },
      coach: { requests: isDev ? 300 : 150, windowMs: 60 * 60 * 1000 },
      recruiter: { requests: isDev ? 300 : 150, windowMs: 60 * 60 * 1000 },
      admin: { requests: isDev ? 1000 : 500, windowMs: 60 * 60 * 1000 }
    },
    search: {
      athlete: { requests: isDev ? 1000 : 300, windowMs: 60 * 60 * 1000 },
      coach: { requests: isDev ? 1500 : 500, windowMs: 60 * 60 * 1000 },
      recruiter: { requests: isDev ? 1500 : 500, windowMs: 60 * 60 * 1000 },
      admin: { requests: isDev ? 3000 : 1000, windowMs: 60 * 60 * 1000 }
    },
    connections: {
      athlete: { requests: isDev ? 100 : 50, windowMs: 60 * 60 * 1000 },
      coach: { requests: isDev ? 150 : 75, windowMs: 60 * 60 * 1000 },
      recruiter: { requests: isDev ? 150 : 75, windowMs: 60 * 60 * 1000 },
      admin: { requests: isDev ? 500 : 200, windowMs: 60 * 60 * 1000 }
    },
    notifications: {
      athlete: { requests: isDev ? 200 : 100, windowMs: 60 * 60 * 1000 },
      coach: { requests: isDev ? 300 : 150, windowMs: 60 * 60 * 1000 },
      recruiter: { requests: isDev ? 300 : 150, windowMs: 60 * 60 * 1000 },
      admin: { requests: isDev ? 1000 : 500, windowMs: 60 * 60 * 1000 }
    },
    reports: {
      athlete: { requests: isDev ? 20 : 10, windowMs: 60 * 60 * 1000 },
      coach: { requests: isDev ? 50 : 25, windowMs: 60 * 60 * 1000 },
      recruiter: { requests: isDev ? 50 : 25, windowMs: 60 * 60 * 1000 },
      admin: { requests: isDev ? 200 : 100, windowMs: 60 * 60 * 1000 }
    }
  }
} as const;

// ==================== REDIS CLIENT ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redisClient: any = null;

async function getRedisClient() {
  if (!RATE_LIMIT_CONFIG.redis.enabled || !RATE_LIMIT_CONFIG.redis.url) return null;
  
  if (!redisClient) {
    try {
      const Redis = (await import('ioredis')).default;
      redisClient = new Redis(RATE_LIMIT_CONFIG.redis.url);
    } catch (error) {
      console.warn('Redis connection failed, falling back to memory:', error);
      return null;
    }
  }
  
  return redisClient;
}

// ==================== TYPES ====================

export type UserRole = 'athlete' | 'coach' | 'recruiter' | 'admin';
export type RateLimitType = keyof typeof RATE_LIMIT_CONFIG.limits;

interface RateLimitEntry {
  count: number;
  resetTime: number;
  strikes: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// ==================== RATE LIMITING ====================

class RateLimiter {
  private static instance: RateLimiter;
  private memoryStore = new Map<string, RateLimitEntry>();
  private blacklist = new Set<string>();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private constructor() {
    // Cleanup every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  async checkLimit(
    key: string,
    limitType: RateLimitType,
    userRole: UserRole
  ): Promise<RateLimitResult> {
    // Check blacklist first
    if (this.blacklist.has(key)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 24 * 60 * 60 * 1000,
        retryAfter: 24 * 60 * 60
      };
    }

    const config = RATE_LIMIT_CONFIG.limits[limitType][userRole];
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs;

    const redis = await getRedisClient();
    
    if (redis) {
      return this.checkLimitRedis(redis, key, config, windowStart, now);
    } else {
      return this.checkLimitMemory(key, config, windowStart, now);
    }
  }

  private async checkLimitRedis(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redis: any,
    key: string,
    config: { requests: number; windowMs: number },
    windowStart: number,
    now: number
  ): Promise<RateLimitResult> {
    try {
      const redisKey = `ratelimit:${key}:${windowStart}`;
      const current = await redis.incr(redisKey);
      
      if (current === 1) {
        await redis.expire(redisKey, Math.ceil(config.windowMs / 1000));
      }

      const resetTime = windowStart + config.windowMs;
      
      if (current > config.requests) {
        // Track violations in Redis
        const violationKey = `violations:${key}`;
        const violations = await redis.incr(violationKey);
        await redis.expire(violationKey, 24 * 60 * 60); // 24 hours

        if (violations >= 5) {
          this.blacklist.add(key);
        }

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil((resetTime - now) / 1000)
        };
      }

      return {
        allowed: true,
        remaining: Math.max(0, config.requests - current),
        resetTime
      };
    } catch (error) {
      console.warn('Redis rate limit check failed, falling back to memory:', error);
      return this.checkLimitMemory(key, config, windowStart, now);
    }
  }

  private checkLimitMemory(
    key: string,
    config: { requests: number; windowMs: number },
    windowStart: number,
    now: number
  ): RateLimitResult {
    const entry = this.memoryStore.get(key);
    const resetTime = windowStart + config.windowMs;

    if (!entry || entry.resetTime <= now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime,
        strikes: 0
      };
      this.memoryStore.set(key, newEntry);
      
      return {
        allowed: true,
        remaining: config.requests - 1,
        resetTime
      };
    }

    if (entry.count >= config.requests) {
      entry.strikes += 1;
      
      if (entry.strikes >= 5) {
        this.blacklist.add(key);
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      };
    }

    entry.count += 1;
    this.memoryStore.set(key, entry);

    return {
      allowed: true,
      remaining: config.requests - entry.count,
      resetTime: entry.resetTime
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

// ==================== MAIN UTILITIES ====================

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

export function generateRateLimitKey(userId: string | null, ip: string, endpoint: string): string {
  return userId ? `user:${userId}:${endpoint}` : `ip:${ip}:${endpoint}`;
}

export async function withRateLimit(
  request: NextRequest,
  limitType: RateLimitType,
  userId?: string,
  userRole: UserRole = 'athlete'
): Promise<{ success: boolean; response?: NextResponse; headers: Record<string, string> }> {
  const rateLimiter = RateLimiter.getInstance();
  const ip = getClientIP(request);
  const key = generateRateLimitKey(userId || null, ip, limitType);

  const result = await rateLimiter.checkLimit(key, limitType, userRole);

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': RATE_LIMIT_CONFIG.limits[limitType][userRole].requests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };

  if (!result.allowed) {
    headers['Retry-After'] = result.retryAfter?.toString() || '60';
    
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter 
        },
        { status: 429, headers }
      ),
      headers
    };
  }

  return { success: true, headers };
}

export function createErrorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse<T = Record<string, unknown>>(
  data: T,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(data, { headers });
}

// Legacy middleware for backward compatibility
export function rateLimitMiddleware(limitType: RateLimitType) {
  return async (request: NextRequest, userId?: string, userRole: UserRole = 'athlete') => {
    return withRateLimit(request, limitType, userId, userRole);
  };
}

export function addRateLimitHeaders(
  response: NextResponse,
  headers: Record<string, string>
): NextResponse {
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
} 