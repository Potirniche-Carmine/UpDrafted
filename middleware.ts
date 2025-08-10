import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SecurityEvents } from './utils/security';

// Simple in-memory rate limiting for MVP (would use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key);
    }
  }
}, 60000); // Clean every minute

// Security middleware for mutation operations
const securityMiddleware = async (request: NextRequest) => {
  // Only apply security checks to mutation methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    return NextResponse.next();
  }

  // Request body size limits for security
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength);
    const maxSize = 50 * 1024 * 1024; // 50MB max for file uploads
    const standardMaxSize = 10 * 1024 * 1024; // 10MB for regular requests
    
    // Higher limit for file upload endpoints
    const isFileUpload = request.nextUrl.pathname.includes('/upload') || 
                        request.nextUrl.pathname.includes('/verification');
    const sizeLimit = isFileUpload ? maxSize : standardMaxSize;
    
    if (size > sizeLimit) {
      // Log security event
      SecurityEvents.requestTooLarge(request, size, sizeLimit);
      
      return NextResponse.json(
        { error: `Request too large. Maximum size: ${Math.round(sizeLimit / 1024 / 1024)}MB` },
        { 
          status: 413, // Payload Too Large
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }
  }

  // Rate limiting for mutation operations
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                  request.headers.get('x-real-ip') || 
                  'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100; // Max 100 requests per minute per IP

  const current = rateLimit.get(clientIP);
  if (current && now < current.resetTime) {
    if (current.count >= maxRequests) {
      // Log security event
      SecurityEvents.rateLimitExceeded(request, undefined, maxRequests);
      
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }
    current.count++;
  } else {
    rateLimit.set(clientIP, { count: 1, resetTime: now + windowMs });
  }

  // CSRF Protection
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        // Log security event
        SecurityEvents.csrfAttempt(request, origin, host);
        
        return NextResponse.json(
          { error: 'Invalid request origin' },
          { 
            status: 403,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, PUT, DELETE, PATCH',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
          }
        );
      }
    } catch (error) {
      console.error('Origin validation error:', error);
      return NextResponse.json(
        { error: 'Invalid origin header' },
        { status: 400 }
      );
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
};

// Combine Clerk middleware with security middleware
export default clerkMiddleware(async (auth, req) => {
  // Skip all processing for webhook routes and cleanup routes
  if (req.nextUrl.pathname.startsWith('/api/webhooks/') || 
      req.nextUrl.pathname.startsWith('/api/activity/cleanup')) {
    return NextResponse.next();
  }

  // Protect all other API routes and apply security middleware
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // First apply Clerk protection
    await auth.protect();
    
    // Then apply our security middleware for mutation operations
    const securityResult = await securityMiddleware(req);
    if (securityResult.status !== 200) {
      return securityResult;
    }
    
    // Add additional security headers for API routes
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    return response;
  }

  // For non-API routes, just add basic security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  return response;
});

// Optimized matcher configuration
export const config = {
  matcher: [
    // Skip all files in the public folder
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    // Run middleware on all API routes
    '/api/(.*)',
    '/trpc/(.*)',
  ]
};

