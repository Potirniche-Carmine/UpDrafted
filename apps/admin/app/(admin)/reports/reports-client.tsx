"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafeSubmissionPreview } from "@/components/safe-submission-preview";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildPublicProfileUrl, formatDateTime, formatRelative } from "@/lib/utils";
import {
  Ban,
  Clock,
  MessageSquare,
  XCircle,
  Flag,
  ChevronRight,
  ExternalLink,
  UserCog,
} from "lucide-react";
import { extractSafePreviewTargetsFromText } from "@/lib/submission-preview";
import type { ReportListItem, ReportQueueMap } from "@/lib/reports";

type StatusFilter = "pending" | "under_review" | "resolved" | "dismissed";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "under_review", label: "Under review" },
  { id: "resolved", label: "Resolved" },
  { id: "dismissed", label: "Dismissed" },
];

function StatusBadge({ status }: { status: ReportListItem["status"] }) {
  switch (status) {
    case "resolved":
      return <Badge variant="success">Resolved</Badge>;
    case "dismissed":
      return <Badge variant="secondary">Dismissed</Badge>;
    case "under_review":
      return <Badge variant="warning">Under review</Badge>;
    default:
      return <Badge variant="destructive">Pending</Badge>;
  }
}

type DetailState = {
  report: ReportListItem & {
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
};

export function ReportsClient({
  initialStatus,
  initialQueues,
}: {
  initialStatus: StatusFilter;
  initialQueues: ReportQueueMap;
}) {
  const [status, setStatus] = React.useState<StatusFilter>(initialStatus);
  const [queues, setQueues] = React.useState<ReportQueueMap>(initialQueues);
  const [detail, setDetail] = React.useState<DetailState | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [action, setAction] = React.useState<"ban_permanent" | "ban_temporary" | "decline" | null>(
    null,
  );
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [durationDays, setDurationDays] = React.useState(7);
  const [newComment, setNewComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const items = queues[status];

  const updateStatusUrl = React.useCallback((next: StatusFilter) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("status", next);
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const onStatusChange = (next: StatusFilter) => {
    setStatus(next);
    updateStatusUrl(next);
  };

  const openDetail = async (id: number) => {
    setLoadingDetail(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/reports/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load report");
      const data = await res.json();
      setDetail({ report: data });
      setReason("");
      setNotes("");
      setDurationDays(7);
      setNewComment("");
      setAction(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setDetail(null);
    setAction(null);
  };

  const submitAction = async () => {
    if (!detail || !action) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/reports/${detail.report.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action,
          reason: action === "decline" ? undefined : reason,
          durationDays: action === "ban_temporary" ? durationDays : undefined,
          moderatorNotes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Action failed");
      }
      const nextStatus: StatusFilter = action === "decline" ? "dismissed" : "resolved";
      const requestId = detail.report.id;
      const bannedUntil =
        action === "ban_temporary"
          ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
          : action === "ban_permanent"
            ? null
            : detail.report.reportedUser?.bannedUntil ?? null;
      const updatedItem: ReportListItem = {
        id: detail.report.id,
        reporterId: detail.report.reporterId,
        reportedUserId: detail.report.reportedUserId,
        reportReason: detail.report.reportReason,
        status: nextStatus,
        submittedAt: detail.report.submittedAt,
        actionTaken:
          action === "decline"
            ? "declined"
            : action === "ban_temporary"
              ? "ban_temporary"
              : "ban_permanent",
        reporter: detail.report.reporter,
        reportedUser: detail.report.reportedUser
          ? {
              ...detail.report.reportedUser,
              banned: action !== "decline" || detail.report.reportedUser.banned,
              bannedUntil,
            }
          : null,
      };
      setQueues((current) => ({
        pending: current.pending.filter((item) => item.id !== requestId),
        under_review: current.under_review.filter((item) => item.id !== requestId),
        resolved:
          nextStatus === "resolved"
            ? [updatedItem, ...current.resolved.filter((item) => item.id !== requestId)]
            : current.resolved.filter((item) => item.id !== requestId),
        dismissed:
          nextStatus === "dismissed"
            ? [updatedItem, ...current.dismissed.filter((item) => item.id !== requestId)]
            : current.dismissed.filter((item) => item.id !== requestId),
      }));
      closeDetail();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const submitComment = async () => {
    if (!detail || !newComment.trim()) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/reports/${detail.report.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: newComment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to post comment");
      }
      setNewComment("");
      await openDetail(detail.report.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    action === "decline" ||
    (action === "ban_permanent" && reason.trim().length > 0) ||
    (action === "ban_temporary" && reason.trim().length > 0 && durationDays > 0);
  const canReview =
    detail?.report.status === "pending" || detail?.report.status === "under_review";
  const previewTargets = React.useMemo(() => {
    if (!detail) return [];
    return extractSafePreviewTargetsFromText(
      `${detail.report.reportReason}\n${detail.report.additionalDetails ?? ""}`,
    );
  }, [detail]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Reports</h1>
      </header>

      <Tabs value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
        <TabsList>
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-[color:var(--destructive)]/10">
              <Flag className="size-6 text-[color:var(--destructive)]" />
            </div>
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="text-xs text-[color:var(--muted-foreground)]">
              No reports in this queue.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ul className="divide-y divide-[color:var(--border)]">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="transition-colors hover:bg-[color:var(--accent)] focus-within:bg-[color:var(--accent)]"
                >
                  <div className="flex items-stretch gap-2">
                    <button
                      type="button"
                      onClick={() => openDetail(item.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left outline-none"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium">
                            {item.reportedUser?.name ?? "Unknown user"}
                          </p>
                          <StatusBadge status={item.status} />
                          {item.reportedUser?.banned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 truncate text-xs text-[color:var(--muted-foreground)] sm:text-sm">
                          {item.reportReason} · by {item.reporter?.name ?? "—"} ·{" "}
                          {formatRelative(item.submittedAt)}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-[color:var(--muted-foreground)]" />
                    </button>
                    {item.reportedUser ? (
                      <div className="flex shrink-0 items-center gap-1 py-3 pr-3">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label={`Open ${item.reportedUser.name} profile`}
                        >
                          <a
                            href={buildPublicProfileUrl(item.reportedUser.name, item.reportedUser.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label={`Manage ${item.reportedUser.name}`}
                        >
                          <Link href={`/users?user=${encodeURIComponent(item.reportedUser.id)}`}>
                            <UserCog className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={detail !== null} onOpenChange={(open) => (!open ? closeDetail() : null)}>
        <DialogContent className="sm:max-w-3xl">
          {detail ? (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle>
                    Report #{detail.report.id} ·{" "}
                    {detail.report.reportedUser?.name ?? "Unknown user"}
                  </DialogTitle>
                  <StatusBadge status={detail.report.status} />
                  {detail.report.reportedUser?.banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : null}
                </div>
                <DialogDescription asChild>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>
                      {detail.report.reportedUser?.email ?? "—"} · submitted{" "}
                      {formatDateTime(detail.report.submittedAt)}
                    </span>
                    {detail.report.reportedUser ? (
                      <>
                        <a
                          className="inline-flex items-center gap-1 text-[color:var(--primary)] hover:underline"
                          href={buildPublicProfileUrl(
                            detail.report.reportedUser.name,
                            detail.report.reportedUser.id,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="size-3.5" /> View profile
                        </a>
                        <Link
                          className="inline-flex items-center gap-1 text-[color:var(--primary)] hover:underline"
                          href={`/users?user=${encodeURIComponent(detail.report.reportedUser.id)}`}
                        >
                          <UserCog className="size-3.5" /> Manage user
                        </Link>
                      </>
                    ) : null}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="-mx-1 max-h-[65vh] space-y-4 overflow-y-auto px-1 pr-1 scrollbar-thin">
                <section className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Reporter
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-medium">{detail.report.reporter?.name ?? "—"}</span>
                    <span className="text-[color:var(--muted-foreground)]">
                      ({detail.report.reporter?.email ?? "—"})
                    </span>
                    {detail.report.reporter ? (
                      <>
                        <a
                          className="inline-flex items-center gap-1 text-[color:var(--primary)] hover:underline"
                          href={buildPublicProfileUrl(
                            detail.report.reporter.name,
                            detail.report.reporter.id,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="size-3.5" /> View profile
                        </a>
                        <Link
                          className="inline-flex items-center gap-1 text-[color:var(--primary)] hover:underline"
                          href={`/users?user=${encodeURIComponent(detail.report.reporter.id)}`}
                        >
                          <UserCog className="size-3.5" /> Manage user
                        </Link>
                      </>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Report reason
                  </h3>
                  <p className="mt-1 text-sm font-medium">{detail.report.reportReason}</p>
                  {detail.report.additionalDetails ? (
                    <>
                      <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                        Additional details
                      </h4>
                      <p className="mt-1 whitespace-pre-wrap text-sm">
                        {detail.report.additionalDetails}
                      </p>
                    </>
                  ) : null}
                </section>

                {previewTargets.length > 0 ? (
                  <SafeSubmissionPreview targets={previewTargets} />
                ) : null}

                {detail.report.actionTaken ? (
                  <section className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      Previous action
                    </h3>
                    <p className="mt-1 text-sm">
                      {detail.report.actionTaken} — reviewed{" "}
                      {formatDateTime(detail.report.reviewedAt)}
                    </p>
                    {detail.report.reportedUser?.banned ? (
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        Ban expires:{" "}
                        {detail.report.reportedUser.bannedUntil
                          ? formatDateTime(detail.report.reportedUser.bannedUntil)
                          : "never (permanent)"}
                      </p>
                    ) : null}
                  </section>
                ) : null}

                <section>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <MessageSquare className="size-4 text-[color:var(--muted-foreground)]" />
                    Moderator comments
                  </h3>
                  {detail.report.comments.length === 0 ? (
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      No comments yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {detail.report.comments.map((c) => (
                        <li
                          key={c.id}
                          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/40 p-3"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs text-[color:var(--muted-foreground)]">
                            <span className="font-semibold text-[color:var(--foreground)]">
                              {c.moderator.name}
                            </span>
                            <time dateTime={c.createdAt}>{formatDateTime(c.createdAt)}</time>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap text-sm">{c.body}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 space-y-2">
                    <Label htmlFor="rmc-new-comment">Add a comment</Label>
                    <Textarea
                      id="rmc-new-comment"
                      placeholder="Leave a note for other moderators…"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={submitting || !newComment.trim()}
                        onClick={submitComment}
                      >
                        Post comment
                      </Button>
                    </div>
                  </div>
                </section>

                {canReview ? (
                  <section className="space-y-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                    <h3 className="text-sm font-semibold">Decision</h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <Button
                        variant={action === "ban_permanent" ? "destructive" : "outline"}
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setAction("ban_permanent")}
                      >
                        <Ban className="size-4" /> Ban permanently
                      </Button>
                      <Button
                        variant={action === "ban_temporary" ? "warning" : "outline"}
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setAction("ban_temporary")}
                      >
                        <Clock className="size-4" /> Ban for X days
                      </Button>
                      <Button
                        variant={action === "decline" ? "secondary" : "outline"}
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setAction("decline")}
                      >
                        <XCircle className="size-4" /> Decline
                      </Button>
                    </div>

                    {action === "ban_temporary" ? (
                      <div className="flex items-center gap-2">
                        <Label htmlFor="days" className="shrink-0">
                          Duration (days)
                        </Label>
                        <Input
                          id="days"
                          type="number"
                          min={1}
                          max={3650}
                          inputMode="numeric"
                          className="w-28"
                          value={durationDays}
                          onChange={(e) => setDurationDays(Number.parseInt(e.target.value, 10) || 0)}
                        />
                      </div>
                    ) : null}

                    {action && action !== "decline" ? (
                      <div className="space-y-1.5">
                        <Label htmlFor="report-reason">Reason (shared with the user)</Label>
                        <Textarea
                          id="report-reason"
                          required
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </div>
                    ) : null}

                    {action ? (
                      <div className="space-y-1.5">
                        <Label htmlFor="report-notes">Internal moderator notes (optional)</Label>
                        <Input
                          id="report-notes"
                          placeholder="Only visible to other moderators"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    ) : null}
                  </section>
                ) : (
                  <section className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      This report has already been reviewed. Use User Management for future ban,
                      unban, verify, or unverify changes.
                    </p>
                  </section>
                )}

                {errorMsg ? (
                  <p className="rounded-lg border border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/10 px-3 py-2 text-sm text-[color:var(--destructive)]">
                    {errorMsg}
                  </p>
                ) : null}
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={closeDetail} className="sm:order-1">
                  Close
                </Button>
                <Button
                  variant={
                    action === "ban_permanent"
                      ? "destructive"
                      : action === "ban_temporary"
                        ? "warning"
                        : action === "decline"
                          ? "secondary"
                          : "default"
                  }
                  disabled={!canReview || !action || !canSubmit || submitting}
                  onClick={submitAction}
                  className="sm:order-2"
                >
                  {submitting ? "Submitting…" : "Apply decision"}
                </Button>
              </DialogFooter>
            </>
          ) : loadingDetail ? (
            <p className="py-10 text-center text-sm text-[color:var(--muted-foreground)]">
              Loading…
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
