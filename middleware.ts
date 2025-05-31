import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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
  
  try {
    const authState = await auth(); 
    const userRole = authState.sessionClaims?.metadata?.role as string;
    const isValidRole = VALID_ROLES.includes(userRole);

    // Handle API routes with simplified logic
    if (isApiRoute(req)) {
      // Require authentication for all API routes
      if (!authState.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Allow onboarding API for authenticated users (even without roles)
      if (isOnboardingApi(req)) {
        return NextResponse.next();
      }

      // Common APIs and all other APIs require valid role
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

    // For unauthenticated users, allow access to public routes
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }

    // For all other protected routes, require authentication
    await auth.protect();
    return NextResponse.next();

  } catch {
    // Handle auth errors gracefully
    if (isProtectedDashboardRoute(req) || pathname === '/onboarding') {
      return NextResponse.next(); // Let client handle auth errors
    }
    
    // Allow access to public routes on auth errors
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }
    
    // For other routes, require auth
    await auth.protect();
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // More selective matcher to reduce invocations
    // Skip Next.js internals, static files, and common assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};