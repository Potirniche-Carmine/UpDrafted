import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Users, ArrowRight } from "lucide-react";
import { AuthWrapper } from "../../components/auth-wrapper";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.home();

function HomePageContent() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Mobile Profile Screenshots - Vertical for mobile only */}
        <div className="absolute inset-0 pointer-events-none sm:hidden">
          {/* Mobile Athlete Profile Screenshot - Right Side */}
          <div className="absolute right-[-80px] top-20 transform rotate-12 opacity-[0.15] dark:opacity-[0.18]">
            <Image
              src="/hero/athlete-light-mobile.png"
              alt="Athlete Profile Mobile"
              width={200}
              height={350}
              className="w-[200px] h-auto rounded-2xl shadow-2xl block dark:hidden"
              priority={true}
              quality={75}
            />
            <Image
              src="/hero/athlete-dark-mobile.png"
              alt="Athlete Profile Mobile Dark"
              width={200}
              height={350}
              className="w-[200px] h-auto rounded-2xl shadow-2xl hidden dark:block"
              priority={true}
              quality={75}
            />
          </div>

          {/* Mobile Coach Dashboard Screenshot - Left Side */}
          <div className="absolute left-[-60px] bottom-32 transform -rotate-8 opacity-[0.15] dark:opacity-[0.18]">
            <Image
              src="/hero/coach-light-mobile.png"
              alt="Coach Dashboard Mobile"
              width={180}
              height={300}
              className="w-[180px] h-auto rounded-2xl shadow-2xl block dark:hidden"
              priority={true}
              quality={75}
            />
            <Image
              src="/hero/coach-dark-mobile.png"
              alt="Coach Dashboard Mobile Dark"
              width={180}
              height={300}
              className="w-[180px] h-auto rounded-2xl shadow-2xl hidden dark:block"
              priority={true}
              quality={75}
            />
          </div>
        </div>

        {/* Desktop Background Screenshots - Hidden on mobile */}
                {/* Desktop Profile Screenshots - Hidden on mobile, shown on larger screens */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          {/* Desktop Athlete Profile Screenshot */}
          <div className="absolute right-[-32%] top-16 transform rotate-6 opacity-[0.35] dark:opacity-[0.35]">
            <Image
              src="/hero/athlete-light-desktop.png"
              alt="Athlete Profile Desktop"
              width={800}
              height={500}
              className="w-[500px] h-auto sm:w-[600px] md:w-[700px] lg:w-[800px] rounded-2xl shadow-2xl block dark:hidden"
              priority={true}
              quality={75}
            />
            <Image
              src="/hero/athlete-dark-desktop.png"
              alt="Athlete Profile Desktop Dark"
              width={800}
              height={500}
              className="w-[500px] h-auto sm:w-[600px] md:w-[700px] lg:w-[800px] rounded-2xl shadow-2xl hidden dark:block"
              priority={true}
              quality={75}
            />
          </div>

          {/* Desktop Coach Dashboard Screenshot */}
          <div className="absolute left-[-175px] bottom-10 transform -rotate-4 opacity-[0.35] dark:opacity-[0.38]">
            <Image
              src="/hero/coach-light-desktop.png"
              alt="Coach Dashboard Desktop"
              width={700}
              height={450}
              className="w-[400px] h-auto sm:w-[500px] md:w-[600px] lg:w-[700px] rounded-2xl shadow-2xl block dark:hidden"
              priority={true}
              quality={75}
            />
            <Image
              src="/hero/coach-dark-desktop.png"
              alt="Coach Dashboard Desktop Dark"
              width={700}
              height={450}
              className="w-[400px] h-auto sm:w-[500px] md:w-[600px] lg:w-[700px] rounded-2xl shadow-2xl hidden dark:block"
              priority={true}
              quality={75}
            />
          </div>
        </div>
        
        <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-8">
            {/* Main Tagline */}
            <div className="space-y-4 px-4 sm:px-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-gray-900 dark:text-white">Your talent.</span><br />
                <span className="text-gray-600 dark:text-gray-300">Their radar.</span><br />
                <span className="text-[#01ae79]">Our platform.</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-light">
                For high school, college transfer, JUCO, and international athletes. One unified profile with all your achievements and direct connections to coaches.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 justify-center items-center pt-8 px-4 sm:px-0">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white px-8 py-3 text-lg font-semibold rounded-lg w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="/for-athletes" className="flex-1 sm:flex-none">
                  <Button variant="outline" size="lg" className="px-6 py-3 text-sm sm:text-base font-semibold rounded-lg border-2 w-full sm:w-auto">
                    For Athletes
                  </Button>
                </Link>
                <Link href="/for-coaches" className="flex-1 sm:flex-none">
                  <Button variant="outline" size="lg" className="px-6 py-3 text-sm sm:text-base font-semibold rounded-lg border-2 w-full sm:w-auto">
                    For Coaches
                  </Button>
                </Link>
                <Link href="/for-recruiters" className="flex-1 sm:flex-none">
                  <Button variant="outline" size="lg" className="px-6 py-3 text-sm sm:text-base font-semibold rounded-lg border-2 w-full sm:w-auto">
                    For Recruiters
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 sm:gap-8 pt-12 text-sm text-black dark:text-gray-400 px-4 sm:px-0">
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
            <div className="flex animate-scroll space-x-4 sm:space-x-6 items-center">
              {/* Sports with professional styling */}
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Football</span>
              </div>
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Basketball</span>
              </div>
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Baseball</span>
              </div>
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Softball</span>
              </div>
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Soccer</span>
              </div>
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[110px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Track & Field</span>
              </div>
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Swimming</span>
              </div>
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Tennis</span>
              </div>
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Volleyball</span>
              </div>
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Lacrosse</span>
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Football</span>
              </div>
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Basketball</span>
              </div>
              <div className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-3 sm:px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[100px] sm:min-w-[140px]">
                <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Baseball</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 sm:py-16 md:py-24">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Three Simple Steps
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-4 sm:px-0">
              Get discovered by college programs in minutes, not months
            </p>
          </div>

          <div className="grid gap-8 sm:gap-12 md:grid-cols-3">
            <div className="text-center px-4 sm:px-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#01ae79] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">Complete Onboarding</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Get verified through Hudl (high school athletes) or our manual verification process (college transfers, JUCO, international athletes).
              </p>
            </div>
            <div className="text-center px-4 sm:px-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#01ae79] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">Build Your Complete Profile</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Add ESPN rankings, 247 Sports, social media, highlights, and stats. Make it easy for coaches to find everything.
              </p>
            </div>
            <div className="text-center px-4 sm:px-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#01ae79] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">Connect & Chat</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Message verified coaches and recruiters directly. No more cold emails or waiting for responses.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Final CTA Section */}
      <section className="w-full py-16 sm:py-20 md:py-32 bg-gray-50 dark:bg-gray-900/50">
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