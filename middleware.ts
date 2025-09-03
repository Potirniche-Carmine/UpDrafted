import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SecurityEvents, withRateLimit, type UserRole } from './utils/security';

// Helper function to determine rate limit type based on endpoint
function getRateLimitType(pathname: string): string {
  if (pathname.includes('/upload') || pathname.includes('/verification')) return 'fileUpload';
  if (pathname.includes('/messages')) return 'messaging';
  if (pathname.includes('/search')) return 'search';
  if (pathname.includes('/connections')) return 'connections';
  if (pathname.includes('/notifications')) return 'notifications';
  if (pathname.includes('/reports')) return 'reports';
  return 'general';
}

// Helper function to get user role from Clerk auth
async function getUserRole(): Promise<{ userId?: string; role: UserRole }> {
  // For now, default to 'athlete' - this would be enhanced with actual role extraction
  // In a real implementation, you'd extract the user ID and role from the Clerk session
  return { role: 'athlete' as UserRole };
}

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

  // Advanced rate limiting with Redis support
  const { userId, role } = await getUserRole();
  const limitType = getRateLimitType(request.nextUrl.pathname) as 'fileUpload' | 'general' | 'messaging' | 'search' | 'connections' | 'notifications' | 'reports';
  
  const rateLimitResult = await withRateLimit(request, limitType, userId, role);
  
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

    // Continue with CSRF protection after rate limiting
  const securityResponse = NextResponse.next();
  Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
    securityResponse.headers.set(key, value);
  });

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
  securityResponse.headers.set('X-Content-Type-Options', 'nosniff');
  securityResponse.headers.set('X-Frame-Options', 'DENY');
  securityResponse.headers.set('X-XSS-Protection', '1; mode=block');
  securityResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  securityResponse.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  securityResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return securityResponse;
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
    
    return securityResult;
  }

  // For non-API routes, just add basic security headers
  const nonApiResponse = NextResponse.next();
  nonApiResponse.headers.set('X-Content-Type-Options', 'nosniff');
  nonApiResponse.headers.set('X-Frame-Options', 'DENY');
  nonApiResponse.headers.set('X-XSS-Protection', '1; mode=block');
  nonApiResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  nonApiResponse.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  nonApiResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  return nonApiResponse;
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

