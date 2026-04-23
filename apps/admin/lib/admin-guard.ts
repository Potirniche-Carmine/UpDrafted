import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "./auth";

export type AdminSession = {
  userId: string;
  role: "admin";
  email: string;
  name: string;
};

/**
 * Returns the current admin session or null when the caller isn't
 * an active admin. Note: the only way to get `role === 'admin'` in
 * the database is a manual SQL update — admin assignment is
 * intentionally not exposed through any app surface.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const { role, id, email, name, banned } = session.user as {
    role?: string | null;
    id: string;
    email: string;
    name: string;
    banned?: boolean | null;
  };
  if (banned) return null;
  if (role !== "admin") return null;
  return { userId: id, role: "admin", email, name };
}

/**
 * Require admin in an API route. Returns the session or a NextResponse
 * that should be returned immediately from the handler.
 */
export async function requireAdminApi(): Promise<AdminSession | NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
