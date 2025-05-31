import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Simplified route matchers - combine related patterns
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
  '/dashboard(.*)', '/onboarding', '/profile(.*)'
]);

// Valid roles array for reuse
const VALID_ROLES = ['admin', 'athlete', 'coach', 'recruiter'];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  // Early return for public routes - no auth needed
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

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

    // Handle authenticated users on protected dashboard routes
    if (authState.userId && isProtectedDashboardRoute(req)) {
      // Redirect users without roles to onboarding (except if already there)
      if (!isValidRole && pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
      
      // Redirect users with roles away from onboarding to dashboard
      if (isValidRole && pathname === '/onboarding' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      return NextResponse.next();
    }

    // Redirect authenticated users from landing page to dashboard
    if (authState.userId && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // For all other protected routes, require authentication
    await auth.protect();
    return NextResponse.next();

  } catch {
    // Handle auth errors gracefully
    if (isProtectedDashboardRoute(req)) {
      return NextResponse.next(); // Let client handle auth errors
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