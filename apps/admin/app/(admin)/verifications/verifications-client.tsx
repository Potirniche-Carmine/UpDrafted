"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
import { CheckCircle2, Info, XCircle, MessageSquare, ExternalLink } from "lucide-react";
import type { VerificationListItem } from "@/lib/verifications";

type StatusFilter = "all" | "pending" | "under_review" | "approved" | "rejected";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "under_review", label: "Awaiting info" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

function StatusBadge({ status }: { status: VerificationListItem["status"] }) {
  switch (status) {
    case "approved":
      return <Badge variant="success">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "under_review":
      return <Badge variant="warning">Needs info</Badge>;
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
  initialItems,
}: {
  initialStatus: StatusFilter;
  initialItems: VerificationListItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<StatusFilter>(initialStatus);
  const [items, setItems] = React.useState(initialItems);
  const [detail, setDetail] = React.useState<DetailState | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [action, setAction] = React.useState<"approve" | "needs_info" | "deny" | null>(null);
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [newComment, setNewComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const refreshList = React.useCallback(async (next: StatusFilter) => {
    const res = await fetch(`/api/verifications?status=${next}`, { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { items: VerificationListItem[] };
      setItems(data.items);
    }
  }, []);

  const onStatusChange = (next: StatusFilter) => {
    setStatus(next);
    const params = new URLSearchParams(searchParams?.toString());
    params.set("status", next);
    router.replace(`/verifications?${params.toString()}`);
    void refreshList(next);
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

  const actionNeedsReason = action === "needs_info" || action === "deny";
  const canSubmitAction = action === "approve" || (actionNeedsReason && reason.trim().length > 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--primary)]">
          Moderation
        </p>
        <h1 className="mt-1 text-3xl font-semibold">Verifications</h1>
        <p className="mt-2 text-[color:var(--muted-foreground)]">
          Review, discuss, and decide on verification requests.
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
            No verification requests in this queue.
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
                        {item.user?.name ?? "Unknown user"}
                      </p>
                      <StatusBadge status={item.status} />
                      <Badge variant="outline">{item.role}</Badge>
                    </div>
                    <p className="truncate text-sm text-[color:var(--muted-foreground)]">
                      {item.user?.email ?? "—"} · submitted {formatRelative(item.submittedAt)}
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
                    {detail.request.user?.name ?? "Unknown user"}
                  </DialogTitle>
                  <StatusBadge status={detail.request.status} />
                  <Badge variant="outline">{detail.request.role}</Badge>
                </div>
                <DialogDescription>
                  {detail.request.user?.email ?? "—"} · submitted{" "}
                  {formatDateTime(detail.request.submittedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                {detail.request.additionalInfo ? (
                  <section>
                    <h3 className="text-sm font-semibold">Submitted context</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[color:var(--muted-foreground)]">
                      {detail.request.additionalInfo}
                    </p>
                  </section>
                ) : null}

                <section>
                  <h3 className="text-sm font-semibold">Attachments</h3>
                  {detail.request.files.length === 0 ? (
                    <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                      No files submitted.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {detail.request.files.map((file) => (
                        <li
                          key={file.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-[color:var(--border)] p-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">{file.fileName}</p>
                            {file.description ? (
                              <p className="text-xs text-[color:var(--muted-foreground)]">
                                {file.description}
                              </p>
                            ) : null}
                          </div>
                          {file.linkUrl ? (
                            <a
                              href={file.linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[color:var(--primary)] hover:underline"
                            >
                              Open <ExternalLink className="size-3" />
                            </a>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {detail.request.rejectionReason ? (
                  <section className="rounded-md border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/5 p-3">
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
                    <MessageSquare className="size-4" /> Moderator comments
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

                <section className="space-y-3 rounded-md border border-[color:var(--border)] p-3">
                  <h3 className="text-sm font-semibold">Decision</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={action === "approve" ? "success" : "outline"}
                      size="sm"
                      onClick={() => setAction("approve")}
                    >
                      <CheckCircle2 className="size-4" /> Verify &amp; email
                    </Button>
                    <Button
                      variant={action === "needs_info" ? "warning" : "outline"}
                      size="sm"
                      onClick={() => setAction("needs_info")}
                    >
                      <Info className="size-4" /> Needs more info
                    </Button>
                    <Button
                      variant={action === "deny" ? "destructive" : "outline"}
                      size="sm"
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
                            {action === "needs_info"
                              ? "What extra info do we need from the user?"
                              : "Reason for denial (shared with the user)"}
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
                          Approving will flip the profile&apos;s verified flag and send the user an
                          approval email.
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
                  disabled={!action || !canSubmitAction || submitting}
                  onClick={submitAction}
                  variant={
                    action === "approve"
                      ? "success"
                      : action === "deny"
                        ? "destructive"
                        : action === "needs_info"
                          ? "warning"
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
