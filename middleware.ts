import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// API routes that need authentication
const isApiRoute = createRouteMatcher(['/api/(.*)']);

// Public routes that never need auth
const isPublicRoute = createRouteMatcher([
  '/', '/sign-in(.*)', '/sign-up(.*)', '/about', '/contact', 
  '/for-athletes', '/for-recruiters', '/privacy-policy', 
  '/terms-of-service', '/404', '/500', '/for-coaches'
]);

// Routes that need client-side auth (will be handled by AuthWrapper)
const isProtectedClientRoute = createRouteMatcher([
  '/messaging(.*)',
  '/notifications(.*)', 
  '/discover(.*)',
  '/connections(.*)',
  '/search(.*)',
  '/dashboard(.*)',
  '/profile(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // SECURITY: Global protection against DoS attacks via URL manipulation
  const MAX_URL_LENGTH = 4096; // More generous global limit
  const MAX_QUERY_STRING_LENGTH = 2048;
  
  if (req.url.length > MAX_URL_LENGTH) {
    return NextResponse.json(
      { error: 'URL too long' },
      { status: 414 }
    );
  }

  // Parse URL safely and check query string
  try {
    const url = new URL(req.url);
    if (url.search.length > MAX_QUERY_STRING_LENGTH) {
      return NextResponse.json(
        { error: 'Query string too long' },
        { status: 400 }
      );
    }

    // Limit number of query parameters globally
    const MAX_GLOBAL_QUERY_PARAMS = 20;
    if (url.searchParams.size > MAX_GLOBAL_QUERY_PARAMS) {
      return NextResponse.json(
        { error: 'Too many query parameters' },
        { status: 400 }
      );
    }
  } catch (urlError) {
    // If URL parsing fails, it's malformed - log for security monitoring
    console.warn('Malformed URL detected:', urlError);
    return NextResponse.json(
      { error: 'Malformed URL' },
      { status: 400 }
    );
  }

  // Early return for public routes - no auth needed at all
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For API routes, require authentication
  if (isApiRoute(req)) {
    try {
      const authState = await auth();
      if (!authState.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // For protected client routes, do minimal auth check for security
  if (isProtectedClientRoute(req)) {
    try {
      const authState = await auth();
      if (!authState.userId) {
        // Redirect to sign-in for client routes
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }
      return NextResponse.next();
    } catch {
      // Redirect to sign-in on auth failure for client routes
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Only run middleware on API routes and protected client routes
    '/(api/.*)',
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|map|xml|txt|json|pdf|zip|gz|tar|webmanifest|robots\\.txt|sitemap\\.xml)).*)',
  ],
};