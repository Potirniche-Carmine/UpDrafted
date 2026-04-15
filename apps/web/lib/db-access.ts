import { db } from "@/database/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Executes a callback with the user's role and ID set in the database session.
 * This is required for RLS policies to function correctly.
 * 
 * Usage:
 * const data = await executeWithUser(async (tx) => {
 *   return await tx.query.table.findMany(...);
 * });
 * 
 * If a session is passed, it uses it. Otherwise it attempts to fetch from headers.
 */
export async function executeWithUser<T>(
    callback: (tx: Transaction) => Promise<T>,
    session?: (typeof auth.$Infer.Session) | { user: { id: string; role?: string | null } } | null
): Promise<T> {
    // If no session provided, try to get it
    let currentSession = session;

    if (currentSession === undefined) {
        try {
            const sessionHeaders = await headers();
            currentSession = await auth.api.getSession({
                headers: sessionHeaders
            });
        } catch {
            // Ignore header errors
            currentSession = null;
        }
    }

    // If we have a session, use it to set context
    if (currentSession?.user) {
        const userId = currentSession.user.id;
        const userRole = currentSession.user.role || 'user'; // Default to user if null

        // We use a transaction to ensure valid config scope
        return await db.transaction(async (tx) => {
            // Set the configuration variables for RLS
            await tx.execute(sql`
        SELECT 
          set_config('app.current_user_id', ${userId}, true),
          set_config('app.current_user_role', ${userRole}, true)
      `);

            return await callback(tx);
        });
    }

    // Fallback for public access or unauthenticated users
    return await db.transaction(async (tx) => {
        // Clear the configuration variables
        await tx.execute(sql`
        SELECT 
          set_config('app.current_user_id', '', true),
          set_config('app.current_user_role', '', true)
      `);
        return await callback(tx);
    });
}
