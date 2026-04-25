import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export type Roles = 'admin' | 'athlete' | 'coach' | 'recruiter';

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

/**
 * Check if the current user has a specific role.
 */
export const checkRole = async (role: Roles): Promise<boolean> => {
  const session = await getSession();
  return session?.user?.role === role;
};

/**
 * Require any valid role (user must be authenticated with a role).
 * Returns user info or NextResponse error.
 */
export const requireAnyRole = async (): Promise<{ userId: string; role: Roles } | NextResponse> => {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = session.user.role as Roles;

  if (!userRole || !['admin', 'athlete', 'coach', 'recruiter'].includes(userRole)) {
    return NextResponse.json({
      error: 'Forbidden - Valid role required'
    }, { status: 403 });
  }

  return { userId: session.user.id, role: userRole };
};

/**
 * Require one of the specified roles.
 * Returns user info or NextResponse error.
 */
export const requireRole = async (allowedRoles: Roles[]): Promise<{ userId: string; role: Roles } | NextResponse> => {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = session.user.role as Roles;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json({
      error: `Forbidden - Requires one of: ${allowedRoles.join(', ')}`
    }, { status: 403 });
  }

  return { userId: session.user.id, role: userRole };
};

/**
 * Require admin role.
 */
export const requireAdmin = async (): Promise<{ userId: string; role: 'admin' } | NextResponse> => {
  const result = await requireRole(['admin']);
  if (result instanceof NextResponse) return result;
  return result as { userId: string; role: 'admin' };
};

/**
 * Require ownership of a resource or admin role.
 */
export const requireOwnershipOrAdmin = async (
  resourceUserId: string
): Promise<{ userId: string; role: Roles; isOwner: boolean } | NextResponse> => {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = session.user.role as Roles;

  if (!userRole) {
    return NextResponse.json({ error: 'Forbidden - Valid role required' }, { status: 403 });
  }

  const isOwner = session.user.id === resourceUserId;
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    return NextResponse.json({
      error: 'Forbidden - You can only access your own resources'
    }, { status: 403 });
  }

  return { userId: session.user.id, role: userRole, isOwner };
};
