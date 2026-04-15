import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CONFIG } from './utils/config';

/**
 * Proxy (middleware) for route protection and security headers.
 * Note: This runs in Edge Runtime, so we can't directly access the database.
 * We do a fast cookie presence check first, then session introspection via /api/auth/get-session
 * for stricter auth and email-verification-aware routing.
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

function secureRedirect(url: URL | string) {
    return addSecurityHeaders(NextResponse.redirect(url));
}

interface SessionState {
    isAuthenticated: boolean;
    emailVerified: boolean | null;
}

// Check if user has a session cookie (basic auth check for proxy)
function hasSessionCookie(request: NextRequest): boolean {
    // better-auth uses 'better-auth.session_token' over HTTP,
    // but '__Secure-better-auth.session_token' over HTTPS (production).
    // We must check both to work across all environments.
    const sessionCookie = request.cookies.get('better-auth.session_token') 
        || request.cookies.get('__Secure-better-auth.session_token');
    return !!sessionCookie?.value;
}

async function getSessionState(req: NextRequest): Promise<SessionState> {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
        return { isAuthenticated: false, emailVerified: null };
    }

    try {
        const sessionResponse = await fetch(new URL('/api/auth/get-session', req.url), {
            method: 'GET',
            headers: {
                cookie: cookieHeader,
                accept: 'application/json',
            },
        });

        if (!sessionResponse.ok) {
            return { isAuthenticated: false, emailVerified: null };
        }

        const sessionData = await sessionResponse.json() as { user?: { emailVerified?: boolean } };
        if (!sessionData?.user) {
            return { isAuthenticated: false, emailVerified: null };
        }

        return {
            isAuthenticated: true,
            emailVerified: typeof sessionData.user.emailVerified === 'boolean' ? sessionData.user.emailVerified : null,
        };
    } catch {
        // Fall back to cookie-based auth checks if session introspection fails.
        return { isAuthenticated: true, emailVerified: null };
    }
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
    const isVerifyEmailPage = pathname === '/verify-email' || pathname.startsWith('/verify-email/');

    // Public routes that don't require authentication
    const isPublicRoute = CONFIG.ROUTES.PUBLIC.some(route => pathname === route || pathname.startsWith(route + '/'));
    const isAuthPage = CONFIG.ROUTES.AUTH_PAGES_SESSION_REDIRECT.some(route => pathname === route || pathname.startsWith(route + '/'));

    // API routes - require session cookie
    if (pathname.startsWith('/api/')) {
        if (!hasSession) {
            return addSecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        }

        const sessionState = await getSessionState(req);
        if (!sessionState.isAuthenticated) {
            return addSecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        }

        if (sessionState.emailVerified === false) {
            return addSecurityHeaders(NextResponse.json({ error: 'Email verification required' }, { status: 403 }));
        }

        // Apply basic security checks for mutations
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            // Request body size limits
            const contentLength = req.headers.get('content-length');
            if (contentLength) {
                const size = parseInt(contentLength);
                const isFileUpload = pathname.includes('/upload') || pathname.includes('/verification') || pathname.includes('/onboarding');
                const sizeLimit = isFileUpload ? CONFIG.SECURITY.MAX_BODY_SIZE_UPLOAD : CONFIG.SECURITY.MAX_BODY_SIZE_DEFAULT;

                if (size > sizeLimit) {
                    return addSecurityHeaders(NextResponse.json(
                        { error: `Request too large. Maximum size: ${Math.round(sizeLimit / 1024 / 1024)}MB` },
                        { status: 413 }
                    ));
                }
            }

            // CSRF Protection
            const origin = req.headers.get('origin');
            const host = req.headers.get('host');

            if (origin && host) {
                try {
                    const originUrl = new URL(origin);
                    if (originUrl.host !== host) {
                        return addSecurityHeaders(NextResponse.json({ error: 'Invalid request origin' }, { status: 403 }));
                    }
                } catch {
                    return addSecurityHeaders(NextResponse.json({ error: 'Invalid origin header' }, { status: 400 }));
                }
            }
        }

        return addSecurityHeaders(NextResponse.next());
    }

    // Protected app routes - require session cookie
    // Role-based access control and onboarding checks are handled by AuthWrapper and page components.
    const isProtectedPage = !isPublicRoute;
    if (!hasSession && isProtectedPage) {
        return secureRedirect(new URL('/sign-in', req.url));
    }

    if (hasSession || isVerifyEmailPage) {
        const sessionState = await getSessionState(req);

        if (!sessionState.isAuthenticated && isProtectedPage) {
            return secureRedirect(new URL('/sign-in', req.url));
        }

        // Keep unverified users in a dedicated verification flow.
        if (sessionState.isAuthenticated && sessionState.emailVerified === false) {
            if (!isVerifyEmailPage && isProtectedPage) {
                return secureRedirect(new URL('/verify-email', req.url));
            }

            if (isAuthPage) {
                return secureRedirect(new URL('/verify-email', req.url));
            }
        }

        // Redirect authenticated users away from auth pages (sign-in, sign-up, etc.)
        if (sessionState.isAuthenticated && sessionState.emailVerified !== false && isAuthPage) {
            return secureRedirect(new URL('/dashboard', req.url));
        }

        // Verified users do not need the verification screen.
        if (sessionState.isAuthenticated && sessionState.emailVerified !== false && isVerifyEmailPage) {
            return secureRedirect(new URL('/dashboard', req.url));
        }
    }

    return addSecurityHeaders(NextResponse.next());
}

// Matcher configuration - exclude static files
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|manifest|json)$).*)',
    ]
};
