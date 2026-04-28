import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CONFIG } from './utils/config';
import { isAuthPagePath, isUnauthenticatedPagePath } from './lib/auth-routing';

/**
 * Proxy (middleware) for route protection and security headers.
 * Keep this intentionally small: the proxy only separates public traffic from
 * authenticated traffic. API route handlers do the real session and role checks.
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

function getSanitizedAuthUrl(req: NextRequest, allowedParams: readonly string[]) {
    const sanitizedUrl = req.nextUrl.clone();
    const sanitizedParams = new URLSearchParams();

    allowedParams.forEach((param) => {
        const values = req.nextUrl.searchParams.getAll(param);

        values.forEach((value) => {
            sanitizedParams.append(param, value);
        });
    });

    const currentQuery = req.nextUrl.searchParams.toString();
    const nextQuery = sanitizedParams.toString();

    if (currentQuery === nextQuery) {
        return null;
    }

    sanitizedUrl.search = nextQuery ? `?${nextQuery}` : '';
    return sanitizedUrl;
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

function isStaticAsset(pathname: string) {
    return pathname.startsWith('/_next/') || pathname.includes('.');
}

function validateMutationRequest(req: NextRequest, pathname: string) {
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        return null;
    }

    const contentLength = req.headers.get('content-length');
    if (contentLength) {
        const size = parseInt(contentLength, 10);
        const isFileUpload = pathname.includes('/upload') || pathname.includes('/verification') || pathname.includes('/onboarding');
        const sizeLimit = isFileUpload ? CONFIG.SECURITY.MAX_BODY_SIZE_UPLOAD : CONFIG.SECURITY.MAX_BODY_SIZE_DEFAULT;

        if (Number.isFinite(size) && size > sizeLimit) {
            return NextResponse.json(
                { error: `Request too large. Maximum size: ${Math.round(sizeLimit / 1024 / 1024)}MB` },
                { status: 413 }
            );
        }
    }

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

    return null;
}

// Default export for Next.js 16 proxy convention
export default function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (
        pathname.startsWith('/api/auth/') ||
        pathname.startsWith('/api/webhooks/') ||
        pathname.startsWith('/api/activity/cleanup') ||
        pathname.startsWith('/api/activity/flush') ||
        isStaticAsset(pathname)
    ) {
        return addSecurityHeaders(NextResponse.next());
    }

    const hasSession = hasSessionCookie(req);

    if (pathname.startsWith('/api/')) {
        if (!hasSession) {
            return addSecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        }

        const mutationError = validateMutationRequest(req, pathname);
        if (mutationError) {
            return addSecurityHeaders(mutationError);
        }

        return addSecurityHeaders(NextResponse.next());
    }

    if (isAuthPagePath(pathname)) {
        const allowedParams = pathname === '/sign-in' ? ['verified', 'reset', 'error'] : [];
        const sanitizedUrl = getSanitizedAuthUrl(req, allowedParams);
        if (sanitizedUrl) {
            return secureRedirect(sanitizedUrl);
        }
    }

    if (!hasSession && !isUnauthenticatedPagePath(pathname)) {
        return secureRedirect(new URL('/sign-in', req.url));
    }

    return addSecurityHeaders(NextResponse.next());
}

// Matcher configuration - exclude static files
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|manifest|json)$).*)',
    ]
};
