export const APP_ROLES = ["admin", "athlete", "coach", "recruiter"] as const;

export type AppRole = (typeof APP_ROLES)[number];

interface SessionUserLike {
  role?: unknown;
  emailVerified?: boolean | null;
}

export function hasAppRole(role: unknown): role is AppRole {
  return typeof role === "string" && APP_ROLES.includes(role as AppRole);
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
