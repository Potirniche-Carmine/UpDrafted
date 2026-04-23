import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  Layers,
  Search,
  Shield,
  DollarSign,
  Building2,
  Gift,
  Inbox,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.forRecruiters();

export default function ForRecruitersPage() {
  return (
    <div className="flex flex-col">
      {/* ============== HERO ============== */}
      <section className="relative w-full overflow-hidden border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#01ae79]/5 via-transparent to-transparent dark:from-[#01ae79]/10" />
        <div className="absolute top-32 -right-40 w-[30rem] h-[30rem] bg-[#01ae79]/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-6xl px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl space-y-7">
            <Badge
              variant="outline"
              className="bg-[#01ae79]/5 text-[#01ae79] border-[#01ae79]/30"
            >
              For Recruiting Coordinators
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
              Every program.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#01ae79] to-[#018a60]">
                Every sport. One hub.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Coaches work one sport. You work twenty. UpDrafted gives you
              cross-sport search and one verified profile that represents your
              whole athletic department — built for the NIL-era budgets you&apos;re
              actually working with.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-[#01ae79] hover:bg-[#018a60] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg shadow-[#01ae79]/20 w-full sm:w-auto group"
                >
                  Get institutional access
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold rounded-lg border-2 w-full sm:w-auto"
                >
                  Talk to our team
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#01ae79]" /> Multi-sport search
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#01ae79]" /> Institution-level
                verification
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#01ae79]" /> Free to evaluate
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FEATURES ============== */}
      <section className="w-full py-20 md:py-28">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge
              variant="outline"
              className="mb-4 bg-[#01ae79]/5 text-[#01ae79] border-[#01ae79]/30"
            >
              Built for the whole department
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              One login. Every board on campus.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Layers className="h-6 w-6" />}
              title="Cross-sport search"
              body="Filter by sport, class year, region, measurables, and academic fit in one query. Pull football on Monday, lacrosse on Tuesday — same workspace."
              accent
            />
            <FeatureCard
              icon={<DollarSign className="h-6 w-6" />}
              title="Built for NIL-era budgets"
              body="Department dollars are stretched thin. Surface the right fits for every program without stacking another per-sport subscription on top of the recruiting bill."
            />
            <FeatureCard
              icon={<Building2 className="h-6 w-6" />}
              title="Institutional profile"
              body="Represent your school, not just yourself. List every program you recruit for, show your verified department badge, build trust with families."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Verified at every level"
              body="Athletes, coaches, and institutions are all manually verified. When your program reaches out, families know it&apos;s legit."
            />
            <FeatureCard
              icon={<Gift className="h-6 w-6" />}
              title="Free to evaluate, forever"
              body="Search every sport, open every profile, and start conversations at $0. Premium only exists if you want higher monthly connection limits."
            />
            <FeatureCard
              icon={<Inbox className="h-6 w-6" />}
              title="Unified inbox"
              body="All prospect conversations, across every sport, in one thread list — direct-to-athlete, no agents in the middle."
            />
          </div>
        </div>
      </section>

      {/* ============== DIFFERENTIATOR ============== */}
      <section className="w-full py-20 md:py-28 bg-gray-50/70 dark:bg-gray-950/40 border-y border-gray-200/60 dark:border-gray-800/60">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="bg-[#01ae79]/5 text-[#01ae79] border-[#01ae79]/30"
              >
                Why we&apos;re different
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                No agents pitching you their clients.
                <br />
                <span className="text-[#01ae79]">
                  Just athletes on their own boards.
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Traditional recruiting databases are built on repackaged data
                and agent-pitched lists. UpDrafted is the only platform where
                every profile is built and maintained by the athlete — so
                what you see is what you&apos;re actually recruiting.
              </p>
              <div className="pt-2">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-[#01ae79] hover:bg-[#018a60] text-white px-8 py-6 text-lg font-semibold rounded-lg"
                  >
                    Request institutional access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  before: "Licensed database refreshed monthly",
                  after: "Live profiles, updated by the athlete",
                },
                {
                  before: "Agents between you and the prospect",
                  after: "Direct DM, zero intermediaries",
                },
                {
                  before: "Per-seat recruiter licenses",
                  after: "Department-wide access",
                },
                {
                  before: "Separate tool per sport",
                  after: "One platform, every program",
                },
                {
                  before: "Extra line items on your NIL budget",
                  after: "$0 to evaluate, $0 to message",
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                >
                  <span className="text-sm text-muted-foreground line-through decoration-red-400/60">
                    {row.before}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#01ae79] shrink-0" />
                  <span className="text-sm font-semibold text-[#01ae79] text-right">
                    {row.after}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== FINAL CTA ============== */}
      <section className="w-full py-20 md:py-28">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#01ae79] to-[#016e4c] p-10 md:p-14 text-center shadow-2xl shadow-[#01ae79]/20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:24px_24px]" />
            </div>

            <div className="relative space-y-5">
              <Search className="h-10 w-10 text-white mx-auto" />
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Run the whole department from one tab.
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
                Set up your institutional profile, onboard your staff, and
                run your first cross-sport search the same day.
              </p>
              <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-white text-[#01ae79] hover:bg-white/95 px-10 py-6 text-lg font-semibold rounded-lg shadow-xl"
                  >
                    Start free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-lg font-semibold rounded-lg border-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    Book a walk-through
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  accent = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-7 border transition-all ${
        accent
          ? "bg-gradient-to-br from-[#01ae79]/10 to-transparent border-[#01ae79]/30 shadow-lg shadow-[#01ae79]/5"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#01ae79]/30 hover:shadow-md"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
          accent ? "bg-[#01ae79] text-white" : "bg-[#01ae79]/10 text-[#01ae79]"
        }`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p
        className="text-sm text-muted-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}
