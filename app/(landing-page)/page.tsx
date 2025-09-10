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
      <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 2xl:py-40 overflow-hidden">
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
        <div className="absolute inset-0 pointer-events-none hidden sm:block overflow-hidden">
          {/* Desktop Athlete Profile Screenshot */}
          <div className="absolute right-[-50%] sm:right-[-45%] md:right-[-40%] lg:right-[-35%] xl:right-[-30%] 2xl:right-[-30%] top-8 sm:top-12 md:top-16 lg:top-20 xl:top-24 transform rotate-2 sm:rotate-3 md:rotate-4 opacity-[0.12] sm:opacity-[0.15] md:opacity-[0.18] lg:opacity-[0.20] dark:opacity-[0.15] dark:sm:opacity-[0.18] dark:md:opacity-[0.20] dark:lg:opacity-[0.22]">
            <Image
              src="/hero/athlete-light-desktop.png"
              alt="Athlete Profile Desktop"
              width={800}
              height={500}
              className="w-[350px] h-auto sm:w-[450px] md:w-[550px] lg:w-[650px] xl:w-[750px] 2xl:w-[850px] rounded-lg sm:rounded-xl shadow-xl block dark:hidden"
              priority={true}
              quality={70}
            />
            <Image
              src="/hero/athlete-dark-desktop.png"
              alt="Athlete Profile Desktop Dark"
              width={800}
              height={500}
              className="w-[350px] h-auto sm:w-[450px] md:w-[550px] lg:w-[650px] xl:w-[750px] 2xl:w-[850px] rounded-lg sm:rounded-xl shadow-xl hidden dark:block"
              priority={true}
              quality={70}
            />
          </div>

          {/* Desktop Coach Dashboard Screenshot */}
          <div className="absolute left-[-45%] sm:left-[-40%] md:left-[-35%] lg:left-[-30%] xl:left-[-25%] 2xl:left-[-20%] bottom-4 sm:bottom-6 md:bottom-10 lg:bottom-12 xl:bottom-16 transform -rotate-1 sm:-rotate-2 md:-rotate-3 opacity-[0.12] sm:opacity-[0.15] md:opacity-[0.18] lg:opacity-[0.20] dark:opacity-[0.15] dark:sm:opacity-[0.18] dark:md:opacity-[0.20] dark:lg:opacity-[0.22]">
            <Image
              src="/hero/coach-light-desktop.png"
              alt="Coach Dashboard Desktop"
              width={700}
              height={450}
              className="w-[300px] h-auto sm:w-[380px] md:w-[460px] lg:w-[540px] xl:w-[620px] 2xl:w-[700px] rounded-lg sm:rounded-xl shadow-xl block dark:hidden"
              priority={true}
              quality={70}
            />
            <Image
              src="/hero/coach-dark-desktop.png"
              alt="Coach Dashboard Desktop Dark"
              width={700}
              height={450}
              className="w-[300px] h-auto sm:w-[380px] md:w-[460px] lg:w-[540px] xl:w-[620px] 2xl:w-[700px] rounded-lg sm:rounded-xl shadow-xl hidden dark:block"
              priority={true}
              quality={70}
            />
          </div>
        </div>
        
        <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-8">
            {/* Main Tagline */}
            <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight">
                <span className="text-gray-900 dark:text-white">Your talent.</span><br />
                <span className="text-gray-600 dark:text-gray-300">Their radar.</span><br />
                <span className="text-[#01ae79]">Our platform.</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 max-w-3xl lg:max-w-4xl mx-auto font-light leading-relaxed">
                For high school, college transfer, JUCO, and international athletes. One unified profile with all your achievements and direct connections to coaches.
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