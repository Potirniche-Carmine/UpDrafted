import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Search, Shield, Users, MessageCircle, Link2, ArrowRight, Ruler } from "lucide-react";
import { AuthWrapper } from "../../components/auth-wrapper";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.home();

function HomePageContent() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Background Screenshots - Positioned subtly */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Athlete Profile Screenshot - Right Side */}
          <div className="absolute right-[-100px] top-8 md:right-[-50px] md:top-16 lg:right-0 lg:top-20 transform rotate-12 opacity-[0.3] dark:opacity-[0.4]">
            <div className="w-[400px] h-[600px] md:w-[500px] md:h-[750px] lg:w-[600px] lg:h-[900px] bg-gradient-to-br from-[#01ae79]/20 to-gray-200 dark:from-[#01ae79]/30 dark:to-gray-700 rounded-2xl shadow-2xl">
              {/* Placeholder for athlete profile screenshot */}
              <div className="p-6 space-y-4">
                <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                <div className="space-y-2 pt-4">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Coach Dashboard/Search Interface - Left Side */}
          <div className="absolute left-[-150px] bottom-8 md:left-[-100px] md:bottom-16 lg:left-[-50px] lg:bottom-20 transform -rotate-6 opacity-[0.2] dark:opacity-[0.3]">
            <div className="w-[350px] h-[500px] md:w-[400px] md:h-[600px] lg:w-[450px] lg:h-[650px] bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-600 rounded-2xl shadow-2xl">
              {/* Placeholder for coach interface screenshot */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-700 rounded">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
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
              {/* Sports with professional styling */}
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Football</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Basketball</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Baseball</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Softball</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Soccer</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Track & Field</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Swimming</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Tennis</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Volleyball</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Lacrosse</span>
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Football</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Basketball</span>
              </div>
              <div className="flex-shrink-0 h-14 flex items-center justify-center px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[140px]">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Baseball</span>
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
      <section className="w-full py-16 md:py-24">
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
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                  <Link2 className="h-6 w-6 text-[#01ae79]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Centralized Profile</h3>
                <p className="text-muted-foreground">
                  Hudl highlights, ESPN rankings, 247 Sports, social media, and stats all in one place. Coaches don&apos;t have to hunt for your information.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-[#01ae79]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Easy Discovery</h3>
                <p className="text-muted-foreground">
                  Athletes get found by the right programs. Coaches find talent that fits their needs. No more missed connections.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-[#01ae79]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Streamlined Communication</h3>
                <p className="text-muted-foreground">
                  Direct messaging keeps all conversations organized. Coaches can track their recruitment efforts in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-[#01ae79]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Flexible Verification</h3>
                <p className="text-muted-foreground">
                  Hudl verification for high school athletes, manual verification for college transfers, JUCO, and international athletes. Everyone gets verified.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                  <Ruler className="h-6 w-6 text-[#01ae79]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Complete Athletic Picture</h3>
                <p className="text-muted-foreground">
                  Stats, measurables, rankings, and highlights give coaches everything they need to evaluate talent efficiently.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-[#01ae79]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Free to Start</h3>
                <p className="text-muted-foreground">
                  Try the platform completely free. Upgrade to premium for more connection requests when you&apos;re ready to get serious.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="h-8 w-8 text-[#01ae79]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Ready to Get Recruited?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto">
                Join high school, college transfer, JUCO, and international athletes making their next move. Coaches and recruiters are here too.
              </p>
              <div className="pt-4">
                <Link href="/sign-up">
                  <Button size="lg" className="px-10 py-4 text-lg font-semibold bg-[#01ae79] hover:bg-[#01ae79]/90 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                    Start Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-6 pt-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#01ae79]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#01ae79]" />
                  <span>Free to explore</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#01ae79]" />
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