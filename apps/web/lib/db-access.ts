import { db } from "@/database/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

type SessionLike = { user: { id: string; role?: string | null } } | null | undefined;

const VALID_ROLES = ['admin', 'athlete', 'coach', 'recruiter'] as const;
type RLSRole = (typeof VALID_ROLES)[number];

const isValidRole = (value: unknown): value is RLSRole =>
  typeof value === 'string' && (VALID_ROLES as readonly string[]).includes(value);

/**
 * Executes a callback with the user's role and ID set in the database session.
 * RLS policies in packages/db/src/schema.ts read these values via
 * current_setting('app.current_user_id') / current_setting('app.current_user_role').
 *
 * Pass an explicit session when you already have one (e.g. from an auth-guard
 * helper) to skip a redundant cookie lookup. Pass `null` to run as an
 * unauthenticated request (RLS policies that require a user will fail-closed).
 *
 * NOTE: when the session has no role (user mid-onboarding), role context is
 * cleared rather than set to a magic string. Policies comparing against valid
 * role names will not match — that's the intended fail-closed behaviour.
 */
export async function executeWithUser<T>(
    callback: (tx: Transaction) => Promise<T>,
    session?: (typeof auth.$Infer.Session) | SessionLike
): Promise<T> {
    let currentSession: SessionLike = session;

    if (currentSession === undefined) {
        try {
            const sessionHeaders = await headers();
            currentSession = await auth.api.getSession({
                headers: sessionHeaders
            });
        } catch {
            currentSession = null;
        }
    }

    const userId = currentSession?.user?.id ?? '';
    const rawRole = currentSession?.user?.role;
    const role = isValidRole(rawRole) ? rawRole : '';

    return await db.transaction(async (tx) => {
        await tx.execute(sql`
            SELECT
              set_config('app.current_user_id', ${userId}, true),
              set_config('app.current_user_role', ${role}, true)
        `);
        return await callback(tx);
    });
}

/**
 * Run queries with elevated context — for webhooks, cron jobs, and other
 * trusted backend code that has no user session. Sets the RLS role to
 * 'admin' so RLS policies treat the request as system-level.
 *
 * Use ONLY in code paths that have already authenticated the caller through
 * another mechanism (Stripe webhook signature, internal cron token, etc.).
 * Never expose this on a request path that takes user input.
 */
export async function executeAsSystem<T>(
    callback: (tx: Transaction) => Promise<T>,
): Promise<T> {
    return await db.transaction(async (tx) => {
        await tx.execute(sql`
            SELECT
              set_config('app.current_user_id', '', true),
              set_config('app.current_user_role', 'admin', true)
        `);
        return await callback(tx);
    });
}
