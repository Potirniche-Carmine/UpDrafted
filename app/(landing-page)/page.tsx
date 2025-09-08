import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Search, Shield, Users, MessageCircle, Link2, ArrowRight, Ruler } from "lucide-react";
import { AuthWrapper } from "../../components/auth-wrapper";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.home();

function HomePageContent() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="text-center space-y-8">
            {/* Main Tagline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-gray-900 dark:text-white">Your talent.</span><br />
                <span className="text-gray-600 dark:text-gray-300">Their radar.</span><br />
                <span className="text-[#01ae79]">Our platform.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-light">
                For high school, college transfer, JUCO, and international athletes. One unified profile with all your achievements and direct connections to coaches.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/sign-up">
                <Button size="lg" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white px-8 py-3 text-lg font-semibold rounded-lg">
                  Get Started Free
                </Button>
              </Link>
              <div className="flex gap-2">
                <Link href="/for-athletes">
                  <Button variant="outline" size="lg" className="px-6 py-3 text-base font-semibold rounded-lg border-2">
                    For Athletes
                  </Button>
                </Link>
                <Link href="/for-coaches">
                  <Button variant="outline" size="lg" className="px-6 py-3 text-base font-semibold rounded-lg border-2">
                    For Coaches
                  </Button>
                </Link>
                <Link href="/for-recruiters">
                  <Button variant="outline" size="lg" className="px-6 py-3 text-base font-semibold rounded-lg border-2">
                    For Recruiters
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-12 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#01ae79]" />
                <span>Free to Try & Explore</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#01ae79]" />
                <span>Flexible Verification Options</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#01ae79]" />
                <span>All Athletes, Coaches & Recruiters</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Carousel */}
      <section className="w-full py-12 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="container px-4 md:px-6 mx-auto">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            Supporting athletes across all major sports
          </p>
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-6 items-center">
              {/* Sports with icons/styling */}
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">🏈 Football</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">🏀 Basketball</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">⚾ Baseball</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">🥎 Softball</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">⚽ Soccer</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">🏃 Track & Field</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">🏊 Swimming</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">🎾 Tennis</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">🏐 Volleyball</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">🥍 Lacrosse</span>
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">🏈 Football</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">🏀 Basketball</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">⚾ Baseball</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Three Simple Steps
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get discovered by college programs in minutes, not months
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#01ae79] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Complete Onboarding</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get verified through Hudl (high school athletes) or our manual verification process (college transfers, JUCO, international athletes).
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#01ae79] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Build Your Complete Profile</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add ESPN rankings, 247 Sports, social media, highlights, and stats. Make it easy for coaches to find everything.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#01ae79] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Connect & Chat</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Message verified coaches and recruiters directly. No more cold emails or waiting for responses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Making Life Easier for Everyone
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Athletes get discovered. Coaches find talent faster. Everything centralized in one place.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                <Link2 className="h-6 w-6 text-[#01ae79]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Centralized Profile</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Hudl highlights, ESPN rankings, 247 Sports, social media, and stats all in one place. Coaches don&apos;t have to hunt for your information.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-[#01ae79]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Easy Discovery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Athletes get found by the right programs. Coaches find talent that fits their needs. No more missed connections.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-[#01ae79]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Streamlined Communication</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Direct messaging keeps all conversations organized. Coaches can track their recruitment efforts in one place.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-[#01ae79]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Flexible Verification</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Hudl verification for high school athletes, manual verification for college transfers, JUCO, and international athletes. Everyone gets verified.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                <Ruler className="h-6 w-6 text-[#01ae79]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Complete Athletic Picture</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Stats, measurables, rankings, and highlights give coaches everything they need to evaluate talent efficiently.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-[#01ae79]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Free to Start</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try the platform completely free. Upgrade to premium for more connection requests when you&apos;re ready to get serious.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-20 md:py-32 bg-[#01ae79]">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl text-center">
          <div className="space-y-8 text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Ready to Get Recruited?
            </h2>
            <p className="text-xl md:text-2xl opacity-90 font-light">
              Join high school, college transfer, JUCO, and international athletes making their next move. Coaches and recruiters are here too.
            </p>
            <div className="pt-4">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="px-10 py-4 text-lg font-semibold bg-white text-[#01ae79] hover:bg-gray-100 rounded-lg">
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm opacity-75 pt-4">
              No credit card required • Free to explore • Premium features available when you&apos;re ready
            </p>
          </div>
        </div>
      </section>
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