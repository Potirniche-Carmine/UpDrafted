import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

// Define protected routes that require authentication
const isProtectedApiRoute = createRouteMatcher([
  '/api/profile/(.*)',
  '/api/connections(.*)',
  '/api/verification(.*)',
  '/api/onboarding(.*)',
  '/api/search(.*)',
  '/api/discover(.*)',
  '/api/messages(.*)',
  '/api/messages/(.*)',
  '/api/notifications(.*)'
]);

// Define public routes that should NOT require authentication
const isPublicApiRoute = createRouteMatcher([
  '/api/webhooks/clerk'
]);

// Security middleware for mutation operations
const securityMiddleware = async (request: NextRequest) => {
  // Only apply security checks to mutation methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    return NextResponse.next();
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
        console.warn(`CSRF attempt blocked: origin=${origin}, host=${host}`);
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

  return response;
};

// Combine Clerk middleware with security middleware
export default clerkMiddleware(async (auth, req) => {
  // Skip ALL middleware for public routes like Clerk webhook
  if (isPublicApiRoute(req)) {
    // Completely bypass all middleware for webhooks
    return NextResponse.next();
  }

  // Check if it's a protected API route
  if (isProtectedApiRoute(req)) {
    // Protect all routes except search
    if (!req.nextUrl.pathname.startsWith('/api/search')) {
      await auth.protect();
    }
  }

  // Apply security middleware for API routes (except public routes)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const securityResult = await securityMiddleware(req);
    if (securityResult.status !== 200) {
      return securityResult;
    }
  }

  return NextResponse.next();
});

// Optimized matcher configuration
export const config = {
  matcher: [
    // Include API routes
    '/api/:path*'
  ]
};

