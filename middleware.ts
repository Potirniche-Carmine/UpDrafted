import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


const isApiRoute = createRouteMatcher(['/api/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // --- Security: URL Validation ---
  const MAX_URL_LENGTH = 2048;
  const MAX_QUERY_STRING_LENGTH = 1024;
  const MAX_GLOBAL_QUERY_PARAMS = 15;

  // 1. Fast URL length check
  if (req.url.length > MAX_URL_LENGTH) {
    console.warn(`[Middleware] Denied: URL too long. Length: ${req.url.length}`);
    return NextResponse.json({ error: 'URL too long' }, { status: 414 });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(req.url); 

    if (parsedUrl.search.length > MAX_QUERY_STRING_LENGTH) {
      console.warn(`[Middleware] Denied: Query string too long. Length: ${parsedUrl.search.length}`);
      return NextResponse.json(
        { error: 'Query string too long' },
        { status: 400 }
      );
    }

    // 3. Limit number of query parameters
    if (parsedUrl.searchParams.size > MAX_GLOBAL_QUERY_PARAMS) {
      console.warn(`[Middleware] Denied: Too many query parameters. Count: ${parsedUrl.searchParams.size}`);
      return NextResponse.json(
        { error: 'Too many query parameters' },
        { status: 400 } 
      );
    }
  } catch (urlError) {
    console.warn('[Middleware] Denied: Malformed URL.', urlError);
    return NextResponse.json({ error: 'Malformed URL' }, { status: 400 });
  }

  if (isApiRoute(req)) {
    try {
      const authState = await auth();
      if (!authState.userId) {
        console.warn(`[Middleware] Unauthorized API access attempt to: ${req.url}`);
        // For API routes, always return a JSON response for 401
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // If authenticated, allow the request to proceed to the API route
      return NextResponse.next();
    } catch (error) {
      console.error('[Middleware] Error during API authentication:', error);
      return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
    }
  }
  return NextResponse.next();
});

export const config = {
  // Run middleware ONLY for API routes:
  matcher: [
    '/api/(.*)',
    '/messages/(.*)',
    '/api(.*)',
    '/messages(.*)'
  ],
};

