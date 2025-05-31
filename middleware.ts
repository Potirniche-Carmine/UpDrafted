import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/', '/sign-in(.*)', '/sign-up(.*)', '/about', '/contact', '/for-athletes', 
  '/for-recruiters', '/privacy-policy', '/terms-of-service', '/404', '/500', '/for-coaches'
]);

const isApiRoute = createRouteMatcher(['/api/(.*)']);
const isOnboardingApi = createRouteMatcher(['/api/onboarding']);
const isAdminApi = createRouteMatcher(['/api/admin/(.*)']);
const isAthleteApi = createRouteMatcher(['/api/athletes/(.*)']);
const isCoachApi = createRouteMatcher(['/api/coaches/(.*)']);
const isRecruiterApi = createRouteMatcher(['/api/recruiters/(.*)']);
const isCommonApi = createRouteMatcher(['/api/common/(.*)', '/api/upload-image']);

// Protected routes that should never redirect to sign-in if user is authenticated
const isProtectedDashboardRoute = createRouteMatcher([
  '/dashboard(.*)', '/onboarding', '/profile(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  try {
    const authState = await auth(); 
    const userRole = authState.sessionClaims?.metadata?.role as string;

    // Handle API routes separately - require auth but add role-based protection
    if (isApiRoute(req)) {
      if (!authState.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Allow onboarding API for authenticated users without roles (during onboarding process)
      if (isOnboardingApi(req)) {
        return NextResponse.next();
      }

      // Common APIs accessible to all roles
      if (isCommonApi(req)) {
        if (!['admin', 'athlete', 'coach', 'recruiter'].includes(userRole)) {
          return NextResponse.json({ error: 'Forbidden - Valid role required' }, { status: 403 });
        }
        return NextResponse.next();
      }

      // Admin-only API routes
      if (isAdminApi(req)) {
        if (userRole !== 'admin') {
          return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }
        return NextResponse.next();
      }

      // Athlete-specific API routes
      if (isAthleteApi(req)) {
        if (!['athlete', 'admin'].includes(userRole)) {
          return NextResponse.json({ error: 'Forbidden - Athlete access required' }, { status: 403 });
        }
        return NextResponse.next();
      }

      // Coach-specific API routes
      if (isCoachApi(req)) {
        if (!['coach', 'admin'].includes(userRole)) {
          return NextResponse.json({ error: 'Forbidden - Coach access required' }, { status: 403 });
        }
        return NextResponse.next();
      }

      // Recruiter-specific API routes
      if (isRecruiterApi(req)) {
        if (!['recruiter', 'admin'].includes(userRole)) {
          return NextResponse.json({ error: 'Forbidden - Recruiter access required' }, { status: 403 });
        }
        return NextResponse.next();
      }

      // For other API routes, require a valid role (no role-less users except for onboarding)
      if (!['admin', 'athlete', 'coach', 'recruiter'].includes(userRole)) {
        return NextResponse.json({ error: 'Forbidden - Valid role required' }, { status: 403 });
      }

      return NextResponse.next();
    }

    // If user is authenticated and on a protected dashboard route,
    if (authState.userId && isProtectedDashboardRoute(req)) {
      // Prevent users with completed roles from accessing onboarding (except admins)
      if (
        pathname === '/onboarding' &&
        ['athlete', 'coach', 'recruiter'].includes(userRole)
      ) {
        const url = new URL('/dashboard', req.url);
        return NextResponse.redirect(url);
      }
      
      // Redirect users without roles to onboarding (admins can access everything)
      if (
        !['admin', 'athlete', 'coach', 'recruiter'].includes(userRole) &&
        pathname !== '/onboarding'
      ) {
        const url = new URL('/onboarding', req.url);
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    }

    // Redirect authenticated users away from landing page to dashboard
    if (authState.userId && pathname === '/') {
      const url = new URL('/dashboard', req.url);
      return NextResponse.redirect(url);
    }

    // For public routes, allow access
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }

    // For non-public routes, protect them
    await auth.protect();
    return NextResponse.next();

  } catch {
    // If there's an auth error and we're on a protected dashboard route,
    // don't redirect to sign-in immediately - let the client handle it
    if (isProtectedDashboardRoute(req)) {
      return NextResponse.next();
    }
    
    // For other routes, handle normally
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};