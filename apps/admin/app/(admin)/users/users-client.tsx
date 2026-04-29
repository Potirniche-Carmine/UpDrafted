"use client";

import * as React from "react";
import Link from "next/link";
import {
  Ban,
  ExternalLink,
  Search,
  ShieldCheck,
  ShieldX,
  Unlock,
  UserCog,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatRelative } from "@/lib/utils";
import type { ManagedUserDetail, ManagedUserListItem } from "@/lib/users";

function RoleBadge({ role }: { role: ManagedUserListItem["role"] }) {
  return <Badge variant="outline">{role ?? "onboarding"}</Badge>;
}

function UserBadges({ user }: { user: Pick<ManagedUserListItem, "banned" | "verified"> }) {
  return (
    <>
      {user.verified ? <Badge variant="success">Verified</Badge> : null}
      {user.banned ? <Badge variant="destructive">Banned</Badge> : null}
    </>
  );
}

export function UsersClient({
  initialQuery,
  initialUsers,
  initialSelectedUserId,
}: {
  initialQuery: string;
  initialUsers: ManagedUserListItem[];
  initialSelectedUserId: string | null;
}) {
  const [query, setQuery] = React.useState(initialQuery);
  const [users, setUsers] = React.useState(initialUsers);
  const [detail, setDetail] = React.useState<ManagedUserDetail | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [banReason, setBanReason] = React.useState("");
  const [durationDays, setDurationDays] = React.useState(7);

  const openDetail = React.useCallback(async (userId: string) => {
    setLoadingDetail(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to load user");
      }
      const data = (await res.json()) as ManagedUserDetail;
      setDetail(data);
      setBanReason(data.banReason ?? "");
      setDurationDays(7);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("user", userId);
        window.history.replaceState(window.history.state, "", url);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  React.useEffect(() => {
    if (initialSelectedUserId) void openDetail(initialSelectedUserId);
  }, [initialSelectedUserId, openDetail]);

  const closeDetail = () => {
    setDetail(null);
    setErrorMsg(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("user");
      window.history.replaceState(window.history.state, "", url);
    }
  };

  const runSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/users?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to search users");
      const data = (await res.json()) as { users: ManagedUserListItem[] };
      setUsers(data.users);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (query.trim()) url.searchParams.set("q", query.trim());
        else url.searchParams.delete("q");
        window.history.replaceState(window.history.state, "", url);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const submitAction = async (
    payload:
      | { action: "verify" | "unverify" | "unban" }
      | { action: "ban_permanent"; reason: string }
      | { action: "ban_temporary"; reason: string; durationDays: number },
  ) => {
    if (!detail) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(detail.id)}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Action failed");
      }
      const updated = (await res.json()) as ManagedUserDetail;
      setDetail(updated);
      setUsers((current) =>
        current.map((user) =>
          user.id === updated.id
            ? {
                ...user,
                banned: updated.banned,
                bannedUntil: updated.bannedUntil,
                verified: updated.verified,
                profileSummary: updated.profileSummary,
              }
            : user,
        ),
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const canBan = banReason.trim().length > 0;
  const canVerify = detail?.role === "athlete" || detail?.role === "coach" || detail?.role === "recruiter";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">User Management</h1>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            Search users, inspect linked activity, and apply account-level moderation.
          </p>
        </div>
        <form onSubmit={runSearch} className="flex w-full gap-2 sm:max-w-md">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, or user ID"
          />
          <Button type="submit" disabled={loading} aria-label="Search users">
            <Search className="size-4" />
          </Button>
        </form>
      </header>

      {errorMsg ? (
        <p className="rounded-lg border border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/10 px-3 py-2 text-sm text-[color:var(--destructive)]">
          {errorMsg}
        </p>
      ) : null}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-[color:var(--primary)]/10">
                <UserCog className="size-6 text-[color:var(--primary)]" />
              </div>
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                Try searching by a name, email, or exact user ID.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[color:var(--border)]">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="transition-colors hover:bg-[color:var(--accent)] focus-within:bg-[color:var(--accent)]"
                >
                  <div className="flex items-stretch gap-2">
                    <button
                      type="button"
                      onClick={() => openDetail(user.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left outline-none"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium">{user.name}</p>
                          <RoleBadge role={user.role} />
                          <UserBadges user={user} />
                        </div>
                        <p className="mt-1 truncate text-xs text-[color:var(--muted-foreground)] sm:text-sm">
                          {user.email} · joined {formatRelative(user.createdAt)}
                        </p>
                        {user.profileSummary ? (
                          <p className="mt-1 truncate text-xs text-[color:var(--muted-foreground)]">
                            {user.profileSummary}
                          </p>
                        ) : null}
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-1 py-3 pr-3">
                      <Button asChild variant="ghost" size="icon" aria-label={`Open ${user.name} profile`}>
                        <a href={user.profileUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="size-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetail(user.id)}
                        aria-label={`Manage ${user.name}`}
                      >
                        <UserCog className="size-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={detail !== null || loadingDetail} onOpenChange={(open) => (!open ? closeDetail() : null)}>
        <DialogContent className="sm:max-w-4xl">
          {detail ? (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle>{detail.name}</DialogTitle>
                  <RoleBadge role={detail.role} />
                  <UserBadges user={detail} />
                </div>
                <DialogDescription>
                  {detail.email} · joined {formatDateTime(detail.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="-mx-1 max-h-[68vh] space-y-4 overflow-y-auto px-1 pr-1 scrollbar-thin">
                <section className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                    <p className="text-xs uppercase text-[color:var(--muted-foreground)]">Connections</p>
                    <p className="mt-1 text-lg font-semibold">{detail.connectionsCount}</p>
                  </div>
                  <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                    <p className="text-xs uppercase text-[color:var(--muted-foreground)]">Subscription</p>
                    <p className="mt-1 truncate text-sm font-semibold">
                      {detail.subscription
                        ? `${detail.subscription.tier} · ${detail.subscription.status}`
                        : "None"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                    <p className="text-xs uppercase text-[color:var(--muted-foreground)]">Email</p>
                    <p className="mt-1 text-sm font-semibold">
                      {detail.emailVerified ? "Verified" : "Not verified"}
                    </p>
                  </div>
                </section>

                <section className="space-y-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">Profile</h3>
                    <Button asChild variant="outline" size="sm">
                      <a href={detail.profileUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" /> View on UpDrafted
                      </a>
                    </Button>
                  </div>
                  {detail.profiles.length === 0 ? (
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      No profile has been created yet.
                    </p>
                  ) : (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {detail.profiles.map((profile) => (
                        <li
                          key={`${profile.type}-${profile.fullName}`}
                          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card)]/50 p-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{profile.fullName}</p>
                            <Badge variant="outline">{profile.type}</Badge>
                            {profile.verified ? <Badge variant="success">Verified</Badge> : null}
                            {profile.demo ? <Badge variant="secondary">Demo</Badge> : null}
                          </div>
                          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                            {profile.sport} · {profile.organization ?? "No organization"}
                          </p>
                          <p className="text-xs text-[color:var(--muted-foreground)]">
                            {profile.location || "No location"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                    <h3 className="text-sm font-semibold">Verification requests</h3>
                    {detail.verifications.length === 0 ? (
                      <p className="text-sm text-[color:var(--muted-foreground)]">No requests.</p>
                    ) : (
                      <ul className="space-y-2">
                        {detail.verifications.map((item) => (
                          <li key={item.id} className="rounded-md bg-[color:var(--card)]/50 p-2 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span>#{item.id}</span>
                              <Badge variant="outline">{item.role}</Badge>
                              <Badge variant={item.status === "approved" ? "success" : item.status === "rejected" ? "destructive" : "secondary"}>
                                {item.status}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                              Submitted {formatDateTime(item.submittedAt)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="space-y-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                    <h3 className="text-sm font-semibold">Reports</h3>
                    {[...detail.reportsAgainst, ...detail.reportsMade].length === 0 ? (
                      <p className="text-sm text-[color:var(--muted-foreground)]">No reports.</p>
                    ) : (
                      <div className="space-y-3">
                        {detail.reportsAgainst.length > 0 ? (
                          <div>
                            <p className="mb-1 text-xs uppercase text-[color:var(--muted-foreground)]">
                              Against this user
                            </p>
                            <ul className="space-y-2">
                              {detail.reportsAgainst.map((report) => (
                                <li key={report.id} className="rounded-md bg-[color:var(--card)]/50 p-2 text-sm">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span>#{report.id}</span>
                                    <Badge variant="outline">{report.status}</Badge>
                                  </div>
                                  <p className="mt-1 truncate text-xs text-[color:var(--muted-foreground)]">
                                    {report.reason} · by {report.reporterName ?? "unknown"}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {detail.reportsMade.length > 0 ? (
                          <div>
                            <p className="mb-1 text-xs uppercase text-[color:var(--muted-foreground)]">
                              Made by this user
                            </p>
                            <ul className="space-y-2">
                              {detail.reportsMade.map((report) => (
                                <li key={report.id} className="rounded-md bg-[color:var(--card)]/50 p-2 text-sm">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span>#{report.id}</span>
                                    <Badge variant="outline">{report.status}</Badge>
                                  </div>
                                  <p className="mt-1 truncate text-xs text-[color:var(--muted-foreground)]">
                                    {report.reason} · against {report.reportedUserName ?? "unknown"}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
                  <h3 className="text-sm font-semibold">Commands</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant={detail.verified ? "outline" : "success"}
                      disabled={!canVerify || submitting}
                      onClick={() => submitAction({ action: detail.verified ? "unverify" : "verify" })}
                    >
                      {detail.verified ? (
                        <ShieldX className="size-4" />
                      ) : (
                        <ShieldCheck className="size-4" />
                      )}
                      {detail.verified ? "Unverify profile" : "Verify profile"}
                    </Button>
                    <Button
                      variant={detail.banned ? "secondary" : "outline"}
                      disabled={!detail.banned || submitting}
                      onClick={() => submitAction({ action: "unban" })}
                    >
                      <Unlock className="size-4" /> Unban user
                    </Button>
                  </div>

                  {detail.banned ? (
                    <p className="rounded-md border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 p-2 text-sm">
                      Banned {formatDateTime(detail.bannedAt)}. Expires{" "}
                      {detail.bannedUntil ? formatDateTime(detail.bannedUntil) : "never"}.
                      {detail.banReason ? ` Reason: ${detail.banReason}` : ""}
                    </p>
                  ) : null}

                  <div className="space-y-2">
                    <Label htmlFor="ban-reason">Ban reason</Label>
                    <Textarea
                      id="ban-reason"
                      value={banReason}
                      onChange={(event) => setBanReason(event.target.value)}
                      placeholder="Shared in admin records and ban emails from report actions"
                    />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="ban-days" className="shrink-0">
                          Days
                        </Label>
                        <Input
                          id="ban-days"
                          type="number"
                          min={1}
                          max={3650}
                          className="w-28"
                          value={durationDays}
                          onChange={(event) => setDurationDays(Number.parseInt(event.target.value, 10) || 0)}
                        />
                      </div>
                      <div className="flex flex-1 gap-2 sm:justify-end">
                        <Button
                          variant="warning"
                          disabled={!canBan || submitting}
                          onClick={() =>
                            submitAction({
                              action: "ban_temporary",
                              reason: banReason,
                              durationDays,
                            })
                          }
                        >
                          <Ban className="size-4" /> Temp ban
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={!canBan || submitting}
                          onClick={() => submitAction({ action: "ban_permanent", reason: banReason })}
                        >
                          <Ban className="size-4" /> Permanent ban
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={closeDetail}>
                  Close
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/users?user=${encodeURIComponent(detail.id)}`}>
                    <UserCog className="size-4" /> Management link
                  </Link>
                </Button>
              </DialogFooter>
            </>
          ) : (
            <p className="py-10 text-center text-sm text-[color:var(--muted-foreground)]">
              Loading user…
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
