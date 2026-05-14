import {
  verificationRequests,
  verificationModeratorComments,
  users,
  athleteProfiles,
  coachProfiles,
  recruitingProfiles,
} from "@updrafted/db";
import { and, desc, eq } from "drizzle-orm";
import { executeAsAdmin } from "./db-access";
import type { AdminSession } from "./admin-guard";
import {
  sendVerificationApprovedEmail,
  sendVerificationDeniedEmail,
} from "./email";

export type VerificationStatusFilter =
  | "pending"
  | "approved"
  | "rejected";

export type VerificationTypeFilter = "all" | "general" | "transfer_portal";

const VERIFICATION_STATUS_FILTERS: readonly VerificationStatusFilter[] = [
  "pending",
  "approved",
  "rejected",
];

export type VerificationListItem = {
  id: number;
  userId: string;
  role: "athlete" | "coach" | "recruiter" | "admin";
  status: "pending" | "approved" | "rejected";
  verificationType: string;
  submittedAt: string;
  reviewedAt: string | null;
  user: { id: string; name: string; email: string } | null;
};

export type VerificationQueueMap = Record<VerificationStatusFilter, VerificationListItem[]>;

export async function listVerifications(
  admin: AdminSession,
  statusFilter: VerificationStatusFilter = "pending",
  typeFilter: VerificationTypeFilter = "all",
): Promise<VerificationListItem[]> {
  return executeAsAdmin(admin, async (tx) => {
    const where = typeFilter === "all"
      ? eq(verificationRequests.status, statusFilter)
      : and(
          eq(verificationRequests.status, statusFilter),
          eq(verificationRequests.verificationType, typeFilter),
        );

    const rows = await tx
      .select({
        id: verificationRequests.id,
        userId: verificationRequests.userId,
        role: verificationRequests.role,
        status: verificationRequests.status,
        verificationType: verificationRequests.verificationType,
        submittedAt: verificationRequests.submittedAt,
        reviewedAt: verificationRequests.reviewedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(verificationRequests)
      .leftJoin(users, eq(users.id, verificationRequests.userId))
      .where(where)
      .orderBy(desc(verificationRequests.submittedAt))
      .limit(200);

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      role: r.role,
      status: r.status,
      verificationType: r.verificationType,
      submittedAt: r.submittedAt.toISOString(),
      reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
      user: r.userName ? { id: r.userId, name: r.userName, email: r.userEmail! } : null,
    }));
  });
}

export async function listVerificationQueues(
  admin: AdminSession,
  typeFilter: VerificationTypeFilter = "all",
): Promise<VerificationQueueMap> {
  return executeAsAdmin(admin, async (tx) => {
    const queues: VerificationQueueMap = {
      pending: [],
      approved: [],
      rejected: [],
    };

    for (const statusFilter of VERIFICATION_STATUS_FILTERS) {
      const where = typeFilter === "all"
        ? eq(verificationRequests.status, statusFilter)
        : and(
            eq(verificationRequests.status, statusFilter),
            eq(verificationRequests.verificationType, typeFilter),
          );

      const rows = await tx
        .select({
          id: verificationRequests.id,
          userId: verificationRequests.userId,
          role: verificationRequests.role,
          status: verificationRequests.status,
          verificationType: verificationRequests.verificationType,
          submittedAt: verificationRequests.submittedAt,
          reviewedAt: verificationRequests.reviewedAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(verificationRequests)
        .leftJoin(users, eq(users.id, verificationRequests.userId))
        .where(where)
        .orderBy(desc(verificationRequests.submittedAt))
        .limit(200);

      queues[statusFilter] = rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        role: r.role,
        status: r.status,
        verificationType: r.verificationType,
        submittedAt: r.submittedAt.toISOString(),
        reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
        user: r.userName ? { id: r.userId, name: r.userName, email: r.userEmail! } : null,
      }));
    }

    return queues;
  });
}

export type VerificationDetail = VerificationListItem & {
  rejectionReason: string | null;
  moderatorNotes: string | null;
  additionalInfo: string | null;
  reviewedBy: string | null;
  reviewedByUser: { id: string; name: string; email: string } | null;
  files: Array<{
    id: number;
    fileName: string;
    fileType: string;
    linkUrl: string | null;
    previewUrl: string | null;
    description: string | null;
    createdAt: string;
  }>;
  comments: Array<{
    id: number;
    body: string;
    createdAt: string;
    moderator: { id: string; name: string; email: string };
  }>;
};

export async function getVerificationDetail(
  admin: AdminSession,
  id: number,
): Promise<VerificationDetail | null> {
  return executeAsAdmin(admin, async (tx) => {
    const row = await tx.query.verificationRequests.findFirst({
      where: eq(verificationRequests.id, id),
      with: {
        user: { columns: { id: true, name: true, email: true } },
        files: true,
        moderatorComments: {
          with: { moderator: { columns: { id: true, name: true, email: true } } },
          orderBy: (c, { asc }) => asc(c.createdAt),
        },
      },
    });

    if (!row) return null;

    const reviewedByUser = row.reviewedBy
      ? (await tx.query.users.findFirst({
          where: eq(users.id, row.reviewedBy),
          columns: { id: true, name: true, email: true },
        })) ?? null
      : null;

    return {
      id: row.id,
      userId: row.userId,
      role: row.role,
      status: row.status,
      verificationType: row.verificationType,
      submittedAt: row.submittedAt.toISOString(),
      reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
      rejectionReason: row.rejectionReason,
      moderatorNotes: row.moderatorNotes,
      additionalInfo: row.additionalInfo,
      reviewedBy: row.reviewedBy,
      reviewedByUser,
      user: row.user ? { id: row.user.id, name: row.user.name, email: row.user.email } : null,
      files: row.files.map((f) => ({
        id: f.id,
        fileName: f.fileName,
        fileType: f.fileType,
        linkUrl: f.linkUrl ?? f.fileUrl ?? null,
        previewUrl: f.r2Key ? `/api/verifications/${row.id}/files/${f.id}/preview` : null,
        description: f.description,
        createdAt: f.createdAt.toISOString(),
      })),
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

export async function addVerificationComment(
  admin: AdminSession,
  verificationRequestId: number,
  body: string,
): Promise<void> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Comment body is required");
  if (trimmed.length > 4000) throw new Error("Comment is too long (max 4000 chars)");

  await executeAsAdmin(admin, async (tx) => {
    const exists = await tx.query.verificationRequests.findFirst({
      where: eq(verificationRequests.id, verificationRequestId),
      columns: { id: true },
    });
    if (!exists) throw new Error("Verification request not found");

    await tx.insert(verificationModeratorComments).values({
      verificationRequestId,
      moderatorId: admin.userId,
      body: trimmed,
    });
  });
}

export type VerificationActionType = "approve" | "deny";

export type VerificationActionInput = {
  requestId: number;
  action: VerificationActionType;
  reason?: string;
  moderatorNotes?: string;
};

const VERIFIABLE_ROLES = ["athlete", "coach", "recruiter"] as const;
type VerifiableRole = (typeof VERIFIABLE_ROLES)[number];

export async function applyVerificationAction(
  admin: AdminSession,
  input: VerificationActionInput,
): Promise<void> {
  const { requestId, action } = input;
  const reason = (input.reason ?? "").trim();
  const notes = (input.moderatorNotes ?? "").trim();

  if (action === "deny" && !reason) {
    throw new Error("A reason is required for this action");
  }

  const emailPayload = await executeAsAdmin(admin, async (tx) => {
    const request = await tx.query.verificationRequests.findFirst({
      where: eq(verificationRequests.id, requestId),
      with: { user: { columns: { id: true, name: true, email: true } } },
    });
    if (!request) throw new Error("Verification request not found");
    if (!request.user) throw new Error("Verification user record missing");
    if (request.status !== "pending") {
      throw new Error("This verification request has already been reviewed");
    }

    const now = new Date();

    const commonUpdate = {
      reviewedAt: now,
      reviewedBy: admin.userId,
      updatedAt: now,
      moderatorNotes: notes ? notes : request.moderatorNotes,
    };

    if (action === "approve") {
      await tx
        .update(verificationRequests)
        .set({
          ...commonUpdate,
          status: "approved",
          rejectionReason: null,
        })
        .where(eq(verificationRequests.id, requestId));

      const role = request.role as VerifiableRole;
      if (request.verificationType === "general" && (VERIFIABLE_ROLES as readonly string[]).includes(role)) {
        const profileTable =
          role === "athlete"
            ? athleteProfiles
            : role === "coach"
              ? coachProfiles
              : recruitingProfiles;
        await tx
          .update(profileTable)
          .set({ isVerified: true, updatedAt: now })
          .where(
            and(eq(profileTable.userId, request.userId), eq(profileTable.isDemoProfile, false)),
          );
      }
    } else {
      await tx
        .update(verificationRequests)
        .set({
          ...commonUpdate,
          status: "rejected",
          rejectionReason: reason,
        })
        .where(eq(verificationRequests.id, requestId));
    }

    await tx.insert(verificationModeratorComments).values({
      verificationRequestId: requestId,
      moderatorId: admin.userId,
      body:
        action === "approve"
          ? `${admin.name} approved this verification request.`
          : `${admin.name} denied this verification request.${reason ? ` Reason: ${reason}` : ""}`,
    });

    return { user: request.user };
  });

  // Emails happen after the DB transaction commits so that a failed email
  // never leaves the moderator wondering whether their decision was saved.
  const { user } = emailPayload;
  if (action === "approve") {
    await sendVerificationApprovedEmail({ to: user.email, name: user.name });
  } else {
    await sendVerificationDeniedEmail({ to: user.email, name: user.name, reason });
  }
}
