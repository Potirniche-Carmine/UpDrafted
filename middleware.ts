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

export async function middleware(req: NextRequest) {
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

  // CSRF: Verify origin matches host for same-origin policy
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match POST requests
    {
      source: "/api/:path*",
      methods: ["POST", "PUT", "DELETE", "PATCH"]
    }
  ]
};

