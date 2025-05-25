import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', '/sign-up(.*)', '/', '/about', '/contact', '/for-athletes', 
  '/for-recruiters', '/privacy-policy', '/terms-of-service', '/404', '/500',
  '/profile(.*)', '/for-coaches'
]);

const isAdminRoute = createRouteMatcher(['admin(.*)', '/admin']);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const authState = await auth(); 

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req) && authState.sessionClaims?.metadata?.role !== 'admin') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }
  
  if (
    authState.userId && 
    !['admin', 'athlete', 'coach', 'recruiter'].includes(authState.sessionClaims?.metadata?.role as string) &&
    pathname !== '/onboarding' && 
    !pathname.startsWith('/sign-in') && 
    !pathname.startsWith('/sign-up')   
  ) {
    const url = new URL('/onboarding', req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};