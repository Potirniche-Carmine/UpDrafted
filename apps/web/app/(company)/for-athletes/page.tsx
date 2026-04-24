import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  X,
  MessageSquare,
  Shield,
  Search,
  Link2,
  Gift,
  Trophy,
  GraduationCap,
  Globe,
  Repeat,
  School,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.forAthletes();

export default function ForAthletesPage() {
  return (
    <div className="flex flex-col">
      {/* ============== HERO ============== */}
      <section className="relative w-full overflow-hidden border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#01ae79]/5 via-transparent to-transparent dark:from-[#01ae79]/10" />
        <div className="absolute top-32 -right-40 w-[30rem] h-[30rem] bg-[#01ae79]/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-6xl px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl space-y-7">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
              You don&apos;t need an agent.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#01ae79] to-[#018a60]">
                You need a platform.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              UpDrafted hands you the same tools recruiting services have been
              charging you for — profile, exposure, and a direct line to
              college coaches — and takes zero of the credit when you commit.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-[#01ae79] hover:bg-[#018a60] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg shadow-[#01ae79]/20 w-full sm:w-auto group"
                >
                  Start your profile — free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/for-coaches">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold rounded-lg border-2 w-full sm:w-auto"
                >
                  I coach. Take me there.
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#01ae79]" /> Free to build
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#01ae79]" /> No agents
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#01ae79]" /> Own your data
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============== COMPARISON ============== */}
      <section className="w-full py-20 md:py-28">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Stop paying to be seen.
            </h2>
            <p className="text-lg text-muted-foreground">
              Here&apos;s the math on the old recruiting model vs. running it
              yourself.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/30 p-8">
              <div className="flex items-center gap-3 mb-2">
                <X className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Recruiting service
                </h3>
              </div>
              <p className="text-4xl font-bold text-muted-foreground mb-6">
                $300–$500
                <span className="text-base font-normal">/mo</span>
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "A rep you&apos;ve never met pitches you",
                  "Locked-in contracts and auto-renewals",
                  "Coaches get a list, not a conversation",
                  "You don&apos;t see which schools were contacted",
                  "You leave with nothing when you stop paying",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-2xl border-2 border-[#01ae79]/30 bg-gradient-to-br from-[#01ae79]/5 to-transparent dark:from-[#01ae79]/10 p-8 shadow-lg shadow-[#01ae79]/5">
              <div className="flex items-center gap-3 mb-2">
                <Check className="h-5 w-5 text-[#01ae79]" />
                <h3 className="text-lg font-semibold">UpDrafted</h3>
              </div>
              <p className="text-4xl font-bold text-[#01ae79] mb-6">
                $0<span className="text-base font-normal">/mo to start</span>
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  "You pitch, in your words, to the coach",
                  "No contracts — close your account any time",
                  "Direct two-way messaging with read receipts",
                  "Free forever — premium only raises your limits",
                  "Export everything you build, whenever you want",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#01ae79] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FEATURES GRID ============== */}
      <section className="w-full py-20 md:py-28 bg-gray-50/70 dark:bg-gray-950/40 border-y border-gray-200/60 dark:border-gray-800/60">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything a paid service gave you.
              <br />
              <span className="text-[#01ae79]">Zero middlemen.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Link2 className="h-6 w-6" />}
              title="One hub, every platform"
              body="Link your Hudl, MaxPreps, ESPN, 247 Sports, and socials. Add your GPA, ACT/SAT, and measurables. We don&apos;t host your film — we point coaches to every profile it already lives on."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Manual verification"
              body="Submit your Hudl or MaxPreps, we verify it by hand. Most athletes are approved within a couple hours. Verified badges mean coaches trust you."
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="Direct coach messaging"
              body="No contact forms, no emails lost in spam. Message verified college coaches inside the app with read receipts on every send."
              accent
            />
            <FeatureCard
              icon={<Search className="h-6 w-6" />}
              title="Be findable on purpose"
              body="Coaches filter by sport, position, class year, region, GPA, and measurables. If you&apos;re a fit, you&apos;re on their board — not buried."
            />
            <FeatureCard
              icon={<Gift className="h-6 w-6" />}
              title="Free to start. Free forever."
              body="Building your profile, getting discovered, and messaging coaches is $0 — and it stays $0. Premium only exists if you want higher monthly limits and more connections."
            />
            <FeatureCard
              icon={<Trophy className="h-6 w-6" />}
              title="You drive every step"
              body="The platform is simple on purpose: discover coaches, connect, and message. What you say, when you say it, and who you talk to — all you."
            />
          </div>
        </div>
      </section>

      {/* ============== PATHWAYS ============== */}
      <section className="w-full py-20 md:py-28">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Wherever you&apos;re coming from.
            </h2>
            <p className="text-lg text-muted-foreground">
              Four paths. Same platform. Same outcome: your name on their
              board.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PathwayCard
              icon={<GraduationCap className="h-6 w-6" />}
              tag="High School"
              title="Before signing day"
              body="Get in front of college staffs while your tape is still fresh. Build credibility early so offers come to you."
            />
            <PathwayCard
              icon={<Repeat className="h-6 w-6" />}
              tag="Transfer Portal"
              title="Cut the portal noise"
              body="Position-specific filters mean you show up to staffs with a real need — and a real spot to offer."
            />
            <PathwayCard
              icon={<School className="h-6 w-6" />}
              tag="JUCO"
              title="The four-year jump"
              body="Link your film and list your season stats. Show 4-year programs the production to back up the reel."
            />
            <PathwayCard
              icon={<Globe className="h-6 w-6" />}
              tag="International"
              title="Coming stateside"
              body="Translate your game for US coaches. Stats, positions, film notes — all converted to the language they recruit in."
            />
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
                Get on their board.
                <br />
                <span className="text-white/70">Tonight.</span>
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto leading-relaxed">
                Ten minutes of setup. A profile built the way coaches actually recruit.
              </p>
              <div className="pt-3">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-white text-[#01ae79] hover:bg-white/95 px-10 py-7 text-lg font-bold rounded-xl shadow-2xl shadow-black/20 group"
                  >
                    Create my profile
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/80">
                Free to start &middot; No credit card &middot; No agent
              </p>
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

function PathwayCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  tag?: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 hover:border-[#01ae79]/40 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#01ae79]/10 text-[#01ae79] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
