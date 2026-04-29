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
import { formatDateTime, formatRelative } from "@/lib/utils";
import { buildPublicProfileUrl } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Paperclip,
  ExternalLink,
  UserCog,
} from "lucide-react";
import {
  getPreviewHostname,
  isPdfPreviewTarget,
  toSafeHttpUrl,
  type SafePreviewTarget,
} from "@/lib/submission-preview";
import type {
  VerificationListItem,
  VerificationQueueMap,
} from "@/lib/verifications";

type StatusFilter = "pending" | "approved" | "rejected";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

function StatusBadge({ status }: { status: VerificationListItem["status"] }) {
  switch (status) {
    case "approved":
      return <Badge variant="success">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

type DetailState = {
  request: VerificationListItem & {
    rejectionReason: string | null;
    moderatorNotes: string | null;
    additionalInfo: string | null;
    reviewedBy: string | null;
    files: Array<{
      id: number;
      fileName: string;
      fileType: string;
      linkUrl: string | null;
      previewUrl: string | null;
      description: string | null;
    }>;
    comments: Array<{
      id: number;
      body: string;
      createdAt: string;
      moderator: { id: string; name: string; email: string };
    }>;
  };
};

export function VerificationsClient({
  initialStatus,
  initialQueues,
}: {
  initialStatus: StatusFilter;
  initialQueues: VerificationQueueMap;
}) {
  const [status, setStatus] = React.useState<StatusFilter>(initialStatus);
  const [queues, setQueues] = React.useState<VerificationQueueMap>(initialQueues);
  const [detail, setDetail] = React.useState<DetailState | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [action, setAction] = React.useState<"approve" | "deny" | null>(null);
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");
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
      const res = await fetch(`/api/verifications/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load verification");
      const data = await res.json();
      setDetail({ request: data });
      setReason("");
      setNotes("");
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
      const res = await fetch(`/api/verifications/${detail.request.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action,
          reason: reason || undefined,
          moderatorNotes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Action failed");
      }
      const nextStatus: StatusFilter = action === "approve" ? "approved" : "rejected";
      const requestId = detail.request.id;
      const updatedItem: VerificationListItem = {
        id: detail.request.id,
        userId: detail.request.userId,
        role: detail.request.role,
        status: nextStatus,
        verificationType: detail.request.verificationType,
        submittedAt: detail.request.submittedAt,
        reviewedAt: new Date().toISOString(),
        user: detail.request.user,
      };
      setQueues((current) => ({
        pending: current.pending.filter((item) => item.id !== requestId),
        approved:
          nextStatus === "approved"
            ? [updatedItem, ...current.approved.filter((item) => item.id !== requestId)]
            : current.approved.filter((item) => item.id !== requestId),
        rejected:
          nextStatus === "rejected"
            ? [updatedItem, ...current.rejected.filter((item) => item.id !== requestId)]
            : current.rejected.filter((item) => item.id !== requestId),
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
      const res = await fetch(`/api/verifications/${detail.request.id}/comments`, {
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
      await openDetail(detail.request.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const actionNeedsReason = action === "deny";
  const canSubmitAction = action === "approve" || (actionNeedsReason && reason.trim().length > 0);
  const canReview = detail?.request.status === "pending";
  const previewTargets = React.useMemo(() => {
    if (!detail) return [];

    return detail.request.files.reduce<SafePreviewTarget[]>((targets, file) => {
      const safeUrl = toSafeHttpUrl(file.linkUrl) ?? file.previewUrl;
      if (!safeUrl) return targets;

      targets.push({
        id: `verification-file-${file.id}`,
        label: file.fileName || getPreviewHostname(safeUrl),
        url: safeUrl,
        kind: isPdfPreviewTarget({
          fileName: file.fileName,
          fileType: file.fileType,
          url: safeUrl,
        })
          ? "pdf"
          : "link",
        description: file.description,
      });

      return targets;
    }, []);
  }, [detail]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Verifications</h1>
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
            <div className="grid size-12 place-items-center rounded-full bg-[color:var(--primary)]/10">
              <ShieldCheck className="size-6 text-[color:var(--primary)]" />
            </div>
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="text-xs text-[color:var(--muted-foreground)]">
              No verification requests in this queue.
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
                            {item.user?.name ?? "Unknown user"}
                          </p>
                          <StatusBadge status={item.status} />
                          <Badge variant="outline">{item.role}</Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-[color:var(--muted-foreground)] sm:text-sm">
                          {item.user?.email ?? "—"} · submitted {formatRelative(item.submittedAt)}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-[color:var(--muted-foreground)]" />
                    </button>
                    {item.user ? (
                      <div className="flex shrink-0 items-center gap-1 py-3 pr-3">
                        <Button asChild variant="ghost" size="icon" aria-label={`Open ${item.user.name} profile`}>
                          <a
                            href={buildPublicProfileUrl(item.user.name, item.user.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                        <Button asChild variant="ghost" size="icon" aria-label={`Manage ${item.user.name}`}>
                          <Link href={`/users?user=${encodeURIComponent(item.user.id)}`}>
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
                    {detail.request.user?.name ?? "Unknown user"}
                  </DialogTitle>
                  <StatusBadge status={detail.request.status} />
                  <Badge variant="outline">{detail.request.role}</Badge>
                </div>
                <DialogDescription asChild>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>
                      {detail.request.user?.email ?? "—"} · submitted{" "}
                      {formatDateTime(detail.request.submittedAt)}
                    </span>
                    {detail.request.user ? (
                      <>
                        <a
                          className="inline-flex items-center gap-1 text-[color:var(--primary)] hover:underline"
                          href={buildPublicProfileUrl(detail.request.user.name, detail.request.user.id)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="size-3.5" /> View profile
                        </a>
                        <Link
                          className="inline-flex items-center gap-1 text-[color:var(--primary)] hover:underline"
                          href={`/users?user=${encodeURIComponent(detail.request.user.id)}`}
                        >
                          <UserCog className="size-3.5" /> Manage user
                        </Link>
                      </>
                    ) : null}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="-mx-1 max-h-[65vh] space-y-4 overflow-y-auto px-1 pr-1 scrollbar-thin">
                {detail.request.additionalInfo ? (
                  <section className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      Submitted context
                    </h3>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm">
                      {detail.request.additionalInfo}
                    </p>
                  </section>
                ) : null}

                <section>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Paperclip className="size-4 text-[color:var(--muted-foreground)]" />
                    Attachments
                  </h3>
                  {detail.request.files.length === 0 ? (
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      No files submitted.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <SafeSubmissionPreview
                        targets={previewTargets}
                        emptyMessage="No safe HTTP(S) attachment links were submitted."
                      />
                      <ul className="space-y-2">
                        {detail.request.files.map((file) => (
                          <li
                            key={file.id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium">{file.fileName}</p>
                              {file.description ? (
                                <p className="truncate text-xs text-[color:var(--muted-foreground)]">
                                  {file.description}
                                </p>
                              ) : null}
                              {file.linkUrl ? (
                                <p className="truncate text-xs text-[color:var(--muted-foreground)]">
                                  {file.linkUrl}
                                </p>
                              ) : null}
                            </div>
                            {file.linkUrl ? (
                              <Badge variant="outline" className="shrink-0">
                                Previewed
                              </Badge>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                {detail.request.rejectionReason ? (
                  <section className="rounded-lg border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 p-3">
                    <h3 className="text-sm font-semibold text-[color:var(--warning)]">
                      Latest moderator reason
                    </h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {detail.request.rejectionReason}
                    </p>
                  </section>
                ) : null}

                <section>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <MessageSquare className="size-4 text-[color:var(--muted-foreground)]" />
                    Moderator comments
                  </h3>
                  {detail.request.comments.length === 0 ? (
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      No comments yet. Start the thread below.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {detail.request.comments.map((c) => (
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
                    <Label htmlFor="new-comment">Add a comment</Label>
                    <Textarea
                      id="new-comment"
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
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Button
                        variant={action === "approve" ? "success" : "outline"}
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setAction("approve")}
                      >
                        <CheckCircle2 className="size-4" /> Verify &amp; email
                      </Button>
                      <Button
                        variant={action === "deny" ? "destructive" : "outline"}
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setAction("deny")}
                      >
                        <XCircle className="size-4" /> Deny
                      </Button>
                    </div>
                    {action ? (
                      <div className="space-y-2">
                        {actionNeedsReason ? (
                          <div className="space-y-1.5">
                            <Label htmlFor="reason">
                              Reason for denial (shared with the user)
                            </Label>
                            <Textarea
                              id="reason"
                              required
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-[color:var(--muted-foreground)]">
                            Approving will flip the profile&apos;s verified flag and send the user
                            an approval email.
                          </p>
                        )}
                        <div className="space-y-1.5">
                          <Label htmlFor="notes">Internal moderator notes (optional)</Label>
                          <Input
                            id="notes"
                            placeholder="Only visible to other moderators"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : (
                  <section className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      This request has already been reviewed. Use User Management for future
                      verify or unverify changes.
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
                  disabled={!canReview || !action || !canSubmitAction || submitting}
                  onClick={submitAction}
                  className="sm:order-2"
                  variant={
                    action === "approve"
                      ? "success"
                      : action === "deny"
                        ? "destructive"
                        : "default"
                  }
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
