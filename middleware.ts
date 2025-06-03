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
    return NextResponse.json({ error: 'URL too long' }, { status: 414 });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(req.url); 

    if (parsedUrl.search.length > MAX_QUERY_STRING_LENGTH) {
      return NextResponse.json(
        { error: 'Query string too long' },
        { status: 400 }
      );
    }

    // 3. Limit number of query parameters
    if (parsedUrl.searchParams.size > MAX_GLOBAL_QUERY_PARAMS) {
      return NextResponse.json(
        { error: 'Too many query parameters' },
        { status: 400 } 
      );
    }
  } catch {
    return NextResponse.json({ error: 'Malformed URL' }, { status: 400 });
  }

  // Handle API routes
  if (isApiRoute(req)) {
    try {
      const authState = await auth();
      if (!authState.userId) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/api/(.*)',
  ],
};

