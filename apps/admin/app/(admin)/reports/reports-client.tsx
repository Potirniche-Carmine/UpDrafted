"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatDateTime, formatRelative } from "@/lib/utils";
import { Ban, Clock, MessageSquare, XCircle } from "lucide-react";
import type { ReportListItem } from "@/lib/reports";

type StatusFilter = "all" | "pending" | "under_review" | "resolved" | "dismissed";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "under_review", label: "Under review" },
  { id: "resolved", label: "Resolved" },
  { id: "dismissed", label: "Dismissed" },
  { id: "all", label: "All" },
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
  initialItems,
}: {
  initialStatus: StatusFilter;
  initialItems: ReportListItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<StatusFilter>(initialStatus);
  const [items, setItems] = React.useState(initialItems);
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

  const refreshList = React.useCallback(async (next: StatusFilter) => {
    const res = await fetch(`/api/reports?status=${next}`, { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { items: ReportListItem[] };
      setItems(data.items);
    }
  }, []);

  const onStatusChange = (next: StatusFilter) => {
    setStatus(next);
    const params = new URLSearchParams(searchParams?.toString());
    params.set("status", next);
    router.replace(`/reports?${params.toString()}`);
    void refreshList(next);
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
      closeDetail();
      await refreshList(status);
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

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--primary)]">
          Moderation
        </p>
        <h1 className="mt-1 text-3xl font-semibold">Reports</h1>
        <p className="mt-2 text-[color:var(--muted-foreground)]">
          Investigate user reports, coordinate with moderators, and take action.
        </p>
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
          <CardContent className="py-12 text-center text-[color:var(--muted-foreground)]">
            No reports in this queue.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-[color:var(--border)]">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">
                        {item.reportedUser?.name ?? "Unknown user"}
                      </p>
                      <StatusBadge status={item.status} />
                      {item.reportedUser?.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-[color:var(--muted-foreground)]">
                      Reason: {item.reportReason} · reported by{" "}
                      {item.reporter?.name ?? "—"} · {formatRelative(item.submittedAt)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openDetail(item.id)}>
                    Review
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={detail !== null} onOpenChange={(open) => (!open ? closeDetail() : null)}>
        <DialogContent className="max-w-3xl">
          {detail ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>
                    Report #{detail.report.id} ·{" "}
                    {detail.report.reportedUser?.name ?? "Unknown user"}
                  </DialogTitle>
                  <StatusBadge status={detail.report.status} />
                  {detail.report.reportedUser?.banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : null}
                </div>
                <DialogDescription>
                  {detail.report.reportedUser?.email ?? "—"} · submitted{" "}
                  {formatDateTime(detail.report.submittedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                <section className="rounded-md border border-[color:var(--border)] p-3">
                  <h3 className="text-sm font-semibold">Reporter</h3>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {detail.report.reporter?.name ?? "—"} ({detail.report.reporter?.email ?? "—"})
                  </p>
                </section>

                <section className="rounded-md border border-[color:var(--border)] p-3">
                  <h3 className="text-sm font-semibold">Report reason</h3>
                  <p className="text-sm">{detail.report.reportReason}</p>
                  {detail.report.additionalDetails ? (
                    <>
                      <h4 className="mt-3 text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                        Additional details
                      </h4>
                      <p className="mt-1 whitespace-pre-wrap text-sm">
                        {detail.report.additionalDetails}
                      </p>
                    </>
                  ) : null}
                </section>

                {detail.report.actionTaken ? (
                  <section className="rounded-md border border-[color:var(--border)] p-3">
                    <h3 className="text-sm font-semibold">Previous action</h3>
                    <p className="text-sm">
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
                    <MessageSquare className="size-4" /> Moderator comments
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
                          className="rounded-md border border-[color:var(--border)] bg-[color:var(--muted)] p-3"
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

                <section className="space-y-3 rounded-md border border-[color:var(--border)] p-3">
                  <h3 className="text-sm font-semibold">Decision</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={action === "ban_permanent" ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setAction("ban_permanent")}
                    >
                      <Ban className="size-4" /> Ban permanently
                    </Button>
                    <Button
                      variant={action === "ban_temporary" ? "warning" : "outline"}
                      size="sm"
                      onClick={() => setAction("ban_temporary")}
                    >
                      <Clock className="size-4" /> Ban for X days
                    </Button>
                    <Button
                      variant={action === "decline" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setAction("decline")}
                    >
                      <XCircle className="size-4" /> Decline report
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

                {errorMsg ? (
                  <p className="rounded-md border border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/10 px-3 py-2 text-sm text-[color:var(--destructive)]">
                    {errorMsg}
                  </p>
                ) : null}
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={closeDetail}>
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
                  disabled={!action || !canSubmit || submitting}
                  onClick={submitAction}
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
