import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ==================== CONFIGURATION ====================

const isDev = process.env.NODE_ENV === 'development';

export const SECURITY_CONFIG = {
  redis: {
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
    enabled: !!process.env.REDIS_URL && !!process.env.REDIS_TOKEN,
  },
  cache: {
    profileInfo: isDev ? 60 : 300, // 1min dev, 5min prod
    searchResults: isDev ? 30 : 180, // 30s dev, 3min prod
    userConnections: isDev ? 60 : 120, // 1min dev, 2min prod
    usageLimits: isDev ? 120 : 900, // 2min dev, 15min prod
    notifications: isDev ? 30 : 60, // 30s dev, 1min prod
    discover: isDev ? 60 : 300, // 1min dev, 5min prod
  },
  rateLimit: {
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
  if (!SECURITY_CONFIG.redis.enabled || !SECURITY_CONFIG.redis.url) return null;
  
  if (!redisClient) {
    try {
      const { Redis } = await import('@upstash/redis');
      redisClient = new Redis({ 
        url: SECURITY_CONFIG.redis.url, 
        token: SECURITY_CONFIG.redis.token 
      });
    } catch (error) {
      console.warn('Redis connection failed, falling back to memory:', error);
      return null;
    }
  }
  
  return redisClient;
}

// ==================== TYPES ====================

export type UserRole = 'athlete' | 'coach' | 'recruiter' | 'admin';
export type RateLimitType = keyof typeof SECURITY_CONFIG.rateLimit;
export type CacheType = keyof typeof SECURITY_CONFIG.cache;

export type SecurityEventType = 
  | 'rate_limit_exceeded'
  | 'invalid_token'
  | 'csrf_attempt'
  | 'unauthorized_access'
  | 'file_upload_blocked'
  | 'request_too_large'
  | 'suspicious_activity'
  | 'validation_failed'
  | 'origin_mismatch';

export interface SecurityEventDetails {
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

interface SecurityLogEntry {
  timestamp: string;
  event: SecurityEventType;
  level: 'info' | 'warning' | 'error' | 'critical';
  details: SecurityEventDetails;
  requestId?: string;
}

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

export interface FileSecurityResult {
  isValid: boolean;
  error?: string;
  sanitizedFileName?: string;
  secureKey?: string;
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

    const config = SECURITY_CONFIG.rateLimit[limitType][userRole];
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

// ==================== CACHING ====================

class Cache {
  private static instance: Cache;
  private memoryCache = new Map<string, { data: unknown; expiry: number }>();

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  private constructor() {
    // Cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const redis = await getRedisClient();
    
    if (redis) {
      try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.warn('Redis get failed, falling back to memory:', error);
      }
    }

    const entry = this.memoryCache.get(key);
    if (!entry || Date.now() > entry.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    const redis = await getRedisClient();
    
    if (redis) {
      try {
        await redis.setex(key, ttlSeconds, JSON.stringify(data));
        return;
      } catch (error) {
        console.warn('Redis set failed, falling back to memory:', error);
      }
    }

    this.memoryCache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  async del(key: string): Promise<void> {
    const redis = await getRedisClient();
    
    if (redis) {
      try {
        await redis.del(key);
      } catch (error) {
        console.warn('Redis del failed:', error);
      }
    }

    this.memoryCache.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const redis = await getRedisClient();
    
    if (redis) {
      try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (error) {
        console.warn('Redis pattern invalidation failed:', error);
      }
    }

    // Clear matching keys from memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
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

// ==================== FILE SECURITY ====================

interface FileTypeConfig {
  maxSize: number;
  extensions: readonly string[];
}

const ALLOWED_FILE_TYPES = {
  images: {
    'image/jpeg': { maxSize: 5 * 1024 * 1024, extensions: ['.jpg', '.jpeg'] },
    'image/png': { maxSize: 5 * 1024 * 1024, extensions: ['.png'] },
    'image/webp': { maxSize: 5 * 1024 * 1024, extensions: ['.webp'] }
  },
  documents: {
    'application/pdf': { maxSize: 10 * 1024 * 1024, extensions: ['.pdf'] }
  },
  videos: {
    'video/mp4': { maxSize: 50 * 1024 * 1024, extensions: ['.mp4'] },
    'video/quicktime': { maxSize: 50 * 1024 * 1024, extensions: ['.mov'] }
  }
} as const;

export async function validateFileSecure(
  file: File, 
  allowedTypes: keyof typeof ALLOWED_FILE_TYPES
): Promise<FileSecurityResult> {
  try {
    // Basic validations
    if (file.size === 0) {
      return { isValid: false, error: 'File is empty' };
    }

    if (file.size > 50 * 1024 * 1024) {
      return { isValid: false, error: 'File size exceeds maximum limit (50MB)' };
    }

    // Check allowed types
    const categoryTypes = ALLOWED_FILE_TYPES[allowedTypes];
    if (!(file.type in categoryTypes)) {
      return { isValid: false, error: `File type ${file.type} is not allowed` };
    }

    const typeConfig = (categoryTypes as Record<string, FileTypeConfig>)[file.type];
    if (file.size > typeConfig.maxSize) {
      return { isValid: false, error: `File size exceeds limit for ${file.type}` };
    }

    // Validate extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = typeConfig.extensions.some((ext: string) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return { isValid: false, error: `Invalid file extension. Allowed: ${typeConfig.extensions.join(', ')}` };
    }

    return {
      isValid: true,
      sanitizedFileName: sanitizeFileName(file.name),
      secureKey: generateSecureFileKey(file.name)
    };

  } catch (error) {
    console.error('File validation error:', error);
    return { isValid: false, error: 'Failed to validate file' };
  }
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
}

function generateSecureFileKey(originalFileName: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const ext = originalFileName.split('.').pop() || '';
  return `${timestamp}_${random}.${ext}`;
}

export async function scanContent(buffer: ArrayBuffer): Promise<{ safe: boolean; reason?: string }> {
  const content = new TextDecoder('utf-8', { fatal: false }).decode(buffer);

  // Check for script injections
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(content)) {
      return { safe: false, reason: 'File contains potentially malicious content' };
    }
  }

  return { safe: true };
}

// ==================== SECURITY MONITORING ====================

function extractClientInfo(request: NextRequest): Pick<SecurityEventDetails, 'ip' | 'userAgent'> {
  return {
    ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 
        request.headers.get('x-real-ip') || 
        'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

export function logSecurityEvent(
  event: SecurityEventType,
  details: SecurityEventDetails,
  level: SecurityLogEntry['level'] = 'warning'
): void {
  const logEntry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    level,
    details,
    requestId: generateRequestId(),
  };

  const logMessage = JSON.stringify(logEntry, null, 2);
  
  switch (level) {
    case 'critical':
    case 'error':
      console.error(`🚨 SECURITY EVENT: ${event}`, logMessage);
      break;
    case 'warning':
      console.warn(`⚠️  SECURITY EVENT: ${event}`, logMessage);
      break;
    case 'info':
      console.info(`ℹ️  SECURITY EVENT: ${event}`, logMessage);
      break;
  }
}

export function logSecurityEventWithRequest(
  event: SecurityEventType,
  request: NextRequest,
  additionalDetails: Partial<SecurityEventDetails> = {},
  level: SecurityLogEntry['level'] = 'warning'
): void {
  const clientInfo = extractClientInfo(request);
  
  const details: SecurityEventDetails = {
    ...clientInfo,
    endpoint: request.nextUrl.pathname,
    method: request.method,
    ...additionalDetails,
  };

  logSecurityEvent(event, details, level);
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const SecurityEvents = {
  rateLimitExceeded: (request: NextRequest, userId?: string, limit?: number) => {
    logSecurityEventWithRequest('rate_limit_exceeded', request, {
      userId,
      reason: `Rate limit exceeded: ${limit} requests`,
    }, 'warning');
  },

  invalidToken: (request: NextRequest, reason: string) => {
    logSecurityEventWithRequest('invalid_token', request, {
      reason,
    }, 'error');
  },

  csrfAttempt: (request: NextRequest, origin?: string, host?: string) => {
    logSecurityEventWithRequest('csrf_attempt', request, {
      reason: 'CSRF protection triggered',
      metadata: { origin, host },
    }, 'error');
  },

  unauthorizedAccess: (request: NextRequest, userId?: string, requiredRole?: string) => {
    logSecurityEventWithRequest('unauthorized_access', request, {
      userId,
      reason: `Access denied - required role: ${requiredRole}`,
    }, 'warning');
  },

  fileUploadBlocked: (request: NextRequest, reason: string, userId?: string) => {
    logSecurityEventWithRequest('file_upload_blocked', request, {
      userId,
      reason,
    }, 'warning');
  },

  requestTooLarge: (request: NextRequest, size: number, limit: number) => {
    logSecurityEventWithRequest('request_too_large', request, {
      reason: `Request size ${size} bytes exceeds limit ${limit} bytes`,
    }, 'warning');
  },

  validationFailed: (request: NextRequest, field: string, error: string) => {
    logSecurityEventWithRequest('validation_failed', request, {
      reason: `Validation failed for ${field}: ${error}`,
    }, 'info');
  },

  suspiciousActivity: (request: NextRequest, description: string, metadata: Record<string, unknown> = {}) => {
    logSecurityEventWithRequest('suspicious_activity', request, {
      reason: description,
      metadata,
    }, 'error');
  },
};

// ==================== UTILITY FUNCTIONS ====================

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
    'X-RateLimit-Limit': SECURITY_CONFIG.rateLimit[limitType][userRole].requests.toString(),
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

// ==================== CACHE UTILITIES ====================

export async function getCached<T>(key: string): Promise<T | null> {
  const cache = Cache.getInstance();
  return cache.get<T>(key);
}

export async function setCached<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
  const cache = Cache.getInstance();
  const defaultTtl = ttlSeconds || SECURITY_CONFIG.cache.profileInfo;
  return cache.set(key, data, defaultTtl);
}

export async function invalidateCache(key: string): Promise<void> {
  const cache = Cache.getInstance();
  return cache.del(key);
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  const cache = Cache.getInstance();
  return cache.invalidatePattern(pattern);
}

export async function getCachedWithType<T>(
  key: string
): Promise<T | null> {
  const cache = Cache.getInstance();
  return cache.get<T>(key);
}

export async function setCachedWithType<T>(
  key: string, 
  data: T, 
  cacheType: CacheType
): Promise<void> {
  const cache = Cache.getInstance();
  const ttl = SECURITY_CONFIG.cache[cacheType];
  return cache.set(key, data, ttl);
}

// ==================== RESPONSE HELPERS ====================

export function createErrorResponse(
  message: string, 
  status: number = 500,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json({ error: message }, { status, headers });
}

export function createSuccessResponse<T = Record<string, unknown>>(
  data: T,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(data, { headers });
}

export function createCachedResponse<T>(
  data: T,
  cacheType: CacheType,
  headers?: Record<string, string>
): NextResponse {
  const cacheHeaders = {
    'Cache-Control': `public, max-age=${SECURITY_CONFIG.cache[cacheType]}`,
    'X-Cache-TTL': SECURITY_CONFIG.cache[cacheType].toString(),
    ...headers
  };
  
  return NextResponse.json(data, { headers: cacheHeaders });
}

// ==================== VALIDATION HELPERS ====================

export function validateRequiredFields(
  data: Record<string, unknown>, 
  requiredFields: string[]
): { valid: boolean; missingFields?: string[] } {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  );
  
  return {
    valid: missingFields.length === 0,
    missingFields: missingFields.length > 0 ? missingFields : undefined
  };
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }
  
  if (file.size > 50 * 1024 * 1024) {
    return { valid: false, error: 'File too large (max 50MB)' };
  }
  
  return { valid: true };
}

// ==================== TIMESTAMP SECURITY ====================

/**
 * Validates timestamp headers to prevent replay attacks
 * @param timestampHeader - The timestamp header value as string
 * @param maxAgeMs - Maximum allowed age in milliseconds (default: 5 minutes)
 * @param allowFutureMs - Maximum allowed future timestamp in milliseconds (default: 1 minute)
 * @returns Object with validation result and error message if invalid
 */
export function validateTimestamp(
  timestampHeader: string | null, 
  maxAgeMs: number = 5 * 60 * 1000,
  allowFutureMs: number = 1 * 60 * 1000
): { valid: boolean; error?: string } {
  if (!timestampHeader) {
    return { valid: false, error: 'Missing timestamp header' };
  }

  const timestamp = parseInt(timestampHeader);
  if (isNaN(timestamp)) {
    return { valid: false, error: 'Invalid timestamp format' };
  }

  // Validate timestamp is a reasonable value (not negative, not too far in the future)
  if (timestamp <= 0) {
    return { valid: false, error: 'Invalid timestamp: must be positive' };
  }

  const now = Date.now();
  
  // Check if timestamp is too far in the future
  if (timestamp > now + allowFutureMs) {
    const allowFutureMinutes = Math.floor(allowFutureMs / 60000);
    return { 
      valid: false, 
      error: `Request timestamp is too far in the future (max +${allowFutureMinutes} minute${allowFutureMinutes !== 1 ? 's' : ''})` 
    };
  }
  
  // Check if timestamp is too old
  if (timestamp < now - maxAgeMs) {
    const maxAgeMinutes = Math.floor(maxAgeMs / 60000);
    return { 
      valid: false, 
      error: `Request timestamp is too old (max ${maxAgeMinutes} minute${maxAgeMinutes !== 1 ? 's' : ''} ago)` 
    };
  }

  return { valid: true };
}

/**
 * Generates a current timestamp for use in cron job requests
 * @returns Current timestamp in milliseconds
 */
export function generateTimestamp(): number {
  return Date.now();
}

/**
 * Creates headers object for authenticated cron requests
 * @param cronSecret - The cron secret token
 * @returns Headers object with authentication and timestamp
 */
export function createCronHeaders(cronSecret: string): Record<string, string> {
  return {
    'x-cron-secret': cronSecret,
    'x-timestamp': generateTimestamp().toString(),
    'Content-Type': 'application/json'
  };
}
