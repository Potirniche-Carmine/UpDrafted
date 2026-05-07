import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  MessageSquare,
  Shield,
  Filter,
  DollarSign,
  Gift,
  FileVideo,
  Users,
  ExternalLink,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import {
  CompanyHeroHeadline,
  CompanyHeroTrigger,
} from "../components/company-hero-headline";

export const metadata = pageMetadata.forCoaches();

export default function ForCoachesPage() {
  return (
    <div className="flex flex-col">
      {/* ============== HERO ============== */}
      <section className="relative w-full overflow-hidden border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#01ae79]/5 via-transparent to-transparent dark:from-[#01ae79]/10" />
        <div className="absolute top-32 -left-40 w-[30rem] h-[30rem] bg-[#01ae79]/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-6xl px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl space-y-7">
            <CompanyHeroHeadline
              lead="Every prospect."
              emphasis={
                <>
                  One <CompanyHeroTrigger>inbox.</CompanyHeroTrigger>
                </>
              }
            />
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Skip the spreadsheets, the Hudl tabs, the unread DMs. UpDrafted
              is the hub where verified athletes link out to everything —
              film, stats, academics, socials, contact info — and where you
              reach them without a single agent in between.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-[#01ae79] hover:bg-[#018a60] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg shadow-[#01ae79]/20 w-full sm:w-auto group"
                >
                  Claim your coach profile
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/for-recruiters">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold rounded-lg border-2 w-full sm:w-auto"
                >
                  Recruiting multi-sport?
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#01ae79]" /> Free to evaluate
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#01ae79]" /> Verified athletes
                only
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#01ae79]" /> Direct-to-athlete
                messaging
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============== STAT STRIP ============== */}
      <section className="w-full py-10 md:py-14 bg-gray-50/70 dark:bg-gray-950/40 border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Stat label="Tabs per prospect" from="9+" to="1 hub" />
            <Stat label="Finding film" from="Hunt across sites" to="One click out" />
            <Stat label="Who owns the pitch" from="A third-party rep" to="The athlete" />
            <Stat label="Cost to evaluate" from="Subscription" to="$0" />
          </div>
        </div>
      </section>

      {/* ============== FEATURES ============== */}
      <section className="w-full py-20 md:py-28">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Built for staffs that are tired of
              <br />
              <span className="text-[#01ae79]">tab-switching.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Filter className="h-6 w-6" />}
              title="Search the way you recruit"
              body="Filter by position, class year, region, height/weight, GPA, and ACT/SAT. Find fits in minutes instead of sifting through a service&apos;s weekly list."
            />
            <FeatureCard
              icon={<FileVideo className="h-6 w-6" />}
              title="Every link, one profile"
              body="Every athlete links Hudl, MaxPreps, 247, ESPN, and socials right from their UpDrafted page. One profile opens every source — no scavenger hunt, no nine-tab chaos."
              accent
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="Direct-to-athlete DMs"
              body="Message prospects inside the platform with read receipts. No third-party rep, no forwarded-email chain — just you and the athlete."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Verified on both sides"
              body="Every athlete is manually verified by our team. Your verified badge signals to families that you&apos;re the real deal, too."
            />
            <FeatureCard
              icon={<DollarSign className="h-6 w-6" />}
              title="Built for the NIL era"
              body="Your budget is already thin. UpDrafted helps you surface talent that fits your program and your wallet — no recruiting-service subscription required."
            />
            <FeatureCard
              icon={<Gift className="h-6 w-6" />}
              title="Free to evaluate"
              body="Search, shortlist mentally, and open conversations at $0. Premium only exists if you want higher monthly connection limits."
            />
          </div>
        </div>
      </section>

      {/* ============== WORKFLOW ============== */}
      <section className="w-full py-20 md:py-28 bg-gray-50/70 dark:bg-gray-950/40 border-y border-gray-200/60 dark:border-gray-800/60">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              From discovery to DM in three clicks.
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                n: "01",
                title: "Build your coach profile",
                body: "Program, role, sport, recruiting priorities. Get verified and athletes can find (and trust) you.",
              },
              {
                n: "02",
                title: "Search and discover",
                body: "Use filters to surface prospects who fit your program. Open their profile — film, stats, academics, socials — all in one place.",
              },
              {
                n: "03",
                title: "Connect and message",
                body: "Hit connect, open a DM, and talk directly. No agents, no relayed messages, no cold-email spam folder.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="flex gap-6 items-start p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#01ae79]/30 transition-colors"
              >
                <div className="shrink-0 text-4xl font-bold text-[#01ae79]/30 w-16">
                  {step.n}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== RECRUITER CROSS-SELL ============== */}
      <section className="w-full py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <div className="rounded-2xl border border-[#01ae79]/20 bg-gradient-to-br from-[#01ae79]/5 to-transparent p-8 md:p-10 text-center">
            <Users className="h-8 w-8 text-[#01ae79] mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-3">
              Recruiting across multiple sports?
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              If your job is filling rosters for every program on campus —
              football Monday, track Tuesday — the Recruiter platform gives
              you cross-sport search and institutional verification, built for
              NIL-era budgets.
            </p>
            <Link href="/for-recruiters">
              <Button variant="outline" className="border-[#01ae79]/30 text-[#01ae79] hover:bg-[#01ae79]/5">
                See the Recruiter tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============== FINAL CTA ============== */}
      <section className="w-full pb-20 md:pb-28">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#01ae79] to-[#016e4c] p-10 md:p-16 text-center shadow-2xl shadow-[#01ae79]/25">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:24px_24px]" />
            </div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/15 rounded-full blur-3xl" />

            <div className="relative space-y-7">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1]">
                Find the next one.
                <br />
                <span className="text-white/70">Today.</span>
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto leading-relaxed">
                Verified profile, real search, direct message — live before your next staff meeting.
              </p>
              <div className="pt-3">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-white text-[#01ae79] hover:bg-white/95 px-10 py-7 text-lg font-bold rounded-xl shadow-2xl shadow-black/20 group"
                  >
                    Get verified — free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/80">
                Free to evaluate &middot; No contracts &middot; No per-seat fees
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  from,
  to,
}: {
  label: string;
  from: string;
  to: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </p>
      <div className="flex items-center justify-center gap-2 text-base md:text-lg">
        <span className="text-muted-foreground line-through decoration-red-400/60">
          {from}
        </span>
        <ArrowRight className="h-4 w-4 text-[#01ae79]" />
        <span className="font-semibold text-[#01ae79]">{to}</span>
      </div>
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
