"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isUserBanned, signOut, useUser } from "@/hooks/use-auth";
import { canAccessWithoutAppRole, hasAppRole } from "@/lib/auth-routing";

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: string[];
  fallbackPath?: string;
  loadingComponent?: ReactNode;
  enforceServerSide?: boolean;
  type?: "default" | "onboarding" | "landing";
}

interface AuthResolution {
  allow: boolean;
  loading: boolean;
}

function renderDefaultLoader(message: string) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-6 h-6 border-2 border-[#01ae79] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function renderBannedAccount(user: { bannedUntil?: Date | string | null; banReason?: string | null } | null) {
  const expiresAt = user?.bannedUntil ? new Date(String(user.bannedUntil)) : null;
  const hasValidExpiry = expiresAt && !Number.isNaN(expiresAt.getTime());

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-lg">
        <h1 className="text-2xl font-semibold text-foreground">Account banned</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your UpDrafted account has been banned and cannot access the site.
        </p>
        <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-left text-sm">
          <p>
            <span className="font-medium">Expires: </span>
            {hasValidExpiry ? expiresAt.toLocaleString() : "Never"}
          </p>
          {user?.banReason ? (
            <p className="mt-2">
              <span className="font-medium">Reason: </span>
              {user.banReason}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="mt-5 w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={async () => {
            await signOut();
            window.location.href = "/";
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function resolveAuthState({
  isLoaded,
  isSignedIn,
  user,
  pathname,
  requireAuth,
  requireRole,
  type,
}: {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: { role?: string | null; emailVerified?: boolean } | null;
  pathname: string | null;
  requireAuth: boolean;
  requireRole: string[];
  type: "default" | "onboarding" | "landing";
}): AuthResolution {
  if (!isLoaded) {
    return { allow: false, loading: true };
  }

  if (type === "landing") {
    return isSignedIn
      ? { allow: false, loading: false }
      : { allow: true, loading: false };
  }

  if (type === "onboarding") {
    if (!isSignedIn) {
      return { allow: false, loading: false };
    }

    if (user?.emailVerified === false) {
      return { allow: false, loading: false };
    }

    if (hasAppRole(user?.role) && user.role !== "admin") {
      return { allow: false, loading: false };
    }

    return { allow: true, loading: false };
  }

  if (!requireAuth) {
    return { allow: true, loading: false };
  }

  if (!isSignedIn) {
    return { allow: false, loading: false };
  }

  if (user?.emailVerified === false) {
    return { allow: false, loading: false };
  }

  const userRole = user?.role;
  const hasRole = hasAppRole(userRole);
  const canStayWithoutRole = canAccessWithoutAppRole(pathname);

  if (!hasRole && !pathname?.startsWith("/onboarding") && !canStayWithoutRole) {
    return { allow: false, loading: false };
  }

  if (requireRole.length > 0 && (!userRole || !requireRole.includes(userRole))) {
    return { allow: false, loading: false };
  }

  return { allow: true, loading: false };
}

export function AuthWrapper({
  children,
  requireAuth = true,
  requireRole = [],
  loadingComponent,
  type = "default",
}: AuthWrapperProps) {
  const pathname = usePathname();
  const { user, isLoaded, isSignedIn } = useUser();

  const resolution = resolveAuthState({
    isLoaded,
    isSignedIn,
    user,
    pathname,
    requireAuth,
    requireRole,
    type,
  });

  if (resolution.allow) {
    if (isUserBanned(user)) {
      return renderBannedAccount(user);
    }
    return <>{children}</>;
  }

  if (isLoaded && isUserBanned(user)) {
    return renderBannedAccount(user);
  }

  if (loadingComponent) {
    return <>{loadingComponent}</>;
  }

  return renderDefaultLoader(resolution.loading ? "Loading..." : "Checking access...");
}

export function OnboardingWrapper({
  children,
  loadingComponent,
}: {
  children: ReactNode;
  loadingComponent?: ReactNode;
}) {
  return (
    <AuthWrapper type="onboarding" loadingComponent={loadingComponent}>
      {children}
    </AuthWrapper>
  );
}
