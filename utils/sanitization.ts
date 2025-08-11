import DOMPurify from 'dompurify';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Configure DOMPurify for our use cases (only in browser)
const createPurifyConfig = (allowLinks = false) => ({
  ALLOWED_TAGS: allowLinks ? ['p', 'br'] : [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true, // Keep text content, remove only tags
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SANITIZE_DOM: true,
});

// Server-safe comprehensive sanitization function with enhanced security
function basicSanitize(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Security: First, limit input length to prevent DoS attacks
  if (input.length > 10000) {
    console.warn(`basicSanitize: Input too long (${input.length} chars), truncating for security`);
    input = input.substring(0, 10000);
  }

  return input
    // Remove HTML tags (enhanced pattern to catch malformed tags)
    .replace(/<[^>]*>?/gi, '')
    // Remove script content (comprehensive script removal)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    .replace(/&lt;script\b[^&]*(?:(?!&lt;\/script&gt;)&[^&]*)*&lt;\/script&gt;/gi, '')
    // Remove dangerous protocols (comprehensive list)
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/file:/gi, '')
    // Remove event handlers (comprehensive pattern)
    .replace(/\s*on\w+\s*=\s*[^>\s\'"]*[\'"][^>\s\'"]*[\'"][^>\s]*/gi, '')
    .replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '')
    // Remove dangerous attributes
    .replace(/\s*style\s*=\s*[^>\s\'"]*[\'"][^>\s\'"]*[\'"][^>\s]*/gi, '')
    .replace(/\s*href\s*=\s*[\'"]javascript:[^\'"]*[\'"][^>\s]*/gi, '')
    // Remove angle brackets and other dangerous characters
    .replace(/[<>]/g, '')
    .replace(/[{}]/g, '') // Remove curly braces that could be used in template injection
    // Remove null bytes and control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove Unicode control characters
    .replace(/[\u0080-\u009F]/g, '')
    // Normalize various whitespace characters
    .replace(/[\u2000-\u200F\u2028-\u202F\u205F-\u206F\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Sanitize basic text content (names, titles, descriptions) with enhanced security
export function sanitizeText(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Security: Check for extremely long inputs that could cause DoS
  if (trimmed.length > 1000) {
    console.warn(`sanitizeText: Input too long (${trimmed.length} chars), truncating for security`);
  }

  // Security: Detect and reject suspicious patterns before processing
  const suspiciousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi
  ];

  let cleanInput = trimmed;
  let hadSuspiciousContent = false;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(cleanInput)) {
      hadSuspiciousContent = true;
      console.warn('sanitizeText: Suspicious pattern detected, sanitizing:', pattern.source);
    }
  }

  // Use enhanced basic sanitization (server-side is more secure for our use case)
  const sanitized = basicSanitize(cleanInput);

  // Additional validation: ensure result doesn't contain dangerous remnants
  if (sanitized && (sanitized.includes('<') || sanitized.includes('>') || sanitized.includes('javascript:'))) {
    console.warn('sanitizeText: Dangerous content detected after sanitization, returning empty string');
    return '';
  }

  // Length limit after sanitization
  return sanitized.substring(0, 500);
}

// Sanitize longer text content (personal statements, descriptions)
export function sanitizeDescription(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Use DOMPurify in browser, basic sanitization on server
  if (isBrowser && DOMPurify.sanitize) {
    const cleaned = DOMPurify.sanitize(trimmed, createPurifyConfig(true));
    return cleaned.replace(/[<>]/g, '');
  } else {
    return basicSanitize(trimmed);
  }
}

// Sanitize URLs with comprehensive security validation - only allow http/https protocols
export function sanitizeUrl(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Security: Reject extremely long URLs that could cause DoS
  if (trimmed.length > 2048) {
    console.warn(`sanitizeUrl: URL too long (${trimmed.length} chars), rejecting for security`);
    return '';
  }

  // Security: Pre-validate against dangerous patterns
  const dangerousPatterns = [
    /javascript:/gi,
    /vbscript:/gi,
    /data:/gi,
    /file:/gi,
    /ftp:/gi,
    /\.\.[\\/]/g, // Path traversal
    /%2e%2e/gi, // URL-encoded path traversal
    /\x00/g, // Null bytes
    /<script/gi,
    /on\w+\s*=/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      console.warn('sanitizeUrl: Dangerous pattern detected in URL, rejecting:', pattern.source);
      return '';
    }
  }
  
  try {
    // First, decode any URL encoding to check for hidden dangerous content
    let decodedUrl = trimmed;
    try {
      decodedUrl = decodeURIComponent(trimmed);
    } catch {
      // If decoding fails, continue with original
    }

    // Check decoded URL for dangerous patterns
    for (const pattern of dangerousPatterns) {
      if (pattern.test(decodedUrl)) {
        console.warn('sanitizeUrl: Dangerous pattern detected in decoded URL, rejecting:', pattern.source);
        return '';
      }
    }

    const url = new URL(trimmed);
    
    // Only allow http and https protocols
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      // Additional security checks on the URL components
      if (url.hostname === 'localhost' || url.hostname.startsWith('127.') || url.hostname.startsWith('192.168.') || url.hostname.startsWith('10.')) {
        console.warn('sanitizeUrl: Local/private IP detected, rejecting for security:', url.hostname);
        return '';
      }

      // Validate hostname format
      if (!url.hostname || url.hostname.length > 253) {
        console.warn('sanitizeUrl: Invalid hostname format, rejecting');
        return '';
      }

      // Return the normalized URL string
      return url.toString();
    } else {
      console.warn('sanitizeUrl: Non-HTTP(S) protocol detected, rejecting:', url.protocol);
    }
  } catch (error) {
    console.warn('sanitizeUrl: URL parsing failed, rejecting:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  return '';
}

// Sanitize social media handles
export function sanitizeSocialHandle(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  
  const trimmed = input.trim();
  if (!trimmed) return '';
  
  // Remove @ symbol and sanitize
  const handle = trimmed.replace(/^@+/, '');
  
  // Only allow alphanumeric, dots, and underscores
  const sanitized = handle.replace(/[^a-zA-Z0-9._]/g, '');
  
  return sanitized.substring(0, 50); // Limit length
}

// Sanitize numeric values
export function sanitizeNumber(input: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number | null {
  if (input === null || input === undefined || input === '') return null;
  
  const num = typeof input === 'number' ? input : parseFloat(String(input));
  
  if (isNaN(num)) return null;
  if (num < min || num > max) return null;
  
  return num;
}

// Sanitize arrays
export function sanitizeArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  
  return input
    .filter(item => typeof item === 'string')
    .map(item => sanitizeText(item))
    .filter(item => item.length > 0);
}

// Main profile data sanitization function
export function sanitizeProfileData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  // Sanitize each field based on its type and purpose
  Object.entries(data).forEach(([key, value]) => {
    switch (key) {
      // Text fields
      case 'fullName':
      case 'title':
      case 'organizationName':
      case 'city':
      case 'state':
      case 'sport':
      case 'sportCoaching':
      case 'sportRecruiting':
      case 'division':
      case 'conference':
      case 'height':
      case 'weight':
      case 'intendedMajor':
      case 'educationLevel':
      case 'showcaseVideoTitle':
        sanitized[key] = sanitizeText(value as string);
        break;
        
      // Longer text fields
      case 'personalStatement':
      case 'recruitingPhilosophy':
        sanitized[key] = sanitizeDescription(value as string);
        break;
        
      // URLs
      case 'maxPrepsUrl':
      case 'hudlUrl':
      case 'hudlEmbedUrl':
      case 'programWebsite':
      case 'schoolWebsite':
      case 'showcaseVideoUrl':
      case 'showcaseVideoEmbedUrl':
        sanitized[key] = sanitizeUrl(value as string);
        break;
        
      // Social media handles
      case 'instagramHandle':
      case 'twitterHandle':
      case 'programInstagram':
      case 'programTwitter':
        sanitized[key] = sanitizeSocialHandle(value as string);
        break;
        
      // Numbers
      case 'graduationYear':
        sanitized[key] = sanitizeNumber(value, 2000, 2050);
        break;
      case 'gpa':
        sanitized[key] = sanitizeNumber(value, 0, 5.0);
        break;
      case 'satScore':
        sanitized[key] = sanitizeNumber(value, 400, 1600);
        break;
      case 'actScore':
        sanitized[key] = sanitizeNumber(value, 1, 36);
        break;
      case 'scholarshipsAvailable':
        sanitized[key] = sanitizeNumber(value, 0, 50);
        break;
        
      // Arrays
      case 'positions':
      case 'secondarySports':
      case 'studentClassifications':
        sanitized[key] = sanitizeArray(value);
        break;

        
      // Social media object
      case 'socialMedia':
        if (value && typeof value === 'object') {
          const social = value as Record<string, unknown>;
          sanitized[key] = {
            instagram: sanitizeSocialHandle(social.instagram as string),
            twitter: sanitizeSocialHandle(social.twitter as string)
          };
        }
        break;
        
      // Complex objects - handle recursively
      case 'recruitingNeeds':
        if (value && typeof value === 'object') {
          const needs = value as Record<string, unknown>;
          sanitized[key] = {
            studentClassifications: sanitizeArray(needs.studentClassifications),
            positions: sanitizeArray(needs.positions),
            scholarshipsAvailable: sanitizeNumber(needs.scholarshipsAvailable, 0, 50),
            recruitingPhilosophy: sanitizeDescription(needs.recruitingPhilosophy as string)
          };
        }
        break;
        
      // Sport-specific recruiting needs for recruiters
      case 'sportSpecificNeeds':
        if (value && typeof value === 'object') {
          const sportNeeds = value as Record<string, Record<string, unknown>>;
          const sanitizedSportNeeds: Record<string, Record<string, unknown>> = {};
          
          Object.entries(sportNeeds).forEach(([sport, needs]) => {
            if (needs && typeof needs === 'object') {
              sanitizedSportNeeds[sanitizeText(sport)] = {
                studentClassifications: sanitizeArray(needs.studentClassifications),
                positions: sanitizeArray(needs.positions),
                scholarshipsAvailable: sanitizeNumber(needs.scholarshipsAvailable, 0, 50),
                recruitingPhilosophy: sanitizeDescription(needs.recruitingPhilosophy as string)
              };
            }
          });
          
          sanitized[key] = sanitizedSportNeeds;
        }
        break;
        
      // Arrays of objects (videos, measurables, camp experience)
      case 'youtubeVideos':
        if (Array.isArray(value)) {
          sanitized[key] = value.map(video => {
            if (video && typeof video === 'object') {
              const videoObj = video as Record<string, unknown>;
              return {
                title: sanitizeText(videoObj.title as string),
                url: sanitizeUrl(videoObj.url as string),
                embedUrl: sanitizeUrl(videoObj.embedUrl as string),
                sortOrder: sanitizeNumber(videoObj.sortOrder, 0, 100)
              };
            }
            return null;
          }).filter(Boolean);
        }
        break;
        
      case 'campExperience':
        if (Array.isArray(value)) {
          sanitized[key] = value.map(experience => {
            if (experience && typeof experience === 'object') {
              const expObj = experience as Record<string, unknown>;
              return {
                type: sanitizeText(expObj.type as string),
                name: sanitizeText(expObj.name as string),
                city: sanitizeText(expObj.city as string),
                stateCountry: sanitizeText(expObj.stateCountry as string),
                startDate: expObj.startDate, // Keep as Date object or string
                endDate: expObj.endDate, // Keep as Date object or string
                sport: sanitizeText(expObj.sport as string),
                description: sanitizeDescription(expObj.description as string)
              };
            }
            return null;
          }).filter(Boolean);
        }
        break;
        
      case 'measurables':
        if (Array.isArray(value)) {
          sanitized[key] = value.map(measurable => {
            if (measurable && typeof measurable === 'object') {
              const measurableObj = measurable as Record<string, unknown>;
              return {
                sport: sanitizeText(measurableObj.sport as string),
                label: sanitizeText(measurableObj.label as string),
                value: sanitizeText(measurableObj.value as string),
                measurementDate: sanitizeText(measurableObj.measurementDate as string)
              };
            }
            return null;
          }).filter(Boolean);
        }
        break;
        
      // Pass through safe fields unchanged
      default:
        // Pass through important profile and verification fields
        if (['id', 'userId', 'isVerified', 'hasPendingVerification', 'pendingSubmittedAt', 'profileImage', 'organizationLogo', 'profileImageR3Key', 'organizationLogoR3Key', 'createdAt', 'updatedAt'].includes(key)) {
          sanitized[key] = value;
        }
        // Only pass through other primitive values or skip
        else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          sanitized[key] = value;
        }
        break;
    }
  });
  
  return sanitized;
} 