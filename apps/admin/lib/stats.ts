import {
  users,
  athleteProfiles,
  coachProfiles,
  recruitingProfiles,
  userSubscriptions,
  verificationRequests,
  reports,
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
  verifications: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
  };
  reports: {
    total: number;
    pending: number;
    underReview: number;
    resolved: number;
    dismissed: number;
  };
  verifiedProfiles: {
    athletes: number;
    coaches: number;
    recruiters: number;
  };
};

export async function getAdminStats(admin: AdminSession): Promise<AdminStats> {
  return executeAsAdmin(admin, async (tx) => {
    const [
      [{ value: totalUsers }],
      [{ value: athleteCount }],
      [{ value: coachCount }],
      [{ value: recruiterCount }],
      [{ value: adminCount }],
      [{ value: bannedCount }],
      [{ value: onboardingCount }],
      [{ value: totalSubs }],
      [{ value: activeSubs }],
      [{ value: cancelledSubs }],
      subsByTier,
      [{ value: totalVerifs }],
      [{ value: pendingVerifs }],
      [{ value: underReviewVerifs }],
      [{ value: approvedVerifs }],
      [{ value: rejectedVerifs }],
      [{ value: totalReports }],
      [{ value: pendingReports }],
      [{ value: underReviewReports }],
      [{ value: resolvedReports }],
      [{ value: dismissedReports }],
      [{ value: verifiedAthletes }],
      [{ value: verifiedCoaches }],
      [{ value: verifiedRecruiters }],
    ] = await Promise.all([
      tx.select({ value: count() }).from(users),
      tx.select({ value: count() }).from(users).where(eq(users.role, "athlete")),
      tx.select({ value: count() }).from(users).where(eq(users.role, "coach")),
      tx.select({ value: count() }).from(users).where(eq(users.role, "recruiter")),
      tx.select({ value: count() }).from(users).where(eq(users.role, "admin")),
      tx.select({ value: count() }).from(users).where(eq(users.banned, true)),
      tx.select({ value: count() }).from(users).where(sql`${users.role} IS NULL`),
      tx.select({ value: count() }).from(userSubscriptions),
      tx.select({ value: count() }).from(userSubscriptions).where(eq(userSubscriptions.status, "active")),
      tx.select({ value: count() }).from(userSubscriptions).where(eq(userSubscriptions.status, "cancelled")),
      tx
        .select({ tier: userSubscriptions.tier, value: count() })
        .from(userSubscriptions)
        .where(ne(userSubscriptions.tier, "free"))
        .groupBy(userSubscriptions.tier),
      tx.select({ value: count() }).from(verificationRequests),
      tx.select({ value: count() }).from(verificationRequests).where(eq(verificationRequests.status, "pending")),
      tx.select({ value: count() }).from(verificationRequests).where(eq(verificationRequests.status, "under_review")),
      tx.select({ value: count() }).from(verificationRequests).where(eq(verificationRequests.status, "approved")),
      tx.select({ value: count() }).from(verificationRequests).where(eq(verificationRequests.status, "rejected")),
      tx.select({ value: count() }).from(reports),
      tx.select({ value: count() }).from(reports).where(eq(reports.status, "pending")),
      tx.select({ value: count() }).from(reports).where(eq(reports.status, "under_review")),
      tx.select({ value: count() }).from(reports).where(eq(reports.status, "resolved")),
      tx.select({ value: count() }).from(reports).where(eq(reports.status, "dismissed")),
      tx
        .select({ value: count() })
        .from(athleteProfiles)
        .where(and(eq(athleteProfiles.isVerified, true), eq(athleteProfiles.isDemoProfile, false))),
      tx
        .select({ value: count() })
        .from(coachProfiles)
        .where(and(eq(coachProfiles.isVerified, true), eq(coachProfiles.isDemoProfile, false))),
      tx
        .select({ value: count() })
        .from(recruitingProfiles)
        .where(
          and(eq(recruitingProfiles.isVerified, true), eq(recruitingProfiles.isDemoProfile, false)),
        ),
    ]);

    const byTier: Record<string, number> = {};
    for (const row of subsByTier) {
      if (row.tier) byTier[row.tier] = Number(row.value);
    }

    return {
      totals: {
        users: Number(totalUsers),
        athletes: Number(athleteCount),
        coaches: Number(coachCount),
        recruiters: Number(recruiterCount),
        admins: Number(adminCount),
        bannedUsers: Number(bannedCount),
        pendingOnboarding: Number(onboardingCount),
      },
      subscriptions: {
        total: Number(totalSubs),
        active: Number(activeSubs),
        cancelled: Number(cancelledSubs),
        byTier,
      },
      verifications: {
        total: Number(totalVerifs),
        pending: Number(pendingVerifs),
        underReview: Number(underReviewVerifs),
        approved: Number(approvedVerifs),
        rejected: Number(rejectedVerifs),
      },
      reports: {
        total: Number(totalReports),
        pending: Number(pendingReports),
        underReview: Number(underReviewReports),
        resolved: Number(resolvedReports),
        dismissed: Number(dismissedReports),
      },
      verifiedProfiles: {
        athletes: Number(verifiedAthletes),
        coaches: Number(verifiedCoaches),
        recruiters: Number(verifiedRecruiters),
      },
    };
  });
}
