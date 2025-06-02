import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Bot detection patterns
const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /search/i, /facebook/i, /twitter/i, /telegram/i,
  /whatsapp/i, /linkedin/i, /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
  /yandexbot/i, /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  /telegrambot/i, /whatsappbot/i, /applebot/i, /amazonbot/i
];

// Function to detect bots
function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

// Public routes that don't require authentication at all
const isPublicRoute = createRouteMatcher([
  '/', '/sign-in(.*)', '/sign-up(.*)', '/about', '/contact', '/for-athletes', 
  '/for-recruiters', '/privacy-policy', '/terms-of-service', '/404', '/500', '/for-coaches'
]);

// Combine all API route patterns for efficiency
const isApiRoute = createRouteMatcher(['/api/(.*)']);

// Specific API route matchers - only the ones we need special handling for
const isOnboardingApi = createRouteMatcher(['/api/onboarding']);

// Protected routes that require auth + role
const isProtectedDashboardRoute = createRouteMatcher([
  '/dashboard(.*)', '/profile(.*)'
]);

// Valid roles array for reuse
const VALID_ROLES = ['admin', 'athlete', 'coach', 'recruiter'];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get('user-agent');
  
  // Early bot detection to minimize processing
  if (isBot(userAgent)) {
    // Allow bots to access public routes without heavy processing
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }
    // Block bots from accessing protected routes
    return NextResponse.json({ error: 'Bot access not allowed' }, { status: 403 });
  }
  
  // Early return for public routes to minimize processing
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  try {
    // Optimize auth call - only get what we need
    const authState = await auth(); 
    const userRole = authState.sessionClaims?.metadata?.role as string;
    const isValidRole = VALID_ROLES.includes(userRole);

    // Handle API routes with simplified logic
    if (isApiRoute(req)) {
      // Early auth check for APIs
      if (!authState.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Allow onboarding API for authenticated users (even without roles)
      if (isOnboardingApi(req)) {
        return NextResponse.next();
      }

      // All other APIs require valid role
      if (!isValidRole) {
        return NextResponse.json({ error: 'Forbidden - Valid role required' }, { status: 403 });
      }

      return NextResponse.next();
    }

    // Handle authenticated users - check role status first
    if (authState.userId) {
      // Users without valid roles can ONLY access onboarding
      if (!isValidRole) {
        if (pathname !== '/onboarding') {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
        return NextResponse.next();
      }
      
      // Users with valid roles should be redirected away from onboarding
      if (isValidRole && pathname === '/onboarding' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Redirect authenticated users with roles from landing page to dashboard
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      return NextResponse.next();
    }

    // For all other protected routes, require authentication
    await auth.protect();
    return NextResponse.next();

  } catch {
    // Handle auth errors gracefully with minimal processing
    if (isProtectedDashboardRoute(req) || pathname === '/onboarding') {
      return NextResponse.next(); // Let client handle auth errors
    }
    
    // For other routes, require auth
    await auth.protect();
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Run middleware on all routes EXCEPT:
    // 1. Landing page (/)
    // 2. Company/footer routes (/about, /contact, etc.)
    // 3. Static assets and Next.js internals
    // 4. Auth pages (handled by Clerk)
    '/((?!^/$|^/about$|^/contact$|^/for-athletes$|^/for-recruiters$|^/for-coaches$|^/privacy-policy$|^/terms-of-service$|^/sign-in|^/sign-up|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|map|xml|txt|json|pdf|zip|gz|tar|webmanifest|robots\\.txt|sitemap\\.xml)).*)',
  ],
};