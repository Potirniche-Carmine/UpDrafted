import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Search, Users, TrendingUp, Star, Shield, Zap, CheckCircle, Award, Globe, Target } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background via-background to-emerald-50/30 dark:to-emerald-950/20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <Badge variant="outline" className="w-fit bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                  <Star className="w-4 h-4 mr-2" />
                  The Future of College Sports Recruiting
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                  Connect. Showcase.{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400">
                    Get Recruited.
                  </span>
                </h1>
                <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
                  The premier platform connecting student-athletes with college programs across NCAA D1, D2, D3, and JUCO divisions. Your athletic journey starts here.
                </p>
              </div>
              
              <div className="flex justify-start">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white group px-12 py-4 text-lg">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Verified profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Nationwide reach</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl p-8 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="text-center space-y-6">
                  <Target className="h-16 w-16 text-emerald-600 dark:text-emerald-400 mx-auto opacity-80" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Elevate Your Recruiting Game</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Join the platform where talent meets opportunity. Connect with college programs that match your athletic and academic goals.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-emerald-100 dark:border-emerald-900">
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">All Divisions</div>
                      <div className="text-xs text-muted-foreground">D1, D2, D3, JUCO</div>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-emerald-100 dark:border-emerald-900">
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Direct Connect</div>
                      <div className="text-xs text-muted-foreground">Athletes & Coaches</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-50/50 to-emerald-50/30 dark:from-slate-950/50 dark:to-emerald-950/20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              How UpDrafted Works
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
              Three simple steps to transform your recruiting journey
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">1</span>
              </div>
              <h3 className="text-xl font-semibold">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Build a comprehensive athletic profile showcasing your highlights, achievements, and academic information
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">2</span>
              </div>
              <h3 className="text-xl font-semibold">Get Discovered</h3>
              <p className="text-muted-foreground">
                College coaches and recruiters find you through our advanced search and matching system
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">3</span>
              </div>
              <h3 className="text-xl font-semibold">Make Connections</h3>
              <p className="text-muted-foreground">
                Connect directly with programs that match your goals and academic interests
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
              Built for Success
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
              Everything you need to take your athletic career to the next level
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-4" />
                <CardTitle>Comprehensive Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Showcase highlights, academic achievements, and personal statements in one professional profile
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Search className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-4" />
                <CardTitle>Advanced Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Powerful filtering by sport, division, position, academics, and location for perfect matches
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-4" />
                <CardTitle>Verified Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manual verification system and MaxPreps profile linking ensures authentic athlete and coach profiles
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="h-10 w-10 text-amber-600 dark:text-amber-400 mb-4" />
                <CardTitle>Instant Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Direct messaging and connection system streamlines communication between athletes and programs
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
                <CardTitle>Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitor profile views, connections, and recruiting activity with detailed analytics
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Award className="h-10 w-10 text-orange-600 dark:text-orange-400 mb-4" />
                <CardTitle>All Divisions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with NCAA D1, D2, D3, and JUCO programs nationwide for maximum opportunities
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose UpDrafted */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-50/50 to-emerald-50/30 dark:from-slate-950/50 dark:to-emerald-950/20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Why Choose UpDrafted?
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
              The advantages that set us apart from traditional recruiting methods
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold">100% Free Platform</div>
                    <div className="text-sm text-muted-foreground">No hidden costs</div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Create your profile, connect with programs, and access all features without any fees. We believe talent shouldn&apos;t be limited by budget.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Verified Profiles</div>
                    <div className="text-sm text-muted-foreground">Manual verification & MaxPreps linking</div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Our manual verification process and MaxPreps profile linking ensures authentic profiles, giving coaches confidence and athletes credibility.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <Globe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold">All Division Levels</div>
                    <div className="text-sm text-muted-foreground">D1, D2, D3, and JUCO programs</div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Connect with programs across all NCAA divisions and NJCAA, ensuring you find the right academic and athletic fit for your goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 dark:from-emerald-700 dark:via-emerald-800 dark:to-green-800">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-8 text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready to Take the Next Step?
            </h2>
            <p className="max-w-3xl mx-auto text-lg opacity-90">
              Join thousands of student-athletes and college programs already using UpDrafted to make meaningful connections and build successful futures.
            </p>
            <div className="flex justify-center">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="px-12 py-4 text-xl group bg-white text-emerald-700 hover:bg-gray-100">
                  Create Your Profile
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