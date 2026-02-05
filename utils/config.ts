
/**
 * Shared configuration constants for the application
 * This acts as the single source of truth for limits, routes, and other constants
 */

export const CONFIG = {
    // File upload limits (in bytes)
    FILES: {
        MAX_SIZE_DEFAULT: 10 * 1024 * 1024, // 10MB
        MAX_SIZE_IMAGE: 5 * 1024 * 1024,    // 5MB
        MAX_SIZE_VIDEO: 50 * 1024 * 1024,   // 50MB
        MAX_SIZE_DOCUMENT: 10 * 1024 * 1024, // 10MB

        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
        ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime'],
        ALLOWED_DOC_TYPES: ['application/pdf'],
    },

    // Route configuration
    ROUTES: {
        PUBLIC: [
            '/',
            '/sign-in',
            '/sign-up',
            '/reset-password',
            '/about',
            '/contact',
            '/terms-of-service',
            '/privacy-policy',
            '/for-coaches',
            '/for-athletes',
            '/for-recruiters'
        ],
        AUTH_PAGES_NO_SESSION: ['/forgot-password'],
        PROTECTED_PREFIXES: ['/dashboard', '/onboarding', '/settings', '/messages'],
        API_PREFIX: '/api/',
    },

    // Security limits
    SECURITY: {
        // Request size limits
        MAX_BODY_SIZE_DEFAULT: 2 * 1024 * 1024, // 2MB for standard JSON requests
        MAX_BODY_SIZE_UPLOAD: 55 * 1024 * 1024, // 55MB to account for multipart overhead on 50MB files

        // Rate limit defaults (requests per window)
        RATE_LIMITS: {
            WINDOW_MS: 60 * 1000, // 1 minute
            DEFAULT_MAX: 100, // Default requests per minute
            STRICT_MAX: 20,   // Stricter limit for sensitive endpoints
        }
    },

    // Cache durations (in seconds)
    CACHE: {
        SHORT: 60,       // 1 minute
        MEDIUM: 5 * 60,  // 5 minutes
        LONG: 60 * 60,   // 1 hour
        DAY: 24 * 60 * 60 // 1 day
    }
} as const;
