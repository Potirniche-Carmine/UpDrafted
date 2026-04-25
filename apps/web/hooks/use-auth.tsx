"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signUp, signOut } from "@/lib/auth-client";
import type { Roles } from "@/lib/auth-routing";

export { signIn, signUp, signOut };
export type { Roles };

export interface User {
    id: string;
    email: string;
    role?: Roles | null;
    name?: string | null;
    image?: string | null;
    emailVerified?: boolean;
    // Additional fields for backward compatibility
    primaryEmail?: string;
    primaryEmailAddress?: { emailAddress: string };
}

interface UseUserReturn {
    user: User | null;
    isLoaded: boolean;
    isSignedIn: boolean;
}

interface UseAuthReturn {
    userId: string | null;
    isLoaded: boolean;
    isSignedIn: boolean;
    getToken: () => Promise<string | null>;
}

function mapSessionUser(session: { user?: {
    id: string;
    email: string;
    role?: Roles | null;
    name?: string | null;
    image?: string | null;
    emailVerified?: boolean;
} } | null | undefined): User | null {
    if (!session?.user) {
        return null;
    }

    return {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name,
        image: session.user.image ?? null,
        emailVerified: session.user.emailVerified,
        primaryEmail: session.user.email,
        primaryEmailAddress: { emailAddress: session.user.email },
    };
}

/**
 * Drop-in replacement for Clerk's useUser hook.
 * Returns the current user from better-auth session. The underlying client
 * short-circuits the network call when no session cookie is present.
 */
export function useUser(): UseUserReturn {
    const { data: session, isPending } = useSession();
    const user = mapSessionUser(session);

    return {
        user,
        isLoaded: !isPending,
        isSignedIn: !!user,
    };
}

/**
 * Drop-in replacement for Clerk's useAuth hook.
 */
export function useAuth(): UseAuthReturn {
    const { user, isLoaded, isSignedIn } = useUser();

    return {
        userId: user?.id ?? null,
        isLoaded,
        isSignedIn,
        getToken: async () => null,
    };
}

// Legacy component placeholders - these should be replaced with custom components
export function SignedIn({ children }: { children: ReactNode }) {
    const { isSignedIn, isLoaded } = useAuth();
    if (!isLoaded) return null;
    return isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
    const { isSignedIn, isLoaded } = useAuth();
    if (!isLoaded) return null;
    return !isSignedIn ? <>{children}</> : null;
}

// Placeholder for UserButton - needs custom implementation
export function UserButton({
    afterSignOutUrl
}: {
    afterSignOutUrl?: string;
}) {
    const { user, isLoaded } = useUser();
    const handleSignOut = async () => {
        await signOut();
        if (afterSignOutUrl) {
            window.location.href = afterSignOutUrl;
        }
    };

    if (!isLoaded || !user) return null;

    return (
        <button onClick={handleSignOut} className="flex items-center gap-2 text-sm hover:opacity-80">
            {user.image ? (
                <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                </div>
            )}
        </button>
    );
}

// Sign in/up buttons
export function SignInButton({ children }: { children?: ReactNode }) {
    return (
        <Link href="/sign-in" className="inline-flex">
            {children || <span>Sign In</span>}
        </Link>
    );
}

export function SignUpButton({ children }: { children?: ReactNode }) {
    return (
        <Link href="/sign-up" className="inline-flex">
            {children || <span>Sign Up</span>}
        </Link>
    );
}
