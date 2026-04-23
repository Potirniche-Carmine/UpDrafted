import { db } from "@updrafted/db";
import { sql } from "drizzle-orm";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Runs a callback inside a transaction with the RLS context set to
 * the provided admin user. All admin-dashboard DB access must go
 * through this helper so that RLS policies work correctly.
 */
export async function executeAsAdmin<T>(
  admin: { userId: string; role: "admin" },
  callback: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return await db.transaction(async (tx) => {
    await tx.execute(sql`
      SELECT
        set_config('app.current_user_id', ${admin.userId}, true),
        set_config('app.current_user_role', ${admin.role}, true)
    `);
    return await callback(tx);
  });
}
