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

// Server-safe basic sanitization function
function basicSanitize(input: string): string {
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocols
    .replace(/javascript:/gi, '')
    // Remove on event handlers
    .replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '')
    // Remove angle brackets
    .replace(/[<>]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Sanitize basic text content (names, titles, descriptions)
export function sanitizeText(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Use DOMPurify in browser, basic sanitization on server
  if (isBrowser && DOMPurify.sanitize) {
    const cleaned = DOMPurify.sanitize(trimmed, createPurifyConfig(false));
    return cleaned.replace(/[<>]/g, '');
  } else {
    return basicSanitize(trimmed);
  }
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

// Sanitize URLs - only allow http/https protocols
export function sanitizeUrl(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  
  const trimmed = input.trim();
  if (!trimmed) return '';
  
  try {
    const url = new URL(trimmed);
    // Only allow http and https protocols
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    // Invalid URL - return empty string
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
        sanitized[key] = sanitizeArray(value);
        break;
      case 'graduationYears':
        // Handle numeric arrays specially
        if (Array.isArray(value)) {
          sanitized[key] = value
            .map(year => sanitizeNumber(year, 2000, 2050))
            .filter(year => year !== null);
        } else {
          sanitized[key] = [];
        }
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
            graduationYears: Array.isArray(needs.graduationYears) 
              ? needs.graduationYears
                  .map(year => sanitizeNumber(year, 2000, 2050))
                  .filter(year => year !== null)
              : [],
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
                graduationYears: Array.isArray(needs.graduationYears) 
                  ? needs.graduationYears
                      .map(year => sanitizeNumber(year, 2000, 2050))
                      .filter(year => year !== null)
                  : [],
                positions: sanitizeArray(needs.positions),
                scholarshipsAvailable: sanitizeNumber(needs.scholarshipsAvailable, 0, 50),
                recruitingPhilosophy: sanitizeDescription(needs.recruitingPhilosophy as string)
              };
            }
          });
          
          sanitized[key] = sanitizedSportNeeds;
        }
        break;
        
      // Arrays of objects (videos, measurables)
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