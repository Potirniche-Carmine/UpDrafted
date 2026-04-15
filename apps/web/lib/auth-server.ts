import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server-side auth utilities for API routes and server components.
 * Drop-in replacement for Clerk's auth() function.
 */

export async function auth_server() {
    const session = await auth.api.getSession({ headers: await headers() });

    return {
        userId: session?.user?.id ?? null,
        user: session?.user ?? null,
        sessionId: session?.session?.id ?? null,
        session: session?.session ?? null,
    };
}

// Re-export as 'auth' for compatibility with existing imports
export { auth_server as auth };

/**
 * Get session with full user data
 */
export async function getServerSession() {
    return auth.api.getSession({ headers: await headers() });
}
