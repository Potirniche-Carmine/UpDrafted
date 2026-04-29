// Single source of truth for app roles. Must stay in sync with
// `userRoleEnum` in packages/db/src/schema.ts.
export const APP_ROLES = ["admin", "athlete", "coach", "recruiter"] as const;

export type Roles = (typeof APP_ROLES)[number];

interface SessionUserLike {
  role?: unknown;
  emailVerified?: boolean | null;
  banned?: unknown;
  bannedUntil?: unknown;
}

export function hasAppRole(role: unknown): role is Roles {
  return typeof role === "string" && APP_ROLES.includes(role as Roles);
}

export function isActiveUserBan(user: SessionUserLike | null | undefined): boolean {
  if (!user?.banned) return false;
  const until = user.bannedUntil;
  if (until == null) return true;
  const expiresAt = until instanceof Date ? until : new Date(String(until));
  if (Number.isNaN(expiresAt.getTime())) return true;
  return expiresAt.getTime() > Date.now();
}

export function getPostAuthPath(user: SessionUserLike | null | undefined): "/dashboard" | "/onboarding" {
  return hasAppRole(user?.role) ? "/dashboard" : "/onboarding";
}

export function getAccessPathForUser(
  user: SessionUserLike | null | undefined,
): "/verify-email" | "/dashboard" | "/onboarding" {
  if (user?.emailVerified === false) {
    return "/verify-email";
  }

  return getPostAuthPath(user);
}

export function canAccessWithoutAppRole(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }

  return pathname === "/account" || pathname.startsWith("/account/");
}

export const PUBLIC_PAGE_PATHS = [
  "/",
  "/about",
  "/contact",
  "/terms-of-service",
  "/privacy-policy",
  "/for-coaches",
  "/for-athletes",
  "/for-recruiters",
] as const;

export const AUTH_PAGE_PATHS = [
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/reset-password",
] as const;

function matchesPath(pathname: string, paths: readonly string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isPublicPagePath(pathname: string | null | undefined): boolean {
  return Boolean(pathname && matchesPath(pathname, PUBLIC_PAGE_PATHS));
}

export function isAuthPagePath(pathname: string | null | undefined): boolean {
  return Boolean(pathname && matchesPath(pathname, AUTH_PAGE_PATHS));
}

export function isUnauthenticatedPagePath(pathname: string | null | undefined): boolean {
  return isPublicPagePath(pathname) || isAuthPagePath(pathname);
}
