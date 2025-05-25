import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/', 
  '/about', 
  '/contact', 
  '/for-athletes', 
  '/for-recruiters', 
  '/privacy-policy', 
  '/terms-of-service', 
  '/404', 
  '/500',
  '/profile(.*)'
])

// The onboarding route
const isOnboardingRoute = createRouteMatcher(['/onboarding'])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes (except onboarding which we handle separately)
  if (isPublicRoute(req) && !isOnboardingRoute(req)) {
    return
  }

  // Get auth info
  const { userId, sessionClaims } = await auth()
  
  // If user is not authenticated, protect the route
  if (!userId) {
    await auth.protect()
    return
  }

  // Get user role from public metadata (with proper type checking)
  const publicMetadata = sessionClaims?.publicMetadata as { role?: string } | undefined
  const userRole = publicMetadata?.role

  // Debug logging
  console.log('Middleware Debug:', {
    path: req.nextUrl.pathname,
    userId,
    userRole,
    publicMetadata,
    isOnboarding: isOnboardingRoute(req)
  })

  // Handle onboarding page access
  if (isOnboardingRoute(req)) {
    if (userRole) {
      // User has a role, redirect away from onboarding
      console.log('Redirecting user with role away from onboarding:', userRole)
      const homeUrl = new URL('/', req.url)
      return NextResponse.redirect(homeUrl)
    }
    // User doesn't have a role, allow onboarding access
    console.log('Allowing access to onboarding - no role found')
    return
  }

  // Handle all other protected routes
  if (!userRole) {
    // User doesn't have a role, force them to onboarding
    console.log('Redirecting user without role to onboarding')
    const onboardingUrl = new URL('/onboarding', req.url)
    return NextResponse.redirect(onboardingUrl)
  }

  // User has a role, allow access to protected routes
  return
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}