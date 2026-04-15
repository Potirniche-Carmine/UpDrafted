import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Target, Users, Search, Shield, CheckCircle } from 'lucide-react';
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.forRecruiters();

export default function ForRecruitersPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-background via-background to-[#01ae79]/5 dark:to-[#01ae79]/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="outline" className="w-fit bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30 mx-auto">
              <Target className="w-4 h-4 mr-2" />
              For Recruiters
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
              Recruit Across{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                Multiple Sports
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              Unlike coaches who focus on one sport, recruiters need to find talent across multiple programs. UpDrafted is your centralized hub for discovering athletes in all sports with complete profiles in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Multi-Sport Recruiting Hub</h3>
                      <p className="text-muted-foreground">
                        Unlike coaches who focus on one sport, you recruit across multiple programs. One profile gives you access to football, basketball, soccer, track, and every sport your institution needs.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <Search className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Complete Athlete Profiles</h3>
                      <p className="text-muted-foreground">
                        Everything you need in one place - Hudl highlights, ESPN rankings, 247 Sports, social media, stats, and contact info. No more jumping between platforms to evaluate talent.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Institutional Representation</h3>
                      <p className="text-muted-foreground">
                        Establish your profile as an official school representative. Display the sports programs you recruit for, get verified, and build trust with prospects and their families.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Organized Communication</h3>
                      <p className="text-muted-foreground">
                        Manage all recruiting conversations across multiple sports in one platform. Track your pipeline and never lose touch with prospects in any sport.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-[#01ae79]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Start Your Multi-Sport Recruiting
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto">
                Join recruiters using UpDrafted to find talent across every sport. One platform, unlimited possibilities.
              </p>
              <div className="pt-4">
                <Link href="/sign-up">
                  <Button size="lg" className="px-12 py-4 text-lg font-semibold bg-[#01ae79] hover:bg-[#01ae79]/90 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                    Start Recruiting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-6 pt-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#01ae79]" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#01ae79]" />
                  <span>Multi-sport recruiting</span>
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