import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { APP_ROLES, type Roles } from '@/lib/auth-routing';

export type { Roles };

const isValidRole = (value: unknown): value is Roles =>
  typeof value === 'string' && (APP_ROLES as readonly string[]).includes(value);

/**
 * Treat a session as banned if the user has `banned=true` and either
 * the ban is permanent (`bannedUntil` null) or the ban has not yet expired.
 */
const isSessionBanned = (
  user: { banned?: unknown; bannedUntil?: unknown } | null | undefined,
): boolean => {
  if (!user || !user.banned) return false;
  const until = user.bannedUntil;
  if (until == null) return true; // permanent ban
  const expiresAt = until instanceof Date ? until : new Date(String(until));
  if (Number.isNaN(expiresAt.getTime())) return true;
  return expiresAt.getTime() > Date.now();
};

/**
 * Get the current session from better-auth. Banned users are filtered out,
 * so callers that pass the null check are guaranteed to be unbanned.
 */
export const getSession = async (requestHeaders?: Headers) => {
  const session = await auth.api.getSession({
    headers: requestHeaders ?? await headers(),
    query: {
      disableCookieCache: true,
    },
  });
  if (session?.user && isSessionBanned(session.user as never)) {
    return null;
  }
  return session;
};

export type GuardSuccess = {
  userId: string;
  role: Roles | null;
  user: NonNullable<Awaited<ReturnType<typeof getSession>>>['user'];
};

export type RoleGuardSuccess = GuardSuccess & { role: Roles };

/**
 * Require an authenticated, unbanned session. Role may be null (user is
 * mid-onboarding). Use this when a route just needs "is this a real user".
 */
export const requireSession = async (
  requestHeaders?: Headers,
): Promise<GuardSuccess | NextResponse> => {
  const session = await auth.api.getSession({
    headers: requestHeaders ?? await headers(),
    query: {
      disableCookieCache: true,
    },
  });
  if (session?.user && isSessionBanned(session.user as never)) {
    return NextResponse.json(
      { error: 'Account banned' },
      { status: 403 },
    );
  }
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = isValidRole(session.user.role) ? session.user.role : null;
  return { userId: session.user.id, role, user: session.user };
};

/**
 * Check if the current user has a specific role.
 */
export const checkRole = async (role: Roles): Promise<boolean> => {
  const session = await getSession();
  return session?.user?.role === role;
};

/**
 * Require any valid role (user must be authenticated with a role).
 */
export const requireAnyRole = async (): Promise<RoleGuardSuccess | NextResponse> => {
  const result = await requireSession();
  if (result instanceof NextResponse) return result;
  if (!result.role) {
    return NextResponse.json(
      { error: 'Forbidden - Valid role required' },
      { status: 403 },
    );
  }
  return result as RoleGuardSuccess;
};

/**
 * Require one of the specified roles.
 */
export const requireRole = async (
  allowedRoles: Roles[],
): Promise<RoleGuardSuccess | NextResponse> => {
  const result = await requireSession();
  if (result instanceof NextResponse) return result;
  if (!result.role || !allowedRoles.includes(result.role)) {
    return NextResponse.json(
      { error: `Forbidden - Requires one of: ${allowedRoles.join(', ')}` },
      { status: 403 },
    );
  }
  return result as RoleGuardSuccess;
};

/**
 * Require admin role.
 */
export const requireAdmin = async (): Promise<{ userId: string; role: 'admin'; user: GuardSuccess['user'] } | NextResponse> => {
  const result = await requireRole(['admin']);
  if (result instanceof NextResponse) return result;
  return result as { userId: string; role: 'admin'; user: GuardSuccess['user'] };
};

/**
 * Page-context guard for server components. Redirects to /sign-in when
 * unauthenticated and to `redirectOnRoleMismatch` (default /dashboard) when
 * the role isn't in `allowedRoles`. Returns the session on success.
 */
export const requireRolePage = async (
  allowedRoles: Roles[],
  redirectOnRoleMismatch: string = '/dashboard',
): Promise<RoleGuardSuccess> => {
  const session = await getSession();
  if (!session?.user) {
    redirect('/sign-in');
  }
  const role = isValidRole(session.user.role) ? session.user.role : null;
  if (!role || !allowedRoles.includes(role)) {
    redirect(redirectOnRoleMismatch);
  }
  return { userId: session.user.id, role, user: session.user };
};

/**
 * Require ownership of a resource or admin role.
 */
export const requireOwnershipOrAdmin = async (
  resourceUserId: string,
): Promise<(RoleGuardSuccess & { isOwner: boolean }) | NextResponse> => {
  const result = await requireSession();
  if (result instanceof NextResponse) return result;
  if (!result.role) {
    return NextResponse.json({ error: 'Forbidden - Valid role required' }, { status: 403 });
  }
  const isOwner = result.userId === resourceUserId;
  const isAdmin = result.role === 'admin';
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden - You can only access your own resources' },
      { status: 403 },
    );
  }
  return { ...(result as RoleGuardSuccess), isOwner };
};
