import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ==================== CONFIGURATION ====================

const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const SECURITY_CACHE_CONFIG = {
  redis: {
    url: process.env.REDIS_URL,
    enabled: !!process.env.REDIS_URL,
  },
  cache: {
    profileInfo: isDev ? 60 : 300, // 1min dev, 5min prod
    searchResults: isDev ? 30 : 180, // 30s dev, 3min prod
    userConnections: isDev ? 60 : 120, // 1min dev, 2min prod
    notifications: isDev ? 30 : 60, // 30s dev, 1min prod
    discover: isDev ? 60 : 300, // 1min dev, 5min prod
  }
} as const;

// ==================== REDIS CLIENT ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redisClient: any = null;

async function getRedisClient() {
  if (!SECURITY_CACHE_CONFIG.redis.enabled || !SECURITY_CACHE_CONFIG.redis.url) return null;
  
  if (!redisClient) {
    try {
      const Redis = (await import('ioredis')).default;
      redisClient = new Redis(SECURITY_CACHE_CONFIG.redis.url);
    } catch (error) {
      console.warn('Redis connection failed, falling back to memory:', error);
      return null;
    }
  }
  
  return redisClient;
}

// ==================== TYPES ====================

export interface FileSecurityResult {
  isValid: boolean;
  error?: string;
  sanitizedFileName?: string;
  secureKey?: string;
}

export type CacheType = keyof typeof SECURITY_CACHE_CONFIG.cache;

interface FileTypeConfig {
  maxSize: number;
  extensions: string[];
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

const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'video/mp4': [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
  'video/quicktime': [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70]
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

    const typeConfig = (categoryTypes as unknown as Record<string, FileTypeConfig>)[file.type];
    if (file.size > typeConfig.maxSize) {
      return { isValid: false, error: `File size exceeds limit for ${file.type}` };
    }

    // Validate extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = typeConfig.extensions.some((ext: string) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return { isValid: false, error: `Invalid file extension. Allowed: ${typeConfig.extensions.join(', ')}` };
    }

    // For MVP, skip expensive magic number validation in dev
    if (isProduction) {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      if (!validateFileSignature(uint8Array, file.type)) {
        return { isValid: false, error: 'File content does not match declared type' };
      }
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

function validateFileSignature(buffer: Uint8Array, mimeType: string): boolean {
  const signature = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
  if (!signature) return false;

  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }
  return true;
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

// ==================== CONTENT SCANNING ====================

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

// ==================== CACHE UTILITIES ====================

export async function getCached<T>(key: string): Promise<T | null> {
  const cache = Cache.getInstance();
  return cache.get<T>(key);
}

export async function setCached<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
  const cache = Cache.getInstance();
  const defaultTtl = ttlSeconds || SECURITY_CACHE_CONFIG.cache.profileInfo;
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
  const ttl = SECURITY_CACHE_CONFIG.cache[cacheType];
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
    'Cache-Control': `public, max-age=${SECURITY_CACHE_CONFIG.cache[cacheType]}`,
    'X-Cache-TTL': SECURITY_CACHE_CONFIG.cache[cacheType].toString(),
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