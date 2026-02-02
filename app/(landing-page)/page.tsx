import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Users, ArrowRight } from "lucide-react";
import { AuthWrapper } from "../../components/auth-wrapper";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.home();

function HomePageContent() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 2xl:py-40 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 pointer-events-none"></div>

        <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-8">
            {/* Brand Slogan */}
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-tight">
                <span className="text-gray-900 dark:text-white">UpDrafted</span>
                <br />
                <span className="text-6xl text-[#01ae79]">Aim Higher</span>
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
                The only free recruiting platform connecting athletes to the higher level.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
                Built for high school, college transfer, JUCO, and international athletes ready to take their game to the next level
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 lg:gap-5 justify-center items-center pt-8 lg:pt-10 px-4 sm:px-0">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white px-8 sm:px-10 md:px-12 py-3 sm:py-4 text-lg sm:text-xl md:text-2xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="/for-athletes" className="flex-1 sm:flex-none">
                  <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg border-2 w-full sm:w-auto hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    For Athletes
                  </Button>
                </Link>
                <Link href="/for-coaches" className="flex-1 sm:flex-none">
                  <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg border-2 w-full sm:w-auto hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    For Coaches
                  </Button>
                </Link>
                <Link href="/for-recruiters" className="flex-1 sm:flex-none">
                  <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg border-2 w-full sm:w-auto hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    For Recruiters
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 pt-12 lg:pt-14 text-sm sm:text-base text-black dark:text-gray-400 px-4 sm:px-0">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#01ae79]" />
                <span>Free to Try & Explore</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[#01ae79]" />
                <span>Flexible Verification Options</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#01ae79]" />
                <span>All Athletes, Coaches & Recruiters</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Carousel */}
      <section className="w-full py-8 sm:py-12 lg:py-16 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <p className="text-center text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 lg:mb-12">
            Supporting athletes across all major sports
          </p>
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-3 sm:space-x-4 md:space-x-6 lg:space-x-8 items-center">
              {/* Sports with professional styling */}
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Football</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Basketball</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Baseball</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Softball</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Soccer</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[130px] md:min-w-[150px] lg:min-w-[170px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Track & Field</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Swimming</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Tennis</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Volleyball</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Lacrosse</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Wrestling</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Golf</span>
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Football</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Basketball</span>
              </div>
              <div className="flex-shrink-0 h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Baseball</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Three Simple Steps
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 px-4 sm:px-0 max-w-3xl mx-auto">
              Get discovered by college programs in minutes, not months
            </p>
          </div>

          <div className="grid gap-8 sm:gap-12 md:grid-cols-3">
            <div className="text-center px-4 sm:px-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 bg-[#01ae79] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3">Complete Onboarding</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Get verified through Hudl (high school athletes) or our manual verification process (college transfers, JUCO, international athletes).
              </p>
            </div>
            <div className="text-center px-4 sm:px-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 bg-[#01ae79] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3">Build Your Complete Profile</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Add ESPN rankings, 247 Sports, social media, highlights, and stats. Make it easy for coaches to find everything.
              </p>
            </div>
            <div className="text-center px-4 sm:px-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 bg-[#01ae79] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3">Connect & Chat</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Message verified coaches and recruiters directly. No more cold emails or waiting for responses.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Final CTA Section */}
      <section className="w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 md:p-12 text-center">
            <div className="space-y-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8 text-[#01ae79]" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Ready to Get Recruited?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto px-4 sm:px-0">
                Join high school, college transfer, JUCO, and international athletes making their next move. Coaches and recruiters are here too.
              </p>
              <div className="pt-4">
                <Link href="/sign-up">
                  <Button size="lg" className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-[#01ae79] hover:bg-[#01ae79]/90 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto">
                    Start Free Today
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 sm:gap-6 pt-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-[#01ae79]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-[#01ae79]" />
                  <span>Free to explore</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-[#01ae79]" />
                  <span>Premium features when ready</span>
                </div>
              </div>
            </div>
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