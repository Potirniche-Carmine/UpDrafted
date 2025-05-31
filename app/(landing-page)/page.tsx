import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Globe, Search, Shield, Target, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background via-background to-[#01ae79]/5 dark:to-[#01ae79]/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <Badge variant="outline" className="w-fit bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30 mx-auto">
                  <Target className="w-4 h-4 mr-2" />
                  Elite Athletic Recruiting
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                  Connect. Showcase.{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                    Get Recruited.
                  </span>
                </h1>
                <div className="text-2xl md:text-3xl font-semibold text-[#01ae79] mb-2">
                  Your Talent. Their Radar. Our Platform.
                </div>
                <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
                  UpDrafted is the premier platform connecting student-athletes with college programs. Showcase your achievements, connect directly with recruiters, and take the next step in your athletic journey.
                </p>
              </div>
              
              <div className="flex justify-start">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white group px-12 py-4 text-lg">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#01ae79]" />
                  <span className="text-sm text-muted-foreground">Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#01ae79]" />
                  <span className="text-sm text-muted-foreground">Verified programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#01ae79]" />
                  <span className="text-sm text-muted-foreground">All divisions</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-[#01ae79]/5 to-[#01ae79]/10 dark:from-[#01ae79]/10 dark:to-[#01ae79]/20 rounded-2xl p-8 backdrop-blur-sm border border-[#01ae79]/20 dark:border-[#01ae79]/30">
                <div className="text-center space-y-6">
                  <Target className="h-16 w-16 text-[#01ae79] mx-auto opacity-80" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Connect Across All Divisions</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      From D1 powerhouses to NAIA programs, find your perfect fit.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-[#01ae79]/20 dark:border-[#01ae79]/30">
                      <div className="text-lg font-bold text-[#01ae79]">All Divisions</div>
                      <div className="text-xs text-muted-foreground">D1, D2, D3, NAIA, NJCAA</div>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-[#01ae79]/20 dark:border-[#01ae79]/30">
                      <div className="text-lg font-bold text-[#01ae79]">Direct Connect</div>
                      <div className="text-xs text-muted-foreground">Message coaches directly</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-50/50 to-[#01ae79]/5 dark:from-slate-950/50 dark:to-[#01ae79]/10">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              How It Works
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
              Three simple steps to connect with your dream program
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-[#01ae79]">1</span>
              </div>
              <h3 className="text-xl font-semibold">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Build a comprehensive athletic profile with stats, videos, and achievements
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-[#01ae79]">2</span>
              </div>
              <h3 className="text-xl font-semibold">Get Discovered</h3>
              <p className="text-muted-foreground">
                College coaches and recruiters browse profiles and reach out to prospects
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-[#01ae79]">3</span>
              </div>
              <h3 className="text-xl font-semibold">Make Connections</h3>
              <p className="text-muted-foreground">
                Connect directly with coaches through our secure messaging platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Why Choose UpDrafted?
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
              The most comprehensive platform for student-athlete recruitment
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Users className="h-10 w-10 text-[#01ae79] mb-4" />
                <CardTitle>Verified Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with verified college coaches and legitimate recruiting programs only
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Search className="h-10 w-10 text-[#01ae79] mb-4" />
                <CardTitle>Advanced Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Smart algorithms match you with programs that fit your academic and athletic profile
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Shield className="h-10 w-10 text-[#01ae79] mb-4" />
                <CardTitle>Safe & Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Robust privacy controls and moderation keep your information safe and secure
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-50/50 to-[#01ae79]/5 dark:from-slate-950/50 dark:to-[#01ae79]/10">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools to showcase your talent and connect with opportunities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="relative overflow-hidden border-border/50 hover:border-[#01ae79]/30 transition-colors group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-[#01ae79]" />
                </div>
                <CardTitle className="text-xl">Complete Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Showcase stats, achievements, videos, and academic information in one comprehensive profile.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="relative overflow-hidden border-border/50 hover:border-[#01ae79]/30 transition-colors group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-[#01ae79]" />
                </div>
                <CardTitle className="text-xl">Verified Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect only with legitimate, verified college coaches and recruiting programs.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="relative overflow-hidden border-border/50 hover:border-[#01ae79]/30 transition-colors group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-[#01ae79]" />
                </div>
                <CardTitle className="text-xl">All Divisions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access opportunities across D1, D2, D3, NAIA, and NJCAA programs nationwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-r from-[#01ae79] via-[#01ae79]/90 to-[#01ae79]/80">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-8 text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready to Get Recruited?
            </h2>
            <p className="max-w-3xl mx-auto text-lg opacity-90">
              Join thousands of student-athletes who have found their perfect college match through UpDrafted.
            </p>
            <div className="flex justify-center">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="px-12 py-4 text-xl group bg-white text-[#01ae79] hover:bg-gray-100">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <p className="text-sm opacity-75">
              Free to join • No hidden fees • Start connecting today
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}