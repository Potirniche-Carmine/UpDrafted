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
      <section className="relative w-full py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Mobile Profile Screenshots - Vertical for mobile only */}
        <div className="absolute inset-0 pointer-events-none sm:hidden">
          {/* Mobile Profile Screenshot - Right Side */}
          <div className="absolute right-[-80px] top-20 transform rotate-12 opacity-[0.4] dark:opacity-[0.45]">
            <div className="w-[200px] h-[350px] bg-gradient-to-br from-[#01ae79]/20 to-gray-200 dark:from-[#01ae79]/30 dark:to-gray-700 rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-600">
              {/* Mobile Profile Layout */}
              <div className="p-4 space-y-4">
                {/* Profile Header */}
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 bg-[#01ae79]/30 dark:bg-[#01ae79]/40 rounded-full mx-auto"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mx-auto"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded text-center">
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                    <div className="h-3 bg-[#01ae79]/40 rounded"></div>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded text-center">
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                    <div className="h-3 bg-[#01ae79]/40 rounded"></div>
                  </div>
                </div>
                
                {/* Bio Section */}
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  <div className="h-8 bg-[#01ae79]/20 dark:bg-[#01ae79]/30 rounded"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                
                {/* Bottom Stats */}
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-center">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                    <div className="h-3 bg-[#01ae79]/30 rounded"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                    <div className="h-3 bg-[#01ae79]/30 rounded"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                    <div className="h-3 bg-[#01ae79]/30 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Chat/Messages Screenshot - Left Side */}
          <div className="absolute left-[-60px] bottom-32 transform -rotate-8 opacity-[0.35] dark:opacity-[0.4]">
            <div className="w-[180px] h-[300px] bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-600 rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-600">
              {/* Mobile Messages Layout */}
              <div className="p-3 space-y-3">
                {/* Header */}
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-300 dark:border-gray-600">
                  <div className="w-6 h-6 bg-[#01ae79]/30 rounded-full"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
                
                {/* Message Bubbles */}
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <div className="w-24 h-6 bg-[#01ae79]/20 rounded-lg"></div>
                  </div>
                  <div className="flex justify-start">
                    <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-28 h-8 bg-[#01ae79]/20 rounded-lg"></div>
                  </div>
                  <div className="flex justify-start">
                    <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-22 h-6 bg-[#01ae79]/20 rounded-lg"></div>
                  </div>
                </div>
                
                {/* Input Area */}
                <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                  <div className="h-8 bg-white/50 dark:bg-gray-700/50 rounded border"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Background Screenshots - Hidden on mobile */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          {/* Athlete Profile Screenshot - Right Side */}
          <div className="absolute right-[-150px] top-16 md:right-[-100px] md:top-20 lg:right-[-50px] lg:top-24 transform rotate-6 opacity-[0.25] sm:opacity-[0.35] dark:opacity-[0.35] dark:sm:opacity-[0.4]">
            <div className="w-[500px] h-[350px] sm:w-[600px] sm:h-[400px] md:w-[700px] md:h-[450px] lg:w-[800px] lg:h-[500px] bg-gradient-to-br from-[#01ae79]/20 to-gray-200 dark:from-[#01ae79]/30 dark:to-gray-700 rounded-2xl shadow-2xl">
              {/* Horizontal Athlete Profile Layout */}
              <div className="p-6 flex">
                {/* Left side - Profile photo and basic info */}
                <div className="flex-shrink-0 space-y-3 mr-6">
                  <div className="w-24 h-24 bg-[#01ae79]/30 dark:bg-[#01ae79]/40 rounded-full"></div>
                  <div className="w-32">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
                {/* Right side - Stats and info */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                      <div className="h-4 bg-[#01ae79]/40 rounded"></div>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                      <div className="h-4 bg-[#01ae79]/40 rounded"></div>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                      <div className="h-4 bg-[#01ae79]/40 rounded"></div>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                      <div className="h-4 bg-[#01ae79]/40 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coach Dashboard/Search Interface - Left Side */}
          <div className="absolute left-[-200px] bottom-16 md:left-[-150px] md:bottom-20 lg:left-[-100px] lg:bottom-24 transform -rotate-3 opacity-[0.15] sm:opacity-[0.25] dark:opacity-[0.25] dark:sm:opacity-[0.3]">
            <div className="w-[400px] h-[300px] sm:w-[500px] sm:h-[350px] md:w-[600px] md:h-[400px] lg:w-[700px] lg:h-[450px] bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-600 rounded-2xl shadow-2xl">
              {/* Horizontal Coach Dashboard Layout */}
              <div className="p-4 h-full flex">
                {/* Left sidebar - filters/navigation */}
                <div className="w-32 space-y-2 mr-4">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-8 bg-white/70 dark:bg-gray-700/70 rounded"></div>
                  <div className="h-8 bg-white/70 dark:bg-gray-700/70 rounded"></div>
                  <div className="h-8 bg-white/70 dark:bg-gray-700/70 rounded"></div>
                </div>
                {/* Main content - athlete cards in grid */}
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="grid grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white/80 dark:bg-gray-700/80 p-2 rounded">
                        <div className="w-8 h-8 bg-[#01ae79]/30 rounded-full mx-auto mb-1"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-full mb-1"></div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 sm:gap-8 pt-12 text-sm text-gray-500 dark:text-gray-400 px-4 sm:px-0">
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