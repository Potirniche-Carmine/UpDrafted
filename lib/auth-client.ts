import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";
import { magicLinkClient, emailOTPClient, usernameClient } from "better-auth/client/plugins";

// Create the auth client for use in React components
export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL,
    plugins: [
        stripeClient({
            subscription: true,
        }),
        magicLinkClient(),
        emailOTPClient(),
        usernameClient(),
    ],
});

// Export commonly used hooks and functions
export const {
    useSession,
    signIn,
    signUp,
    signOut,
    magicLink,
    // Stripe subscription methods are available via authClient.subscription
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
