import {
  athleteProfiles,
  coachProfiles,
  connections,
  recruitingProfiles,
  reports,
  reportModeratorComments,
  userSubscriptions,
  users,
  verificationModeratorComments,
  verificationRequests,
} from "@updrafted/db";
import { count, desc, eq, ilike, or } from "drizzle-orm";
import type { AdminSession } from "./admin-guard";
import { executeAsAdmin } from "./db-access";
import { buildPublicProfileUrl } from "./utils";

export type ManagedUserRole = "athlete" | "coach" | "recruiter" | "admin" | null;

export type ManagedUserListItem = {
  id: string;
  name: string;
  email: string;
  role: ManagedUserRole;
  banned: boolean;
  bannedUntil: string | null;
  createdAt: string;
  profileUrl: string;
  verified: boolean;
  profileSummary: string | null;
};

export type ManagedUserDetail = ManagedUserListItem & {
  emailVerified: boolean;
  image: string | null;
  bannedAt: string | null;
  bannedBy: string | null;
  bannedByUser: { id: string; name: string; email: string } | null;
  banReason: string | null;
  updatedAt: string;
  connectionsCount: number;
  profiles: Array<{
    type: "athlete" | "coach" | "recruiter";
    fullName: string;
    organization: string | null;
    sport: string;
    location: string;
    verified: boolean;
    demo: boolean;
  }>;
  subscription: {
    tier: string;
    status: string;
    currentPeriodEnd: string | null;
  } | null;
  verifications: Array<{
    id: number;
    role: "athlete" | "coach" | "recruiter" | "admin";
    status: "pending" | "approved" | "rejected";
    submittedAt: string;
    reviewedAt: string | null;
  }>;
  reportsAgainst: Array<{
    id: number;
    status: "pending" | "under_review" | "resolved" | "dismissed";
    reason: string;
    submittedAt: string;
    reporterName: string | null;
  }>;
  reportsMade: Array<{
    id: number;
    status: "pending" | "under_review" | "resolved" | "dismissed";
    reason: string;
    submittedAt: string;
    reportedUserName: string | null;
  }>;
};

export type ManagedUserActionInput =
  | { action: "verify" | "unverify" }
  | { action: "unban" }
  | { action: "ban_permanent"; reason: string }
  | { action: "ban_temporary"; reason: string; durationDays: number };

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function isVerified(row: {
  athleteVerified: boolean | null;
  coachVerified: boolean | null;
  recruiterVerified: boolean | null;
}): boolean {
  return Boolean(row.athleteVerified || row.coachVerified || row.recruiterVerified);
}

function getProfileSummary(row: {
  athleteFullName: string | null;
  athleteSport: string | null;
  coachFullName: string | null;
  coachSport: string | null;
  recruiterFullName: string | null;
  recruiterSport: string | null;
}): string | null {
  if (row.athleteFullName) return `${row.athleteFullName} - ${row.athleteSport ?? "athlete"}`;
  if (row.coachFullName) return `${row.coachFullName} - ${row.coachSport ?? "coach"}`;
  if (row.recruiterFullName) {
    return `${row.recruiterFullName} - ${row.recruiterSport ?? "recruiter"}`;
  }
  return null;
}

export async function listManagedUsers(
  admin: AdminSession,
  query = "",
): Promise<ManagedUserListItem[]> {
  const trimmed = query.trim();
  const searchPattern = trimmed ? `%${trimmed}%` : "";

  return await executeAsAdmin(admin, async (tx) => {
    const rows = await tx
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        banned: users.banned,
        bannedUntil: users.bannedUntil,
        createdAt: users.createdAt,
        athleteFullName: athleteProfiles.fullName,
        athleteSport: athleteProfiles.sport,
        athleteVerified: athleteProfiles.isVerified,
        coachFullName: coachProfiles.fullName,
        coachSport: coachProfiles.sportCoaching,
        coachVerified: coachProfiles.isVerified,
        recruiterFullName: recruitingProfiles.fullName,
        recruiterSport: recruitingProfiles.sportRecruiting,
        recruiterVerified: recruitingProfiles.isVerified,
      })
      .from(users)
      .leftJoin(athleteProfiles, eq(athleteProfiles.userId, users.id))
      .leftJoin(coachProfiles, eq(coachProfiles.userId, users.id))
      .leftJoin(recruitingProfiles, eq(recruitingProfiles.userId, users.id))
      .where(
        trimmed
          ? or(
              ilike(users.name, searchPattern),
              ilike(users.email, searchPattern),
              ilike(users.id, searchPattern),
            )
          : undefined,
      )
      .orderBy(desc(users.createdAt))
      .limit(100);

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      banned: row.banned,
      bannedUntil: toIso(row.bannedUntil),
      createdAt: row.createdAt.toISOString(),
      profileUrl: buildPublicProfileUrl(row.name, row.id),
      verified: isVerified(row),
      profileSummary: getProfileSummary(row),
    }));
  });
}

export async function getManagedUserDetail(
  admin: AdminSession,
  userId: string,
): Promise<ManagedUserDetail | null> {
  return await executeAsAdmin(admin, async (tx) => {
    const row = await tx.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        athleteProfile: { with: { school: { columns: { name: true } } } },
        coachProfile: { with: { school: { columns: { name: true } } } },
        recruitingProfile: { with: { school: { columns: { name: true } } } },
      },
    });

    if (!row) return null;

    const [connectionCountRow] = await tx
      .select({ value: count() })
      .from(connections)
      .where(or(eq(connections.fromUserId, userId), eq(connections.toUserId, userId)));

    const subscription = await tx.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId),
      orderBy: (s, { desc: orderDesc }) => orderDesc(s.createdAt),
    });

    const verificationRows = await tx.query.verificationRequests.findMany({
      where: eq(verificationRequests.userId, userId),
      orderBy: (v, { desc: orderDesc }) => orderDesc(v.submittedAt),
      limit: 10,
    });

    const reportsAgainstRows = await tx.query.reports.findMany({
      where: eq(reports.reportedUserId, userId),
      with: { reporter: { columns: { name: true } } },
      orderBy: (r, { desc: orderDesc }) => orderDesc(r.submittedAt),
      limit: 10,
    });

    const reportsMadeRows = await tx.query.reports.findMany({
      where: eq(reports.reporterId, userId),
      with: { reportedUser: { columns: { name: true } } },
      orderBy: (r, { desc: orderDesc }) => orderDesc(r.submittedAt),
      limit: 10,
    });

    const bannedByUser = row.bannedBy
      ? (await tx.query.users.findFirst({
          where: eq(users.id, row.bannedBy),
          columns: { id: true, name: true, email: true },
        })) ?? null
      : null;

    const profiles: ManagedUserDetail["profiles"] = [];
    if (row.athleteProfile) {
      const profile = row.athleteProfile;
      profiles.push({
        type: "athlete",
        fullName: profile.fullName,
        organization: profile.school?.name ?? null,
        sport: profile.sport,
        location: [profile.city, profile.state, profile.country].filter(Boolean).join(", "),
        verified: Boolean(profile.isVerified),
        demo: Boolean(profile.isDemoProfile),
      });
    }
    if (row.coachProfile) {
      const profile = row.coachProfile;
      profiles.push({
        type: "coach",
        fullName: profile.fullName,
        organization: profile.school?.name ?? null,
        sport: profile.sportCoaching,
        location: [profile.city, profile.state, profile.country].filter(Boolean).join(", "),
        verified: Boolean(profile.isVerified),
        demo: Boolean(profile.isDemoProfile),
      });
    }
    if (row.recruitingProfile) {
      const profile = row.recruitingProfile;
      profiles.push({
        type: "recruiter",
        fullName: profile.fullName,
        organization: profile.school?.name ?? null,
        sport: profile.sportRecruiting,
        location: [profile.city, profile.state, profile.country].filter(Boolean).join(", "),
        verified: Boolean(profile.isVerified),
        demo: Boolean(profile.isDemoProfile),
      });
    }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      banned: row.banned,
      bannedUntil: toIso(row.bannedUntil),
      bannedAt: toIso(row.bannedAt),
      bannedBy: row.bannedBy,
      bannedByUser,
      banReason: row.banReason,
      emailVerified: row.emailVerified,
      image: row.image,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      profileUrl: buildPublicProfileUrl(row.name, row.id),
      verified: profiles.some((profile) => profile.verified),
      profileSummary: profiles[0]
        ? `${profiles[0].fullName} - ${profiles[0].sport}`
        : null,
      connectionsCount: connectionCountRow?.value ?? 0,
      profiles,
      subscription: subscription
        ? {
            tier: subscription.tier,
            status: subscription.status,
            currentPeriodEnd: toIso(subscription.currentPeriodEnd),
          }
        : null,
      verifications: verificationRows.map((verification) => ({
        id: verification.id,
        role: verification.role,
        status: verification.status,
        submittedAt: verification.submittedAt.toISOString(),
        reviewedAt: toIso(verification.reviewedAt),
      })),
      reportsAgainst: reportsAgainstRows.map((report) => ({
        id: report.id,
        status: report.status,
        reason: report.reportReason,
        submittedAt: report.submittedAt.toISOString(),
        reporterName: report.reporter?.name ?? null,
      })),
      reportsMade: reportsMadeRows.map((report) => ({
        id: report.id,
        status: report.status,
        reason: report.reportReason,
        submittedAt: report.submittedAt.toISOString(),
        reportedUserName: report.reportedUser?.name ?? null,
      })),
    };
  });
}

export async function applyManagedUserAction(
  admin: AdminSession,
  userId: string,
  input: ManagedUserActionInput,
): Promise<ManagedUserDetail> {
  await executeAsAdmin(admin, async (tx) => {
    const target = await tx.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, role: true },
    });
    if (!target) throw new Error("User not found");

    const now = new Date();

    if (input.action === "verify" || input.action === "unverify") {
      const isVerified = input.action === "verify";
      if (target.role === "athlete") {
        await tx
          .update(athleteProfiles)
          .set({ isVerified, updatedAt: now })
          .where(eq(athleteProfiles.userId, userId));
      } else if (target.role === "coach") {
        await tx
          .update(coachProfiles)
          .set({ isVerified, updatedAt: now })
          .where(eq(coachProfiles.userId, userId));
      } else if (target.role === "recruiter") {
        await tx
          .update(recruitingProfiles)
          .set({ isVerified, updatedAt: now })
          .where(eq(recruitingProfiles.userId, userId));
      } else {
        throw new Error("Only athlete, coach, and recruiter profiles can be verified");
      }

      const latestVerification = await tx.query.verificationRequests.findFirst({
        where: eq(verificationRequests.userId, userId),
        columns: { id: true },
        orderBy: (v, { desc: orderDesc }) => orderDesc(v.submittedAt),
      });
      if (latestVerification) {
        await tx.insert(verificationModeratorComments).values({
          verificationRequestId: latestVerification.id,
          moderatorId: admin.userId,
          body: `${admin.name} ${isVerified ? "verified" : "unverified"} this profile from User Management.`,
        });
      }
      return;
    }

    if (input.action === "unban") {
      await tx
        .update(users)
        .set({
          banned: false,
          bannedAt: null,
          bannedBy: null,
          bannedUntil: null,
          banReason: null,
          updatedAt: now,
        })
        .where(eq(users.id, userId));
      const latestReport = await tx.query.reports.findFirst({
        where: eq(reports.reportedUserId, userId),
        columns: { id: true },
        orderBy: (r, { desc: orderDesc }) => orderDesc(r.submittedAt),
      });
      if (latestReport) {
        await tx.insert(reportModeratorComments).values({
          reportId: latestReport.id,
          moderatorId: admin.userId,
          body: `${admin.name} unbanned this user from User Management.`,
        });
      }
      return;
    }

    if (target.id === admin.userId) {
      throw new Error("Cannot ban yourself");
    }
    if (target.role === "admin") {
      throw new Error("Cannot ban an admin via this surface");
    }
    if (input.action !== "ban_permanent" && input.action !== "ban_temporary") {
      throw new Error("Unsupported action");
    }

    const reason = input.reason.trim();
    if (!reason) throw new Error("A ban reason is required");

    const bannedUntil =
      input.action === "ban_temporary"
        ? new Date(now.getTime() + input.durationDays * 24 * 60 * 60 * 1000)
        : null;

    await tx
      .update(users)
      .set({
        banned: true,
        bannedAt: now,
        bannedBy: admin.userId,
        bannedUntil,
        banReason: reason,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    const latestReport = await tx.query.reports.findFirst({
      where: eq(reports.reportedUserId, userId),
      columns: { id: true },
      orderBy: (r, { desc: orderDesc }) => orderDesc(r.submittedAt),
    });
    if (latestReport) {
      await tx.insert(reportModeratorComments).values({
        reportId: latestReport.id,
        moderatorId: admin.userId,
        body:
          input.action === "ban_permanent"
            ? `${admin.name} permanently banned this user from User Management. Reason: ${reason}`
            : `${admin.name} temporarily banned this user from User Management for ${input.durationDays} days. Reason: ${reason}`,
      });
    }
  });

  const updated = await getManagedUserDetail(admin, userId);
  if (!updated) throw new Error("User not found after action");
  return updated;
}
