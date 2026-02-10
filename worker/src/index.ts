
interface Env {
    PROFILE_BUCKET: R2Bucket;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const key = url.pathname.slice(1); // Remove leading slash

        // 1. Security Checks
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        if (!key) {
            return new Response('Not Found', { status: 404 });
        }

        // 2. Fetch from R2
        const object = await env.PROFILE_BUCKET.get(key);

        if (object === null) {
            return new Response('Not Found', { status: 404 });
        }

        // 3. Construct Response with Security Headers
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);

        // Security Headers
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        headers.set('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline';"); // Minimal CSP for an asset domain
        headers.set('Access-Control-Allow-Origin', '*'); // Allow embedding on main site. Change '*' to specific domain in production for tighter security.

        // Cache Control
        // Profile images can be cached, but if they change often, maybe shorter?
        // Using 1 hour for now, browser cache. CDN cache can be longer.
        headers.set('Cache-Control', 'public, max-age=3600');

        return new Response(object.body, {
            headers,
        });
    },
};
