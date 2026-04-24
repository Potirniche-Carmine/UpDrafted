"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Heart,
  DollarSign,
  Building2,
  MessageSquare,
  Shield,
  Gift,
} from "lucide-react";

export default function AboutPageContent() {
  return (
    <div className="flex flex-col">
      {/* ============== HERO ============== */}
      <section className="relative w-full overflow-hidden border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#01ae79]/5 via-transparent to-transparent dark:from-[#01ae79]/10" />
        <div className="absolute top-32 -left-40 w-[30rem] h-[30rem] bg-[#01ae79]/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-5xl px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl space-y-7">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
              Athletes first.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#01ae79] to-[#018a60]">
                Free forever.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              UpDrafted is the platform where athletes run their own recruiting —
              and where college programs find the right fit without paying a
              service to middleman the relationship. That&apos;s it. That&apos;s
              the whole idea.
            </p>
          </div>
        </div>
      </section>

      {/* ============== MISSION ============== */}
      <section className="w-full py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-4 md:px-6 space-y-10">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              We built this for the athlete first.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Recruiting has been broken the same way for decades. Families pay
              a monthly subscription to a third party, a rep they&apos;ve never
              met pitches coaches on their behalf, and the athlete has almost
              no idea what was actually said about them. Coaches, meanwhile,
              drown in repackaged lists and agent outreach. Everyone loses time.
              A lot of people lose money.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              UpDrafted removes the middle layer. Athletes build their own
              profile, link out to their film and stats, and message coaches
              directly. Coaches and recruiters search, discover, connect, and
              talk — no agent forwarding, no list-brokered intros. The platform
              is simple by design: discover, connect, message. That&apos;s the
              platform.
            </p>
          </div>
        </div>
      </section>

      {/* ============== FREE FOREVER ============== */}
      <section className="w-full py-20 md:py-28 bg-gray-50/70 dark:bg-gray-950/40 border-y border-gray-200/60 dark:border-gray-800/60">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-[#01ae79]/10 text-[#01ae79] flex items-center justify-center">
                <Gift className="h-6 w-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                $0 to start. $0 forever.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Creating a profile, getting discovered, and messaging coaches
                is free — and it will always be free. That&apos;s a promise,
                not a promotion. Recruiting should not be gated by whether your
                family can afford a $400/month subscription.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Premium exists for athletes and programs who want higher
                monthly limits and more connections. It&apos;s an option, never
                a barrier. Being seen, being found, and having a conversation
                is always $0.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: "Build a profile", value: "Free" },
                { label: "Verified badge", value: "Free" },
                { label: "Be discovered by coaches", value: "Free" },
                { label: "Message any coach or athlete", value: "Free" },
                { label: "Higher monthly connection limits", value: "Premium" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                >
                  <span className="text-sm font-medium">{row.label}</span>
                  <span
                    className={`text-sm font-semibold ${
                      row.value === "Free"
                        ? "text-[#01ae79]"
                        : "text-muted-foreground"
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== WHO WE SERVE ============== */}
      <section className="w-full py-20 md:py-28">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Two sides. One purpose.
            </h2>
            <p className="text-lg text-muted-foreground mt-4">
              Help athletes get seen. Help institutions find them. Cut out
              everything in between.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl p-8 bg-gradient-to-br from-[#01ae79]/10 to-transparent border border-[#01ae79]/30">
              <div className="w-12 h-12 rounded-xl bg-[#01ae79] text-white flex items-center justify-center mb-5">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">For the athlete</h3>
              <p className="text-muted-foreground leading-relaxed">
                You should never have to pay a third party to talk about you.
                UpDrafted gives you the tools recruiting services charge for —
                a real profile, real verification, a real inbox with college
                coaches — and hands the driver&apos;s seat back to you. No
                agents. No middlemen. Just you and the coach.
              </p>
            </div>

            <div className="rounded-2xl p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-[#01ae79]/10 text-[#01ae79] flex items-center justify-center mb-5">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                For coaches &amp; institutions
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                In the NIL era, budgets are tight and every dollar counts.
                UpDrafted helps athletic departments find the athletes who fit
                their program and their wallet — without stacking another
                per-sport subscription on top of the recruiting bill. Finding
                the right students should be easier, not a line item.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== PRINCIPLES ============== */}
      <section className="w-full py-20 md:py-28 bg-gray-50/70 dark:bg-gray-950/40 border-y border-gray-200/60 dark:border-gray-800/60">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              What we hold to.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <Principle
              icon={<Heart className="h-6 w-6" />}
              title="Athletes first, always"
              body="Every feature decision starts with: does this help the athlete run their recruiting? If it doesn&apos;t, we don&apos;t build it."
            />
            <Principle
              icon={<DollarSign className="h-6 w-6" />}
              title="Free is not a trial"
              body="The core platform is $0 forever. Premium is optional, and only for higher usage — never for visibility."
            />
            <Principle
              icon={<Shield className="h-6 w-6" />}
              title="Verified, by humans"
              body="Every athlete, coach, and institution is manually verified. Trust isn&apos;t a feature you automate."
            />
            <Principle
              icon={<MessageSquare className="h-6 w-6" />}
              title="Direct, not relayed"
              body="Conversations happen athlete-to-coach. No rep forwarding messages, no list-brokered intros, no phone games."
            />
            <Principle
              icon={<Building2 className="h-6 w-6" />}
              title="Simple by design"
              body="Discover. Connect. Message. We don&apos;t chase shiny features — the platform does three things, and does them well."
            />
            <Principle
              icon={<Gift className="h-6 w-6" />}
              title="No gates to being seen"
              body="Visibility never costs a dollar. Families shouldn&apos;t need a subscription to be on a coach&apos;s radar."
            />
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="w-full py-20 md:py-28">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#01ae79] to-[#016e4c] p-10 md:p-14 text-center shadow-2xl shadow-[#01ae79]/20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:24px_24px]" />
            </div>

            <div className="relative space-y-5">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                The platform is simple. The mission is too.
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
                Help athletes get recruited. Help programs find them. Keep it
                free for the people who matter.
              </p>
              <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-white text-[#01ae79] hover:bg-white/95 px-10 py-6 text-lg font-semibold rounded-lg shadow-xl"
                  >
                    Create a profile — free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-lg font-semibold rounded-lg border-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    Talk to us
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

function Principle({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl p-7 border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#01ae79]/30 hover:shadow-md transition-all">
      <div className="w-11 h-11 rounded-xl bg-[#01ae79]/10 text-[#01ae79] flex items-center justify-center mb-5">
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
