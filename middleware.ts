import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

export default clerkMiddleware(async (auth, req) => {
  // Middleware only runs on API routes due to matcher config
  
  // --- Basic Rate Limiting ---
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                  req.headers.get('x-real-ip') || 
                  'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100; // Max 100 requests per minute per IP

  const current = rateLimit.get(clientIP);
  if (current && now < current.resetTime) {
    if (current.count >= maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    current.count++;
  } else {
    rateLimit.set(clientIP, { count: 1, resetTime: now + windowMs });
  }

  // --- Security: URL Validation (API routes only) ---
  const MAX_URL_LENGTH = 2048;
  const MAX_QUERY_STRING_LENGTH = 1024;
  const MAX_GLOBAL_QUERY_PARAMS = 15;

  // 1. Fast URL length check
  if (req.url.length > MAX_URL_LENGTH) {
    return NextResponse.json({ error: 'URL too long' }, { status: 414 });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(req.url); 

    if (parsedUrl.search.length > MAX_QUERY_STRING_LENGTH) {
      return NextResponse.json({ error: 'Query string too long' }, { status: 414 });
    }

    const searchParams = parsedUrl.searchParams;
    if (searchParams.size > MAX_GLOBAL_QUERY_PARAMS) {
      return NextResponse.json({ error: 'Too many query parameters' }, { status: 400 });
    }

  } catch (error) {
    console.error('URL parsing error:', error);
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  // --- Security: CSRF Protection for state-changing requests ---
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    
    // CSRF: Verify origin matches host for same-origin policy
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          console.warn(`CSRF attempt blocked: origin=${origin}, host=${host}`);
          return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
        }
      } catch (error) {
        console.error('Origin validation error:', error);
        return NextResponse.json({ error: 'Invalid origin header' }, { status: 400 });
      }
    }

    // Require proper content-type for form submissions
    const contentType = req.headers.get('content-type');
    if (req.method === 'POST' && contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Only run middleware for API routes to minimize costs
    '/api/(.*)'
  ],
};

