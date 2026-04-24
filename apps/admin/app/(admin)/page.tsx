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
  ShieldCheck,
  Ban,
  UserCheck,
  CreditCard,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Accent = "primary" | "warning" | "destructive" | "success";

function accentClasses(accent: Accent = "primary"): { text: string; bg: string } {
  switch (accent) {
    case "warning":
      return { text: "text-[color:var(--warning)]", bg: "bg-[color:var(--warning)]/15" };
    case "destructive":
      return {
        text: "text-[color:var(--destructive)]",
        bg: "bg-[color:var(--destructive)]/15",
      };
    case "success":
      return {
        text: "text-[color:var(--success)]",
        bg: "bg-[color:var(--success)]/15",
      };
    default:
      return {
        text: "text-[color:var(--primary)]",
        bg: "bg-[color:var(--primary)]/15",
      };
  }
}

function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: number | string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: Accent;
}) {
  const { text, bg } = accentClasses(accent);
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-[color:var(--muted-foreground)]">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
            {value}
          </p>
          {sublabel ? (
            <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{sublabel}</p>
          ) : null}
        </div>
        <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${bg}`}>
          <Icon className={`size-5 ${text}`} />
        </div>
      </div>
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

  const paidSubscribers = Object.values(stats.subscriptions.byTier).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back, {session.name.split(" ")[0]}
        </h1>
      </header>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
            Users
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Total users" value={stats.totals.users.toLocaleString()} icon={Users} />
          <StatCard label="Athletes" value={stats.totals.athletes.toLocaleString()} icon={Trophy} />
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
            value={paidSubscribers.toLocaleString()}
            icon={CreditCard}
            accent="success"
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
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
                      className="flex items-center justify-between rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium">{formatTier(tier)}</span>
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
            <div className="flex items-center justify-between rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-3 py-2.5">
              <span className="font-medium">Athletes</span>
              <Badge variant="success">{stats.verifiedProfiles.athletes.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-3 py-2.5">
              <span className="font-medium">Coaches</span>
              <Badge variant="success">{stats.verifiedProfiles.coaches.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-3 py-2.5">
              <span className="font-medium">Recruiters</span>
              <Badge variant="success">
                {stats.verifiedProfiles.recruiters.toLocaleString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
