import { createAuthClient } from "better-auth/react";
import { magicLinkClient, emailOTPClient } from "better-auth/client/plugins";

// Create the auth client for use in React components
export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('PLACEHOLDER')
            ? process.env.NEXT_PUBLIC_APP_URL
            : "http://localhost:3000"),
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
