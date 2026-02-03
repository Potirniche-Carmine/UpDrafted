import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy (middleware) for route protection and security headers.
 * Note: This runs in Edge Runtime, so we can't directly access the database.
 * Session validation is done by checking for the auth cookie presence.
 * Full session/user validation happens in API routes and server components.
 */

// Add security headers to any response
function addSecurityHeaders(response: NextResponse) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    return response;
}

// Check if user has a session cookie (basic auth check for proxy)
function hasSessionCookie(request: NextRequest): boolean {
    // better-auth uses a session cookie (default name: better-auth.session_token)
    const sessionCookie = request.cookies.get('better-auth.session_token');
    return !!sessionCookie?.value;
}

// Default export for Next.js 16 proxy convention
export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Skip all processing for webhook routes, auth routes, static files, and public assets
    // These routes handle their own authentication/authorization
    if (pathname.startsWith('/api/webhooks/') ||
        pathname.startsWith('/api/auth/') ||
        pathname.startsWith('/api/activity/cleanup') ||
        pathname.startsWith('/_next/') ||
        pathname.includes('.')) {
        return addSecurityHeaders(NextResponse.next());
    }

    const hasSession = hasSessionCookie(req);

    // Public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/sign-in',
        '/sign-up',
        '/reset-password',
        '/about',
        '/contact',
        '/terms-of-service',
        '/privacy-policy',
        '/for-coaches',
        '/for-athletes',
        '/for-recruiters'
    ];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    // Auth pages - redirect to dashboard if has session cookie (except for forgot-password)
    const authPagesWithoutSession = ['/forgot-password'];
    const isAuthPageWithoutSession = authPagesWithoutSession.some(route => pathname.startsWith(route));

    if ((pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) && hasSession && !isAuthPageWithoutSession) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Onboarding routes - require session cookie
    if (pathname.startsWith('/onboarding')) {
        if (!hasSession) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }
        // Note: Role check happens in the onboarding page itself (server component)
        return addSecurityHeaders(NextResponse.next());
    }

    // API routes - require session cookie
    if (pathname.startsWith('/api/')) {
        if (!hasSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Apply basic security checks for mutations
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            // Request body size limits
            const contentLength = req.headers.get('content-length');
            if (contentLength) {
                const size = parseInt(contentLength);
                const isFileUpload = pathname.includes('/upload') || pathname.includes('/verification');
                const sizeLimit = isFileUpload ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

                if (size > sizeLimit) {
                    return NextResponse.json(
                        { error: `Request too large. Maximum size: ${Math.round(sizeLimit / 1024 / 1024)}MB` },
                        { status: 413 }
                    );
                }
            }

            // CSRF Protection
            const origin = req.headers.get('origin');
            const host = req.headers.get('host');

            if (origin && host) {
                try {
                    const originUrl = new URL(origin);
                    if (originUrl.host !== host) {
                        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
                    }
                } catch {
                    return NextResponse.json({ error: 'Invalid origin header' }, { status: 400 });
                }
            }
        }

        return addSecurityHeaders(NextResponse.next());
    }

    // Protected app routes - require session cookie
    if (!isPublicRoute) {
        if (!hasSession) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }
        // Note: Role and onboarding checks happen in page components (server components)
    }

    return addSecurityHeaders(NextResponse.next());
}

// Matcher configuration - exclude static files
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|manifest|json)$).*)',
    ]
};
