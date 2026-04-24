import {
  users,
  athleteProfiles,
  coachProfiles,
  recruitingProfiles,
  userSubscriptions,
} from "@updrafted/db";
import { and, count, eq, ne, sql } from "drizzle-orm";
import { executeAsAdmin } from "./db-access";
import type { AdminSession } from "./admin-guard";

export type AdminStats = {
  totals: {
    users: number;
    athletes: number;
    coaches: number;
    recruiters: number;
    admins: number;
    bannedUsers: number;
    pendingOnboarding: number;
  };
  subscriptions: {
    total: number;
    active: number;
    cancelled: number;
    byTier: Record<string, number>;
  };
  verifiedProfiles: {
    athletes: number;
    coaches: number;
    recruiters: number;
  };
};

export async function getAdminStats(admin: AdminSession): Promise<AdminStats> {
  return executeAsAdmin(admin, async (tx) => {
    const [userTotals] = await tx
      .select({
        totalUsers: sql<number>`count(*)`,
        athletes: sql<number>`count(*) filter (where ${users.role} = 'athlete')`,
        coaches: sql<number>`count(*) filter (where ${users.role} = 'coach')`,
        recruiters: sql<number>`count(*) filter (where ${users.role} = 'recruiter')`,
        admins: sql<number>`count(*) filter (where ${users.role} = 'admin')`,
        bannedUsers: sql<number>`count(*) filter (where ${users.banned} = true)`,
        pendingOnboarding: sql<number>`count(*) filter (where ${users.role} is null)`,
      })
      .from(users);

    const [subscriptionTotals] = await tx
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) filter (where ${userSubscriptions.status} = 'active')`,
        cancelled: sql<number>`count(*) filter (where ${userSubscriptions.status} = 'cancelled')`,
      })
      .from(userSubscriptions);

    const subsByTier = await tx
      .select({ tier: userSubscriptions.tier, value: count() })
      .from(userSubscriptions)
      .where(ne(userSubscriptions.tier, "free"))
      .groupBy(userSubscriptions.tier);

    const [{ value: verifiedAthletes }] = await tx
      .select({ value: count() })
      .from(athleteProfiles)
      .where(and(eq(athleteProfiles.isVerified, true), eq(athleteProfiles.isDemoProfile, false)));

    const [{ value: verifiedCoaches }] = await tx
      .select({ value: count() })
      .from(coachProfiles)
      .where(and(eq(coachProfiles.isVerified, true), eq(coachProfiles.isDemoProfile, false)));

    const [{ value: verifiedRecruiters }] = await tx
      .select({ value: count() })
      .from(recruitingProfiles)
      .where(
        and(eq(recruitingProfiles.isVerified, true), eq(recruitingProfiles.isDemoProfile, false)),
      );

    const byTier: Record<string, number> = {};
    for (const row of subsByTier) {
      if (row.tier) byTier[row.tier] = Number(row.value);
    }

    return {
      totals: {
        users: Number(userTotals.totalUsers),
        athletes: Number(userTotals.athletes),
        coaches: Number(userTotals.coaches),
        recruiters: Number(userTotals.recruiters),
        admins: Number(userTotals.admins),
        bannedUsers: Number(userTotals.bannedUsers),
        pendingOnboarding: Number(userTotals.pendingOnboarding),
      },
      subscriptions: {
        total: Number(subscriptionTotals.total),
        active: Number(subscriptionTotals.active),
        cancelled: Number(subscriptionTotals.cancelled),
        byTier,
      },
      verifiedProfiles: {
        athletes: Number(verifiedAthletes),
        coaches: Number(verifiedCoaches),
        recruiters: Number(verifiedRecruiters),
      },
    };
  });
}
