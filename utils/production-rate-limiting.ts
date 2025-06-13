import { NextRequest, NextResponse } from 'next/server';

// Types for rate limiting
interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
  strikes: number;
  lastViolation?: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Simple logger replacement
const logger = {
  info: (message: string, data?: unknown) => console.log(`[INFO] ${message}`, data || ''),
  warn: (message: string, data?: unknown) => console.warn(`[WARN] ${message}`, data || ''),
  error: (message: string, error?: unknown, data?: unknown) => console.error(`[ERROR] ${message}`, error || '', data || ''),
};

/**
 * Production-ready rate limiting with Vercel KV support
 * Falls back to memory storage for development
 */
export class ProductionRateLimiter {
  private static instance: ProductionRateLimiter;
  private memoryStore = new Map<string, RateLimitEntry>();
  private blacklist = new Set<string>();
  private kv: unknown = null; // Will be initialized if Vercel KV is available
  
  // Rate limit configurations by endpoint type
  private configs: Record<string, RateLimitConfig> = {
    fileUpload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 20, // 20 uploads per hour for free users
    },
    messaging: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 100, // 100 messages per hour
    },
    connections: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 50, // 50 connection operations per hour
    },
    search: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 500, // 500 searches per hour
    },
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 200, // 200 requests per 15 minutes
    },
  };
  
  static getInstance(): ProductionRateLimiter {
    if (!ProductionRateLimiter.instance) {
      ProductionRateLimiter.instance = new ProductionRateLimiter();
    }
    return ProductionRateLimiter.instance;
  }
  
  private constructor() {
    this.initializeKV();
    
    // Cleanup memory store every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }
  
  private async initializeKV() {
    // KV functionality disabled for now
    // Can be re-enabled when @vercel/kv is properly configured
  }
  
  /**
   * Check rate limit for a specific key and endpoint type
   */
  async checkRateLimit(
    key: string,
    endpointType: keyof typeof this.configs,
    userRole?: 'athlete' | 'coach' | 'recruiter'
  ): Promise<RateLimitResult> {
    // Check blacklist first
    if (this.blacklist.has(key)) {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        resetTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        retryAfter: 24 * 60 * 60, // 24 hours in seconds
      };
    }
    
    const config = this.configs[endpointType];
    const adjustedConfig = this.adjustLimitForUserRole(config, userRole);
    
    const now = Date.now();
    const windowStart = Math.floor(now / adjustedConfig.windowMs) * adjustedConfig.windowMs;
    
    // Get current entry
    const entry = await this.getEntry(key);
    
    // Reset if new window
    if (!entry || entry.windowStart !== windowStart) {
      const newEntry: RateLimitEntry = {
        count: 1,
        windowStart,
        strikes: entry?.strikes || 0,
      };
      
      await this.setEntry(key, newEntry);
      
      return {
        success: true,
        limit: adjustedConfig.maxRequests,
        remaining: adjustedConfig.maxRequests - 1,
        resetTime: windowStart + adjustedConfig.windowMs,
      };
    }
    
    // Check if limit exceeded
    if (entry.count >= adjustedConfig.maxRequests) {
      // Increment strikes
      entry.strikes += 1;
      entry.lastViolation = now;
      
      // Blacklist if too many strikes
      if (entry.strikes >= 5) {
        this.blacklist.add(key);
        logger.warn('IP blacklisted due to repeated violations', { key, strikes: entry.strikes });
      }
      
      await this.setEntry(key, entry);
      
      const resetTime = windowStart + adjustedConfig.windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      
      return {
        success: false,
        limit: adjustedConfig.maxRequests,
        remaining: 0,
        resetTime,
        retryAfter,
      };
    }
    
    // Increment count
    entry.count += 1;
    await this.setEntry(key, entry);
    
    return {
      success: true,
      limit: adjustedConfig.maxRequests,
      remaining: adjustedConfig.maxRequests - entry.count,
      resetTime: windowStart + adjustedConfig.windowMs,
    };
  }
  
  /**
   * Adjust rate limits based on user role
   */
  private adjustLimitForUserRole(
    config: RateLimitConfig,
    userRole?: 'athlete' | 'coach' | 'recruiter'
  ): RateLimitConfig {
    const multipliers = {
      athlete: 1.0,
      coach: 1.5,
      recruiter: 2.0,
    };
    
    const multiplier = userRole ? multipliers[userRole] : 1.0;
    
    return {
      ...config,
      maxRequests: Math.floor(config.maxRequests * multiplier),
    };
  }
  
  /**
   * Get rate limit entry from storage
   */
  private async getEntry(key: string): Promise<RateLimitEntry | null> {
    try {
      // Use memory store only for now
      return this.memoryStore.get(key) || null;
    } catch (error) {
      logger.error('Failed to get rate limit entry', error, { key });
      return null;
    }
  }
  
  /**
   * Set rate limit entry in storage
   */
  private async setEntry(key: string, entry: RateLimitEntry): Promise<void> {
    try {
      // Use memory store only for now
      this.memoryStore.set(key, entry);
    } catch (error) {
      logger.error('Failed to set rate limit entry', error, { key });
    }
  }
  
  /**
   * Clean up expired entries from memory store
   */
  private cleanup(): void {
    if (this.kv) return; // Redis handles TTL automatically
    
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.memoryStore.entries()) {
      // Remove entries older than 2 hours
      if (now - entry.windowStart > 2 * 60 * 60 * 1000) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.memoryStore.delete(key));
    
    // Clean up old blacklist entries (remove after 24 hours)
    // This is a simplified approach - in production you might want more sophisticated blacklist management
  }
  
  /**
   * Generate rate limit key for user + IP combination
   */
  generateKey(userId: string, ip: string, endpoint: string): string {
    return `ratelimit:${endpoint}:${userId}:${ip}`;
  }
  
  /**
   * Generate IP-only key for anonymous rate limiting
   */
  generateIPKey(ip: string, endpoint: string): string {
    return `ratelimit:${endpoint}:ip:${ip}`;
  }
  
  /**
   * Get rate limiting statistics
   */
  getStats() {
    return {
      memoryEntries: this.memoryStore.size,
      blacklistedIPs: this.blacklist.size,
      usingRedis: !!this.kv,
      configs: this.configs,
    };
  }
}

/**
 * Express/Next.js middleware for rate limiting
 */
export async function withRateLimit(
  request: NextRequest,
  endpointType: keyof ProductionRateLimiter['configs'],
  userId?: string,
  userRole?: 'athlete' | 'coach' | 'recruiter'
): Promise<{ success: boolean; response?: NextResponse; headers: Record<string, string> }> {
  const rateLimiter = ProductionRateLimiter.getInstance();
  const ip = getClientIP(request);
  
  // Generate appropriate key
  const key = userId 
    ? rateLimiter.generateKey(userId, ip, endpointType)
    : rateLimiter.generateIPKey(ip, endpointType);
  
  const result = await rateLimiter.checkRateLimit(key, endpointType, userRole);
  
  // Prepare headers
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };
  
  if (!result.success) {
    headers['Retry-After'] = result.retryAfter?.toString() || '3600';
    
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
        resetTime: result.resetTime,
      },
      { 
        status: 429,
        headers,
      }
    );
    
    return { success: false, response, headers };
  }
  
  return { success: true, headers };
}

/**
 * Utility to get client IP from request
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for');
  
  return (
    forwardedFor?.split(',')[0]?.trim() ||
    realIp ||
    vercelForwarded ||
    'unknown'
  );
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };
  
  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }
  
  return headers;
} 