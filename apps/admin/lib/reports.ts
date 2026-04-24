import { reports, reportModeratorComments, users } from "@updrafted/db";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { executeAsAdmin } from "./db-access";
import type { AdminSession } from "./admin-guard";
import { sendReportBanEmail } from "./email";

export type ReportStatusFilter =
  | "pending"
  | "under_review"
  | "resolved"
  | "dismissed";

const REPORT_STATUS_FILTERS: readonly ReportStatusFilter[] = [
  "pending",
  "under_review",
  "resolved",
  "dismissed",
];

export type ReportListItem = {
  id: number;
  reporterId: string;
  reportedUserId: string;
  reportReason: string;
  status: "pending" | "under_review" | "resolved" | "dismissed";
  submittedAt: string;
  actionTaken: string | null;
  reporter: { id: string; name: string; email: string } | null;
  reportedUser:
    | { id: string; name: string; email: string; banned: boolean; bannedUntil: string | null }
    | null;
};

export type ReportQueueMap = Record<ReportStatusFilter, ReportListItem[]>;

export async function listReports(
  admin: AdminSession,
  statusFilter: ReportStatusFilter = "pending",
): Promise<ReportListItem[]> {
  return executeAsAdmin(admin, async (tx) => {
    const reporter = alias(users, "reporter");
    const reported = alias(users, "reported_user");

    const rows = await tx
      .select({
        id: reports.id,
        reporterId: reports.reporterId,
        reportedUserId: reports.reportedUserId,
        reportReason: reports.reportReason,
        status: reports.status,
        submittedAt: reports.submittedAt,
        actionTaken: reports.actionTaken,
        reporterName: reporter.name,
        reporterEmail: reporter.email,
        reportedName: reported.name,
        reportedEmail: reported.email,
        reportedBanned: reported.banned,
        reportedBannedUntil: reported.bannedUntil,
      })
      .from(reports)
      .leftJoin(reporter, eq(reporter.id, reports.reporterId))
      .leftJoin(reported, eq(reported.id, reports.reportedUserId))
      .where(eq(reports.status, statusFilter))
      .orderBy(desc(reports.submittedAt))
      .limit(200);

    return rows.map((r) => ({
      id: r.id,
      reporterId: r.reporterId,
      reportedUserId: r.reportedUserId,
      reportReason: r.reportReason,
      status: r.status,
      submittedAt: r.submittedAt.toISOString(),
      actionTaken: r.actionTaken,
      reporter: r.reporterName
        ? { id: r.reporterId, name: r.reporterName, email: r.reporterEmail! }
        : null,
      reportedUser: r.reportedName
        ? {
            id: r.reportedUserId,
            name: r.reportedName,
            email: r.reportedEmail!,
            banned: !!r.reportedBanned,
            bannedUntil: r.reportedBannedUntil ? r.reportedBannedUntil.toISOString() : null,
          }
        : null,
    }));
  });
}

export async function listReportQueues(admin: AdminSession): Promise<ReportQueueMap> {
  return executeAsAdmin(admin, async (tx) => {
    const reporter = alias(users, "reporter");
    const reported = alias(users, "reported_user");
    const queues: ReportQueueMap = {
      pending: [],
      under_review: [],
      resolved: [],
      dismissed: [],
    };

    for (const statusFilter of REPORT_STATUS_FILTERS) {
      const rows = await tx
        .select({
          id: reports.id,
          reporterId: reports.reporterId,
          reportedUserId: reports.reportedUserId,
          reportReason: reports.reportReason,
          status: reports.status,
          submittedAt: reports.submittedAt,
          actionTaken: reports.actionTaken,
          reporterName: reporter.name,
          reporterEmail: reporter.email,
          reportedName: reported.name,
          reportedEmail: reported.email,
          reportedBanned: reported.banned,
          reportedBannedUntil: reported.bannedUntil,
        })
        .from(reports)
        .leftJoin(reporter, eq(reporter.id, reports.reporterId))
        .leftJoin(reported, eq(reported.id, reports.reportedUserId))
        .where(eq(reports.status, statusFilter))
        .orderBy(desc(reports.submittedAt))
        .limit(200);

      queues[statusFilter] = rows.map((r) => ({
        id: r.id,
        reporterId: r.reporterId,
        reportedUserId: r.reportedUserId,
        reportReason: r.reportReason,
        status: r.status,
        submittedAt: r.submittedAt.toISOString(),
        actionTaken: r.actionTaken,
        reporter: r.reporterName
          ? { id: r.reporterId, name: r.reporterName, email: r.reporterEmail! }
          : null,
        reportedUser: r.reportedName
          ? {
              id: r.reportedUserId,
              name: r.reportedName,
              email: r.reportedEmail!,
              banned: !!r.reportedBanned,
              bannedUntil: r.reportedBannedUntil ? r.reportedBannedUntil.toISOString() : null,
            }
          : null,
      }));
    }

    return queues;
  });
}

export type ReportDetail = ReportListItem & {
  additionalDetails: string | null;
  moderatorNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  comments: Array<{
    id: number;
    body: string;
    createdAt: string;
    moderator: { id: string; name: string; email: string };
  }>;
};

export async function getReportDetail(
  admin: AdminSession,
  id: number,
): Promise<ReportDetail | null> {
  return executeAsAdmin(admin, async (tx) => {
    const row = await tx.query.reports.findFirst({
      where: eq(reports.id, id),
      with: {
        reporter: { columns: { id: true, name: true, email: true } },
        reportedUser: {
          columns: { id: true, name: true, email: true, banned: true, bannedUntil: true },
        },
        moderatorComments: {
          with: { moderator: { columns: { id: true, name: true, email: true } } },
          orderBy: (c, { asc }) => asc(c.createdAt),
        },
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      reporterId: row.reporterId,
      reportedUserId: row.reportedUserId,
      reportReason: row.reportReason,
      additionalDetails: row.additionalDetails,
      moderatorNotes: row.moderatorNotes,
      actionTaken: row.actionTaken,
      status: row.status,
      submittedAt: row.submittedAt.toISOString(),
      reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
      reviewedBy: row.reviewedBy,
      reporter: row.reporter
        ? { id: row.reporter.id, name: row.reporter.name, email: row.reporter.email }
        : null,
      reportedUser: row.reportedUser
        ? {
            id: row.reportedUser.id,
            name: row.reportedUser.name,
            email: row.reportedUser.email,
            banned: !!row.reportedUser.banned,
            bannedUntil: row.reportedUser.bannedUntil
              ? row.reportedUser.bannedUntil.toISOString()
              : null,
          }
        : null,
      comments: row.moderatorComments.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
        moderator: {
          id: c.moderator.id,
          name: c.moderator.name,
          email: c.moderator.email,
        },
      })),
    };
  });
}

export async function addReportComment(
  admin: AdminSession,
  reportId: number,
  body: string,
): Promise<void> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Comment body is required");
  if (trimmed.length > 4000) throw new Error("Comment is too long (max 4000 chars)");

  await executeAsAdmin(admin, async (tx) => {
    const exists = await tx.query.reports.findFirst({
      where: eq(reports.id, reportId),
      columns: { id: true },
    });
    if (!exists) throw new Error("Report not found");
    await tx.insert(reportModeratorComments).values({
      reportId,
      moderatorId: admin.userId,
      body: trimmed,
    });
  });
}

export type ReportActionType = "ban_permanent" | "ban_temporary" | "decline";

export type ReportActionInput = {
  reportId: number;
  action: ReportActionType;
  reason?: string;
  durationDays?: number;
  moderatorNotes?: string;
};

export async function applyReportAction(
  admin: AdminSession,
  input: ReportActionInput,
): Promise<void> {
  const reason = (input.reason ?? "").trim();
  const notes = (input.moderatorNotes ?? "").trim();
  const { action } = input;

  if (action !== "decline" && !reason) {
    throw new Error("A reason is required when banning a user");
  }
  if (action === "ban_temporary") {
    if (
      !input.durationDays ||
      !Number.isFinite(input.durationDays) ||
      input.durationDays <= 0 ||
      input.durationDays > 3650
    ) {
      throw new Error("Provide a valid ban duration in days (1-3650)");
    }
  }

  // The reporter can't ban themselves into oblivion — just a safety sanity check.
  const emailPayload = await executeAsAdmin(admin, async (tx) => {
    const report = await tx.query.reports.findFirst({
      where: eq(reports.id, input.reportId),
      with: {
        reportedUser: { columns: { id: true, name: true, email: true, role: true } },
      },
    });
    if (!report) throw new Error("Report not found");
    if (!report.reportedUser) throw new Error("Reported user record missing");
    if (report.reportedUser.id === admin.userId) {
      throw new Error("Cannot ban yourself");
    }
    if (report.reportedUser.role === "admin" && action !== "decline") {
      throw new Error("Cannot ban an admin via this surface — remove their role in the DB first");
    }

    const now = new Date();

    if (action === "decline") {
      await tx
        .update(reports)
        .set({
          status: "dismissed",
          actionTaken: "declined",
          reviewedBy: admin.userId,
          reviewedAt: now,
          moderatorNotes: notes || report.moderatorNotes,
          updatedAt: now,
        })
        .where(eq(reports.id, input.reportId));
      return null;
    }

    const bannedUntil =
      action === "ban_permanent"
        ? null
        : new Date(now.getTime() + (input.durationDays ?? 0) * 24 * 60 * 60 * 1000);

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
      .where(eq(users.id, report.reportedUserId));

    await tx
      .update(reports)
      .set({
        status: "resolved",
        actionTaken: action,
        reviewedBy: admin.userId,
        reviewedAt: now,
        moderatorNotes: notes || report.moderatorNotes,
        updatedAt: now,
      })
      .where(eq(reports.id, input.reportId));

    return {
      user: {
        email: report.reportedUser.email,
        name: report.reportedUser.name,
      },
      bannedUntil,
      reason,
    };
  });

  if (emailPayload) {
    await sendReportBanEmail({
      to: emailPayload.user.email,
      name: emailPayload.user.name,
      reason: emailPayload.reason,
      bannedUntil: emailPayload.bannedUntil,
    });
  }
}
