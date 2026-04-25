import { createAuthClient } from "better-auth/react";
import { magicLinkClient, emailOTPClient } from "better-auth/client/plugins";

const SESSION_COOKIE_NAMES = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
];

function clientHasSessionCookie(): boolean {
    if (typeof document === "undefined") return false;
    const cookies = document.cookie;
    return SESSION_COOKIE_NAMES.some((name) => cookies.includes(`${name}=`));
}

function urlOf(input: RequestInfo | URL): string {
    if (typeof input === "string") return input;
    if (input instanceof URL) return input.toString();
    return input.url;
}

const emptySessionResponse = () =>
    new Response("null", {
        status: 200,
        headers: { "content-type": "application/json" },
    });

// Intercept the auth client fetcher: if a session lookup is fired while no
// session cookie is present on the document, short-circuit with a synthetic
// empty-session response. Avoids an unnecessary /api/auth/get-session call
// for signed-out visitors anywhere useSession is consumed.
async function customFetchImpl(input: RequestInfo | URL, init?: RequestInit) {
    const url = urlOf(input);
    if (url.includes("/get-session") && typeof document !== "undefined" && !clientHasSessionCookie()) {
        return emptySessionResponse();
    }
    return fetch(input, init);
}

// Create the auth client for use in React components
export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('PLACEHOLDER')
            ? process.env.NEXT_PUBLIC_APP_URL
            : "http://localhost:3000"),
    fetchOptions: {
        customFetchImpl,
    },
    plugins: [
        magicLinkClient(),
        emailOTPClient(),
    ],
});

// Export commonly used hooks and functions
export const {
    useSession,
    signIn,
    signUp,
    signOut,
    magicLink,
} = authClient;

// Helper hook to get the current user with role
export function useUser() {
    const { data: session, isPending, error } = useSession();
    return {
        user: session?.user ?? null,
        isLoaded: !isPending,
        isSignedIn: !!session?.user,
        error,
    };
}
