import crypto from 'crypto';

// File type definitions with security constraints
export const ALLOWED_FILE_TYPES = {
  images: {
    'image/jpeg': { maxSize: 5 * 1024 * 1024, extensions: ['.jpg', '.jpeg'] },
    'image/png': { maxSize: 5 * 1024 * 1024, extensions: ['.png'] },
    'image/webp': { maxSize: 5 * 1024 * 1024, extensions: ['.webp'] }
  },
  documents: {
    'application/pdf': { maxSize: 10 * 1024 * 1024, extensions: ['.pdf'] }
  }
} as const;

// Create type for all allowed MIME types
type AllowedMimeType = 
  | 'image/jpeg'
  | 'image/png' 
  | 'image/webp'
  | 'application/pdf';

// Type for file configuration
interface FileConfig {
  maxSize: number;
  extensions: readonly string[];
}

// Security validation results
export interface FileSecurityResult {
  isValid: boolean;
  error?: string;
  sanitizedFileName?: string;
  secureKey?: string;
}

// Magic number signatures for file validation
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
  'application/pdf': [0x25, 0x50, 0x44, 0x46] // %PDF
} as const;

/**
 * Get file configuration for a given MIME type and category
 */
function getFileConfig(mimeType: string, allowedTypes: keyof typeof ALLOWED_FILE_TYPES): FileConfig | null {
  const categoryTypes = ALLOWED_FILE_TYPES[allowedTypes];
  
  // Check if the MIME type exists in the category
  if (mimeType in categoryTypes) {
    return categoryTypes[mimeType as keyof typeof categoryTypes];
  }
  
  return null;
}

/**
 * Check if a MIME type is allowed in the given category
 */
function isAllowedMimeType(mimeType: string, allowedTypes: keyof typeof ALLOWED_FILE_TYPES): mimeType is AllowedMimeType {
  const categoryTypes = ALLOWED_FILE_TYPES[allowedTypes];
  return mimeType in categoryTypes;
}

/**
 * Comprehensive file security validation
 */
export async function validateFileSecure(file: File, allowedTypes: keyof typeof ALLOWED_FILE_TYPES): Promise<FileSecurityResult> {
  try {
    // 1. Check file size first (prevent memory issues)
    if (file.size === 0) {
      return { isValid: false, error: 'File is empty' };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB absolute maximum
      return { isValid: false, error: 'File size exceeds maximum limit (10MB)' };
    }

    // 2. Validate MIME type against allowed types
    if (!isAllowedMimeType(file.type, allowedTypes)) {
      return { isValid: false, error: `File type ${file.type} is not allowed` };
    }

    const mimeTypeConfig = getFileConfig(file.type, allowedTypes);
    if (!mimeTypeConfig) {
      return { isValid: false, error: `File type ${file.type} is not allowed` };
    }

    // 3. Check specific size limit for the file type
    if (file.size > mimeTypeConfig.maxSize) {
      return { isValid: false, error: `File size exceeds limit for ${file.type} (${mimeTypeConfig.maxSize / (1024 * 1024)}MB)` };
    }

    // 4. Validate file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = mimeTypeConfig.extensions.some((ext: string) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return { isValid: false, error: `Invalid file extension. Allowed: ${mimeTypeConfig.extensions.join(', ')}` };
    }

    // 5. Validate file signature (magic numbers) to prevent MIME type spoofing
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    if (!validateFileSignature(uint8Array, file.type as AllowedMimeType)) {
      return { isValid: false, error: 'File content does not match the declared type' };
    }

    // 6. Scan for potentially malicious content
    const securityScan = scanFileContent(uint8Array, file.type);
    if (!securityScan.isSecure) {
      return { isValid: false, error: securityScan.reason };
    }

    // 7. Generate sanitized filename and secure key
    const sanitizedFileName = sanitizeFileName(file.name);
    const secureKey = generateSecureFileKey(sanitizedFileName);

    return {
      isValid: true,
      sanitizedFileName,
      secureKey
    };

  } catch (error) {
    console.error('File validation error:', error);
    return { isValid: false, error: 'Failed to validate file' };
  }
}

/**
 * Validate file signature using magic numbers
 */
function validateFileSignature(buffer: Uint8Array, mimeType: AllowedMimeType): boolean {
  const signature = FILE_SIGNATURES[mimeType];
  if (!signature) return false;

  // Check if buffer starts with the expected signature
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }

  // Additional checks for specific file types
  if (mimeType === 'image/webp') {
    // WebP files should have "WEBP" at bytes 8-11
    const webpMarker = [0x57, 0x45, 0x42, 0x50]; // WEBP
    for (let i = 0; i < webpMarker.length; i++) {
      if (buffer[8 + i] !== webpMarker[i]) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Scan file content for malicious patterns
 */
function scanFileContent(buffer: Uint8Array, mimeType: string): { isSecure: boolean; reason?: string } {
  const content = new TextDecoder('utf-8', { fatal: false }).decode(buffer);

  // Check for script injections in any file type
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
      return { isSecure: false, reason: 'File contains potentially malicious content' };
    }
  }

  // PDF-specific checks
  if (mimeType === 'application/pdf') {
    // Check for JavaScript in PDF
    if (/\/JavaScript\s*\(/i.test(content) || /\/JS\s*\(/i.test(content)) {
      return { isSecure: false, reason: 'PDF contains JavaScript which is not allowed' };
    }

    // Check for forms and actions
    if (/\/URI\s*\(/i.test(content) && /javascript:/i.test(content)) {
      return { isSecure: false, reason: 'PDF contains suspicious URI actions' };
    }
  }

  return { isSecure: true };
}

/**
 * Sanitize filename for secure storage
 */
export function sanitizeFileName(fileName: string): string {
  // Remove or replace dangerous characters
  let sanitized = fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // Replace dangerous chars
    .replace(/\.{2,}/g, '.') // Replace multiple dots
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .trim();

  // Ensure filename is not empty and not too long
  if (!sanitized) {
    sanitized = 'file';
  }

  // Limit length and ensure extension
  const parts = sanitized.split('.');
  if (parts.length > 1) {
    const extension = parts.pop()!;
    const nameWithoutExt = parts.join('.');
    const maxNameLength = 100 - extension.length - 1; // -1 for the dot
    
    if (nameWithoutExt.length > maxNameLength) {
      sanitized = nameWithoutExt.substring(0, maxNameLength) + '.' + extension;
    }
  } else {
    sanitized = sanitized.substring(0, 100);
  }

  return sanitized;
}

/**
 * Generate secure file key for storage
 */
export function generateSecureFileKey(originalFileName: string): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const sanitizedName = sanitizeFileName(originalFileName);
  
  // Extract extension
  const parts = sanitizedName.split('.');
  const extension = parts.length > 1 ? '.' + parts.pop() : '';
  
  return `${timestamp}-${randomBytes}${extension}`;
}

/**
 * Rate limiting for file uploads per user
 */
export class FileUploadRateLimit {
  private static uploads = new Map<string, { count: number; resetTime: number }>();
  
  static checkLimit(userId: string, userRole: string): { allowed: boolean; resetIn?: number } {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour window
    
    // Different limits based on user role
    const limits = {
      athlete: 20,
      coach: 50,
      recruiter: 50,
      admin: 100
    };
    
    const maxUploads = limits[userRole as keyof typeof limits] || limits.athlete;
    
    const userUpload = this.uploads.get(userId);
    
    if (!userUpload || now > userUpload.resetTime) {
      // Reset or first time
      this.uploads.set(userId, { count: 1, resetTime: now + windowMs });
      return { allowed: true };
    }
    
    if (userUpload.count >= maxUploads) {
      return { 
        allowed: false, 
        resetIn: Math.ceil((userUpload.resetTime - now) / 1000) 
      };
    }
    
    userUpload.count++;
    return { allowed: true };
  }
  
  static cleanup() {
    const now = Date.now();
    for (const [userId, data] of this.uploads.entries()) {
      if (now > data.resetTime) {
        this.uploads.delete(userId);
      }
    }
  }
}