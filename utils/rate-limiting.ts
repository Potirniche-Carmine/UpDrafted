import { NextRequest, NextResponse } from 'next/server';

// Rate limit configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  // General API endpoints
  general: {
    athlete: { requests: 100, windowMs: 60 * 60 * 1000 }, // 100 req/hour
    coach: { requests: 200, windowMs: 60 * 60 * 1000 },   // 200 req/hour
    recruiter: { requests: 200, windowMs: 60 * 60 * 1000 }, // 200 req/hour
    admin: { requests: 1000, windowMs: 60 * 60 * 1000 }     // 1000 req/hour
  },
  
  // File upload endpoints (more restrictive)
  fileUpload: {
    athlete: { requests: 10, windowMs: 60 * 60 * 1000 },    // 10 uploads/hour
    coach: { requests: 25, windowMs: 60 * 60 * 1000 },      // 25 uploads/hour
    recruiter: { requests: 25, windowMs: 60 * 60 * 1000 },  // 25 uploads/hour
    admin: { requests: 100, windowMs: 60 * 60 * 1000 }      // 100 uploads/hour
  },
  
  // Messaging endpoints (moderate)
  messaging: {
    athlete: { requests: 50, windowMs: 60 * 60 * 1000 },    // 50 messages/hour
    coach: { requests: 100, windowMs: 60 * 60 * 1000 },     // 100 messages/hour
    recruiter: { requests: 100, windowMs: 60 * 60 * 1000 }, // 100 messages/hour
    admin: { requests: 500, windowMs: 60 * 60 * 1000 }      // 500 messages/hour
  },
  
  // Search/Discovery endpoints (more permissive)
  search: {
    athlete: { requests: 200, windowMs: 60 * 60 * 1000 },   // 200 searches/hour
    coach: { requests: 300, windowMs: 60 * 60 * 1000 },     // 300 searches/hour
    recruiter: { requests: 300, windowMs: 60 * 60 * 1000 }, // 300 searches/hour
    admin: { requests: 1000, windowMs: 60 * 60 * 1000 }     // 1000 searches/hour
  },
  
  // Connection operations (moderate)
  connections: {
    athlete: { requests: 30, windowMs: 60 * 60 * 1000 },    // 30 connections/hour
    coach: { requests: 50, windowMs: 60 * 60 * 1000 },      // 50 connections/hour
    recruiter: { requests: 50, windowMs: 60 * 60 * 1000 },  // 50 connections/hour
    admin: { requests: 200, windowMs: 60 * 60 * 1000 }      // 200 connections/hour
  }
} as const;

type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;
type UserRole = 'athlete' | 'coach' | 'recruiter' | 'admin';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
  strikes: number; // For tracking repeated violations
}

interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
  resetTime?: number;
  retryAfter?: number;
  reason?: string;
}

class RateLimitStore {
  private static instance: RateLimitStore;
  private store = new Map<string, RateLimitEntry>();
  private blacklist = new Set<string>(); // For temporarily banned IPs/users
  
  static getInstance(): RateLimitStore {
    if (!RateLimitStore.instance) {
      RateLimitStore.instance = new RateLimitStore();
    }
    return RateLimitStore.instance;
  }
  
  private constructor() {
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
  
  private generateKey(identifier: string, limitType: RateLimitType): string {
    return `${limitType}:${identifier}`;
  }
  
  get(identifier: string, limitType: RateLimitType): RateLimitEntry | undefined {
    const key = this.generateKey(identifier, limitType);
    return this.store.get(key);
  }
  
  set(identifier: string, limitType: RateLimitType, entry: RateLimitEntry): void {
    const key = this.generateKey(identifier, limitType);
    this.store.set(key, entry);
  }
  
  isBlacklisted(identifier: string): boolean {
    return this.blacklist.has(identifier);
  }
  
  addToBlacklist(identifier: string, durationMs: number = 24 * 60 * 60 * 1000): void {
    this.blacklist.add(identifier);
    // Remove from blacklist after duration
    setTimeout(() => {
      this.blacklist.delete(identifier);
    }, durationMs);
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
  
  delete(identifier: string, limitType: RateLimitType): void {
    const key = this.generateKey(identifier, limitType);
    this.store.delete(key);
  }
}

/**
 * Main rate limiting class
 */
export class RateLimit {
  private static store = RateLimitStore.getInstance();
  
  /**
   * Check if a request should be allowed based on rate limits
   */
  static checkLimit(
    userId: string,
    userRole: UserRole,
    limitType: RateLimitType,
    ipAddress?: string
  ): RateLimitResult {
    const now = Date.now();
    const config = RATE_LIMIT_CONFIGS[limitType][userRole];
    
    // Check if user/IP is blacklisted
    if (this.store.isBlacklisted(userId) || (ipAddress && this.store.isBlacklisted(ipAddress))) {
      return {
        allowed: false,
        reason: 'Access temporarily suspended due to violations',
        retryAfter: 24 * 60 * 60 // 24 hours
      };
    }
    
    // Primary check by userId
    const userEntry = this.store.get(userId, limitType);
    const result = this.processRateLimit(userId, userEntry, config, now, limitType);
    
    // Secondary check by IP if provided (to prevent abuse via multiple accounts)
    if (result.allowed && ipAddress) {
      const ipEntry = this.store.get(ipAddress, limitType);
      const ipConfig = {
        requests: config.requests * 3, // Allow 3x for IP-based limiting
        windowMs: config.windowMs
      };
      const ipResult = this.processRateLimit(ipAddress, ipEntry, ipConfig, now, limitType);
      
      if (!ipResult.allowed) {
        return {
          allowed: false,
          reason: 'Too many requests from this IP address',
          retryAfter: ipResult.retryAfter
        };
      }
    }
    
    return result;
  }
  
  private static processRateLimit(
    identifier: string,
    entry: RateLimitEntry | undefined,
    config: { requests: number; windowMs: number },
    now: number,
    limitType: RateLimitType
  ): RateLimitResult {
    if (!entry || now > entry.resetTime) {
      // First request or window expired
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now,
        strikes: 0
      };
      this.store.set(identifier, limitType, newEntry);
      
      return {
        allowed: true,
        remainingRequests: config.requests - 1,
        resetTime: newEntry.resetTime
      };
    }
    
    if (entry.count >= config.requests) {
      // Rate limit exceeded
      entry.strikes++;
      
      // If too many strikes, add to blacklist
      if (entry.strikes >= 5) {
        this.store.addToBlacklist(identifier);
        return {
          allowed: false,
          reason: 'Account temporarily suspended due to repeated violations',
          retryAfter: 24 * 60 * 60 // 24 hours
        };
      }
      
      // Calculate exponential backoff
      const baseRetryAfter = Math.ceil((entry.resetTime - now) / 1000);
      const backoffMultiplier = Math.pow(2, entry.strikes - 1);
      const retryAfter = Math.min(baseRetryAfter * backoffMultiplier, 3600); // Max 1 hour
      
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.resetTime,
        retryAfter,
        reason: `Rate limit exceeded. Try again in ${retryAfter} seconds.`
      };
    }
    
    // Increment counter
    entry.count++;
    
    return {
      allowed: true,
      remainingRequests: config.requests - entry.count,
      resetTime: entry.resetTime
    };
  }
  
  /**
   * Get rate limit headers for HTTP responses
   */
  static getRateLimitHeaders(
    userId: string,
    userRole: UserRole,
    limitType: RateLimitType
  ): Record<string, string> {
    const config = RATE_LIMIT_CONFIGS[limitType][userRole];
    const entry = this.store.get(userId, limitType);
    const now = Date.now();
    
    if (!entry || now > entry.resetTime) {
      return {
        'X-RateLimit-Limit': config.requests.toString(),
        'X-RateLimit-Remaining': config.requests.toString(),
        'X-RateLimit-Reset': new Date(now + config.windowMs).toISOString()
      };
    }
    
    return {
      'X-RateLimit-Limit': config.requests.toString(),
      'X-RateLimit-Remaining': Math.max(0, config.requests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
    };
  }
  
  /**
   * Clear rate limit for a user (admin function)
   */
  static clearUserLimit(userId: string, limitType?: RateLimitType): void {
    if (limitType) {
      this.store.delete(userId, limitType);
    } else {
      // Clear all limits for user
      for (const type of Object.keys(RATE_LIMIT_CONFIGS) as RateLimitType[]) {
        this.store.delete(userId, type);
      }
    }
  }
}

/**
 * Express/Next.js middleware function for rate limiting
 */
export function rateLimitMiddleware(limitType: RateLimitType) {
  return async (
    request: NextRequest,
    userId: string,
    userRole: UserRole
  ): Promise<NextResponse | null> => {
    // Get IP address from request
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    const result = RateLimit.checkLimit(userId, userRole, limitType, ipAddress);
    
    if (!result.allowed) {
      const headers = RateLimit.getRateLimitHeaders(userId, userRole, limitType);
      
      if (result.retryAfter) {
        headers['Retry-After'] = result.retryAfter.toString();
      }
      
      return NextResponse.json(
        {
          error: result.reason || 'Rate limit exceeded',
          retryAfter: result.retryAfter
        },
        {
          status: 429,
          headers
        }
      );
    }
    
    return null; // Allow request to continue
  };
}

/**
 * Utility function to add rate limit headers to successful responses
 */
export function addRateLimitHeaders(
  response: NextResponse,
  userId: string,
  userRole: UserRole,
  limitType: RateLimitType
): NextResponse {
  const headers = RateLimit.getRateLimitHeaders(userId, userRole, limitType);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Get client IP address helper
 */
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-vercel-forwarded-for');
  
  return (
    forwardedFor?.split(',')[0]?.trim() ||
    realIp ||
    remoteAddr ||
    'unknown'
  );
} 