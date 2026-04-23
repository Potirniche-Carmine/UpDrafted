import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  X,
  MessageSquare,
  Shield,
  Search,
  UserPlus,
  Send,
  Lock,
  Zap,
  CircleDot,
} from "lucide-react";
import { AuthWrapper } from "../../components/auth-wrapper";
import { pageMetadata } from "@/lib/seo";
import { SportsCarousel } from "@/components/sports-carousel";

export const metadata = pageMetadata.home();

function HomePageContent() {
  return (
    <div className="flex flex-col">
      {/* ============== HERO ============== */}
      <section className="relative w-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#01ae79]/5 via-transparent to-transparent dark:from-[#01ae79]/10 pointer-events-none" />
        <div className="absolute top-24 -left-32 w-96 h-96 bg-[#01ae79]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-64 -right-32 w-96 h-96 bg-[#01ae79]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto max-w-7xl px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left: copy */}
            <div className="lg:col-span-7 space-y-8">
              <Badge
                variant="outline"
                className="bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30 font-medium"
              >
                <CircleDot className="w-3 h-3 mr-2 fill-[#01ae79]" />
                Athlete-led recruiting. No middlemen.
              </Badge>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95]">
                Recruit{" "}
                <span className="relative inline-block">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#01ae79] to-[#018a60]">
                    yourself.
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 9C70 3 150 3 298 9"
                      stroke="#01ae79"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                The only recruiting platform where athletes run the table.
                Build your profile, message college coaches directly, and skip
                every agent, service, and middleman that used to own your
                future.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-[#01ae79] hover:bg-[#018a60] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg shadow-[#01ae79]/20 hover:shadow-xl hover:shadow-[#01ae79]/30 transition-all w-full sm:w-auto group"
                  >
                    Create your profile
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-lg font-semibold rounded-lg border-2 w-full sm:w-auto"
                  >
                    See how it works
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#01ae79]" />
                  <span>Free to build your profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#01ae79]" />
                  <span>Verified coaches only</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#01ae79]" />
                  <span>No agents, ever</span>
                </div>
              </div>
            </div>

            {/* Right: mock direct-message UI */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Decorative card behind */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[#01ae79]/20 to-transparent rounded-3xl blur-2xl" />

                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {/* Window chrome */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      updrafted.us/messages
                    </div>
                    <div className="w-12" />
                  </div>

                  {/* Thread header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#01ae79] to-[#018a60] flex items-center justify-center text-white font-semibold">
                        MS
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5">
                        <Shield className="h-3 w-3 text-[#01ae79] fill-[#01ae79]/20" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm">Coach Martinez</p>
                        <Badge className="h-4 px-1.5 text-[10px] bg-[#01ae79]/10 text-[#01ae79] border-0 hover:bg-[#01ae79]/10">
                          Verified
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Stanford Lacrosse · Head Coach
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#01ae79]">
                      <div className="w-2 h-2 bg-[#01ae79] rounded-full" />
                      Online
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="px-4 py-5 space-y-3 bg-gray-50/50 dark:bg-gray-950/30 min-h-[240px]">
                    <div className="flex">
                      <div className="max-w-[85%] bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-sm">
                          Reviewed your 2026 film. The left-hand release at
                          1:47 is elite. We have a campus visit window March
                          14–16 — want in?
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          2:14 PM
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-[#01ae79] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
                        <p className="text-sm">
                          Absolutely. Sending my fall schedule now.
                        </p>
                        <p className="text-[10px] text-white/70 mt-1">
                          2:16 PM · Read
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
                        <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse [animation-delay:0.4s]" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Coach Martinez is typing
                      </span>
                    </div>
                  </div>

                  {/* Composer */}
                  <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm text-muted-foreground">
                      Message Coach Martinez…
                    </div>
                    <button
                      className="w-9 h-9 rounded-full bg-[#01ae79] text-white flex items-center justify-center shadow-sm"
                      aria-label="Send"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Floating caption */}
                <div className="hidden md:flex absolute -bottom-6 -left-6 items-center gap-2 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 shadow-lg px-4 py-2 text-xs font-medium">
                  <div className="w-2 h-2 bg-[#01ae79] rounded-full animate-pulse" />
                  Real conversations. No gatekeepers.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== SPORTS CAROUSEL ============== */}
      <div className="border-y border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-950/30">
        <SportsCarousel />
      </div>

      {/* ============== OLD WAY vs UPDRAFTED ============== */}
      <section className="w-full py-20 md:py-28">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="mb-4 bg-[#01ae79]/5 text-[#01ae79] border-[#01ae79]/30"
            >
              The shift
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              The recruiting game changed.
              <br />
              <span className="text-muted-foreground">
                The playbook didn&apos;t.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Athletes have been stuck paying services, chasing agents, and
              flooding inboxes just to get seen. UpDrafted hands the pen back
              to the player.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Old way */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-muted-foreground line-through decoration-red-400/60 decoration-2">
                  The old way
                </h3>
              </div>

              <ul className="space-y-4">
                {[
                  "Hand $300–$500 a month to a recruiting service",
                  "Let a middleman decide which coaches hear your name",
                  "Send cold emails that never get opened",
                  "Scatter highlights across Hudl, 247, and IG",
                  "Wait months to find out if anyone saw your film",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <X className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* UpDrafted way */}
            <div className="relative rounded-2xl border-2 border-[#01ae79]/30 bg-gradient-to-br from-[#01ae79]/[0.04] to-transparent dark:from-[#01ae79]/10 p-8 shadow-lg shadow-[#01ae79]/5">
              <div className="absolute -top-3 right-6">
                <Badge className="bg-[#01ae79] text-white hover:bg-[#01ae79] border-0">
                  Own your recruiting
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#01ae79]/15 flex items-center justify-center">
                  <Check className="h-5 w-5 text-[#01ae79]" />
                </div>
                <h3 className="text-2xl font-bold">The UpDrafted way</h3>
              </div>

              <ul className="space-y-4">
                {[
                  "Free to build a profile coaches actually search",
                  "Zero middlemen — your pitch goes straight to the staff",
                  "Direct message verified college coaches in-app",
                  "One profile links out to every place your game already lives",
                  "Always free — premium only if you want higher limits",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#01ae79] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section
        id="how-it-works"
        className="w-full py-20 md:py-28 bg-gray-50/70 dark:bg-gray-950/40 border-y border-gray-200/60 dark:border-gray-800/60"
      >
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="mb-4 bg-[#01ae79]/5 text-[#01ae79] border-[#01ae79]/30"
            >
              How it works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              Three steps. Zero gatekeepers.
            </h2>
            <p className="text-lg text-muted-foreground">
              From first signup to sitting across the table from a head coach —
              you drive every step.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <StepCard
              number="01"
              icon={<UserPlus className="h-6 w-6" />}
              title="Build your recruiting profile"
              body="Link your Hudl, MaxPreps, ESPN, 247, socials, academics, and measurables. UpDrafted is the hub — coaches click through to every profile your game already lives on."
            />
            <StepCard
              number="02"
              icon={<Search className="h-6 w-6" />}
              title="Get found by verified coaches"
              body="Coaches search by sport, position, graduation year, region, and measurables. If you fit their board, you show up — whether you paid for exposure or not."
            />
            <StepCard
              number="03"
              icon={<MessageSquare className="h-6 w-6" />}
              title="Message coaches directly"
              body="Slide straight into the DMs of verified college coaches. No intermediaries, no lost emails — just you and the staff, talking."
              highlight
            />
          </div>
        </div>
      </section>

      {/* ============== DIFFERENTIATORS ============== */}
      <section className="w-full py-20 md:py-28">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="bg-[#01ae79]/5 text-[#01ae79] border-[#01ae79]/30"
              >
                Why we&apos;re different
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                We&apos;re not another recruiting service.
                <br />
                <span className="text-[#01ae79]">
                  We&apos;re the platform that replaces them.
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every other recruiting tool puts a layer between you and the
                coach — a rep, a subscription, a curated list. UpDrafted is
                where the two of you just talk. Your film, your pitch, your
                future, your words.
              </p>
              <div className="pt-2">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-[#01ae79] hover:bg-[#018a60] text-white px-8 py-6 text-lg font-semibold rounded-lg"
                  >
                    Claim your profile
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <DiffCard
                icon={<Shield className="h-5 w-5" />}
                title="Verified coaches only"
                body="Every coach on the platform is manually verified against their institution. No catfish, no imposters, no cold-calls."
              />
              <DiffCard
                icon={<MessageSquare className="h-5 w-5" />}
                title="Direct messaging built in"
                body="Real conversations, in real time. Read receipts and a history you actually own."
              />
              <DiffCard
                icon={<Zap className="h-5 w-5" />}
                title="No pay-to-be-seen"
                body="Your profile is discoverable for free. No upsell to unlock being noticed by your dream program."
              />
              <DiffCard
                icon={<Lock className="h-5 w-5" />}
                title="You own your data"
                body="Export your profile, links, and message history any time. You built it. It&apos;s yours."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============== WHO IT'S FOR ============== */}
      <section className="w-full py-20 md:py-28 bg-gray-50/70 dark:bg-gray-950/40 border-y border-gray-200/60 dark:border-gray-800/60">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="mb-4 bg-[#01ae79]/5 text-[#01ae79] border-[#01ae79]/30"
            >
              Built for every path
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              Whatever your starting line looks like.
            </h2>
            <p className="text-lg text-muted-foreground">
              High school senior, transfer portal, JUCO climber, or flying in
              from overseas — the profile flexes to your story.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                tag: "High School",
                title: "Class of '26, '27, '28",
                body: "Get on college boards before signing day. Link your film, list your GPA and measurables, send one profile anywhere.",
              },
              {
                tag: "Transfer Portal",
                title: "Entered the portal",
                body: "Cut the noise. Reach staffs that actually need your position — today — and negotiate your next stop on your terms.",
              },
              {
                tag: "JUCO",
                title: "Stepping up from JUCO",
                body: "Make the D1/D2 jump visible. Link your game film, list your season stats, and let 4-year programs find you.",
              },
              {
                tag: "International",
                title: "Coming stateside",
                body: "No US contacts, no problem. A profile coaches can translate, scout, and message — no visa hoops just to say hi.",
              },
            ].map((p) => (
              <div
                key={p.tag}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-[#01ae79]/40 hover:shadow-lg hover:shadow-[#01ae79]/5 transition-all"
              >
                <Badge className="mb-4 bg-[#01ae79]/10 text-[#01ae79] border-0 hover:bg-[#01ae79]/10 font-medium">
                  {p.tag}
                </Badge>
                <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FAQ ============== */}
      <section className="w-full py-20 md:py-28">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Straight answers.
            </h2>
            <p className="text-lg text-muted-foreground">
              No fine print. No sales pitch.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Is UpDrafted a recruiting service?",
                a: "No. A service recruits for you. UpDrafted is the platform where you recruit yourself — with the same tools the paid services used to gatekeep.",
              },
              {
                q: "Does UpDrafted host my film or stats?",
                a: "No — and that&apos;s the point. Your Hudl, MaxPreps, 247 Sports, and socials already exist. UpDrafted is the centralized hub where you link all of them in one place. Coaches open one profile, click out to every source, and never have to track you across the internet.",
              },
              {
                q: "Do you take a cut of my scholarship or NIL?",
                a: "Never. We don&apos;t touch your offers, your commitments, or your money. You and the coach talk. We stay out of it.",
              },
              {
                q: "How are coaches verified?",
                a: "Manually, against their institution&apos;s athletic department. Every verified badge on the platform is one our team signed off on — not one a coach bought.",
              },
              {
                q: "Is it really free?",
                a: "Yes — and it always will be. Creating your profile, discovering coaches, and messaging them is $0 to start and $0 forever. Premium exists if you want higher usage limits and more connections per month, but the core platform is free for every athlete on it.",
              },
              {
                q: "What sports do you cover?",
                a: "Every NCAA, NAIA, and NJCAA sport — men&apos;s and women&apos;s — plus emerging college programs. If your sport has a college team, it has a home here.",
              },
              {
                q: "Who can create a profile?",
                a: "You need to be at least a junior in high school to sign up as an athlete. Transfer portal players, JUCO athletes, and international athletes pursuing US college opportunities are all welcome too. Sophomores and younger — bookmark us and come back when you&apos;re a junior.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 open:border-[#01ae79]/40 open:shadow-md open:shadow-[#01ae79]/5 transition-all"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-5 list-none">
                  <span className="font-semibold text-left">{item.q}</span>
                  <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-open:bg-[#01ae79] group-open:text-white transition-colors shrink-0">
                    <ArrowRight className="h-4 w-4 rotate-90 group-open:-rotate-90 transition-transform" />
                  </span>
                </summary>
                <div
                  className="px-6 pb-5 text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.a }}
                />
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FINAL CTA ============== */}
      <section className="w-full pb-20 md:pb-28">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#01ae79] to-[#016e4c] p-10 md:p-16 text-center shadow-2xl shadow-[#01ae79]/20">
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:24px_24px]" />
            </div>
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-black/10 rounded-full blur-3xl" />

            <div className="relative space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                Stop waiting to be found.
                <br />
                Go find them.
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                Your profile goes live in ten minutes. Your first coach
                conversation could be tomorrow.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-white text-[#01ae79] hover:bg-white/95 px-8 py-6 text-lg font-semibold rounded-lg shadow-xl w-full sm:w-auto group"
                  >
                    Start your profile — free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link href="/for-coaches">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-lg font-semibold rounded-lg border-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white w-full sm:w-auto"
                  >
                    I&apos;m a coach
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/70 pt-2">
                No credit card. No agent. No middleman.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  body,
  highlight = false,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-7 border transition-all hover:-translate-y-1 ${
        highlight
          ? "bg-gradient-to-br from-[#01ae79]/10 to-transparent border-[#01ae79]/30 shadow-xl shadow-[#01ae79]/10"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#01ae79]/30 hover:shadow-lg"
      }`}
    >
      <div className="flex items-center justify-between mb-5">
        <span className="text-5xl font-bold text-[#01ae79]/20 leading-none">
          {number}
        </span>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            highlight
              ? "bg-[#01ae79] text-white"
              : "bg-[#01ae79]/10 text-[#01ae79]"
          }`}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function DiffCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-[#01ae79]/40 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-[#01ae79]/10 text-[#01ae79] flex items-center justify-center mb-3">
        {icon}
      </div>
      <h4 className="font-semibold mb-1.5">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthWrapper type="landing" requireAuth={false}>
      <HomePageContent />
    </AuthWrapper>
  );
}
