import { getAdminSession } from "@/lib/admin-guard";
import { getAdminStats } from "@/lib/stats";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Trophy,
  ClipboardList,
  Flag,
  ShieldCheck,
  Ban,
  UserCheck,
  CreditCard,
} from "lucide-react";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "warning" | "destructive" | "success";
}) {
  const color =
    accent === "warning"
      ? "text-[color:var(--warning)]"
      : accent === "destructive"
        ? "text-[color:var(--destructive)]"
        : accent === "success"
          ? "text-[color:var(--success)]"
          : "text-[color:var(--primary)]";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
          {label}
        </CardTitle>
        <Icon className={`size-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        {sublabel ? (
          <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{sublabel}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function formatTier(tier: string): string {
  return tier
    .replace(/_/g, " ")
    .replace(/\bpro\b/gi, "Pro")
    .replace(/\b(\w)/g, (m) => m.toUpperCase());
}

export default async function DashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/sign-in");

  const stats = await getAdminStats(session);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--primary)]">Overview</p>
        <h1 className="mt-1 text-3xl font-semibold">Welcome back, {session.name.split(" ")[0]}</h1>
        <p className="mt-2 text-[color:var(--muted-foreground)]">
          A bird&apos;s-eye view of the UpDrafted community.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
          Users
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={stats.totals.users.toLocaleString()} icon={Users} />
          <StatCard
            label="Athletes"
            value={stats.totals.athletes.toLocaleString()}
            icon={Trophy}
          />
          <StatCard
            label="Coaches"
            value={stats.totals.coaches.toLocaleString()}
            icon={ClipboardList}
          />
          <StatCard
            label="Recruiters"
            value={stats.totals.recruiters.toLocaleString()}
            icon={UserCheck}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Admins"
            value={stats.totals.admins.toLocaleString()}
            icon={ShieldCheck}
          />
          <StatCard
            label="Banned"
            value={stats.totals.bannedUsers.toLocaleString()}
            icon={Ban}
            accent="destructive"
          />
          <StatCard
            label="Pending onboarding"
            value={stats.totals.pendingOnboarding.toLocaleString()}
            icon={Users}
            accent="warning"
          />
          <StatCard
            label="Paid subscribers"
            value={Object.values(stats.subscriptions.byTier)
              .reduce((a, b) => a + b, 0)
              .toLocaleString()}
            icon={CreditCard}
            accent="success"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>
              {stats.subscriptions.active.toLocaleString()} active of{" "}
              {stats.subscriptions.total.toLocaleString()} total records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.subscriptions.byTier).length === 0 ? (
              <p className="text-sm text-[color:var(--muted-foreground)]">
                No paid subscriptions yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(stats.subscriptions.byTier)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tier, value]) => (
                    <li
                      key={tier}
                      className="flex items-center justify-between rounded-md border border-[color:var(--border)] px-3 py-2 text-sm"
                    >
                      <span>{formatTier(tier)}</span>
                      <Badge variant="secondary">{value.toLocaleString()}</Badge>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verified profiles</CardTitle>
            <CardDescription>Real (non-demo) profiles currently verified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Athletes</span>
              <Badge variant="success">{stats.verifiedProfiles.athletes.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Coaches</span>
              <Badge variant="success">{stats.verifiedProfiles.coaches.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Recruiters</span>
              <Badge variant="success">
                {stats.verifiedProfiles.recruiters.toLocaleString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Verifications</CardTitle>
              <CardDescription>Moderation queue health.</CardDescription>
            </div>
            <ShieldCheck className="size-5 text-[color:var(--primary)]" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-[color:var(--border)] p-3">
              <p className="text-[color:var(--muted-foreground)]">Pending</p>
              <p className="text-2xl font-semibold text-[color:var(--warning)]">
                {stats.verifications.pending.toLocaleString()}
              </p>
            </div>
            <div className="rounded-md border border-[color:var(--border)] p-3">
              <p className="text-[color:var(--muted-foreground)]">Under review</p>
              <p className="text-2xl font-semibold">
                {stats.verifications.underReview.toLocaleString()}
              </p>
            </div>
            <div className="rounded-md border border-[color:var(--border)] p-3">
              <p className="text-[color:var(--muted-foreground)]">Approved</p>
              <p className="text-2xl font-semibold text-[color:var(--success)]">
                {stats.verifications.approved.toLocaleString()}
              </p>
            </div>
            <div className="rounded-md border border-[color:var(--border)] p-3">
              <p className="text-[color:var(--muted-foreground)]">Rejected</p>
              <p className="text-2xl font-semibold text-[color:var(--destructive)]">
                {stats.verifications.rejected.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Reports</CardTitle>
              <CardDescription>User-submitted reports.</CardDescription>
            </div>
            <Flag className="size-5 text-[color:var(--destructive)]" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-[color:var(--border)] p-3">
              <p className="text-[color:var(--muted-foreground)]">Pending</p>
              <p className="text-2xl font-semibold text-[color:var(--warning)]">
                {stats.reports.pending.toLocaleString()}
              </p>
            </div>
            <div className="rounded-md border border-[color:var(--border)] p-3">
              <p className="text-[color:var(--muted-foreground)]">Under review</p>
              <p className="text-2xl font-semibold">
                {stats.reports.underReview.toLocaleString()}
              </p>
            </div>
            <div className="rounded-md border border-[color:var(--border)] p-3">
              <p className="text-[color:var(--muted-foreground)]">Resolved</p>
              <p className="text-2xl font-semibold text-[color:var(--success)]">
                {stats.reports.resolved.toLocaleString()}
              </p>
            </div>
            <div className="rounded-md border border-[color:var(--border)] p-3">
              <p className="text-[color:var(--muted-foreground)]">Dismissed</p>
              <p className="text-2xl font-semibold text-[color:var(--muted-foreground)]">
                {stats.reports.dismissed.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
