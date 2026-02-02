"use client";

import { ReactNode } from "react";

/**
 * Auth provider wrapper for better-auth.
 * Better-auth handles session state automatically via cookies,
 * so this is a minimal wrapper that can be extended later.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
