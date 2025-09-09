"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Navigation, Shield, Eye, Gift, Users, ExternalLink, Target, CheckCircle } from 'lucide-react';

export default function ForCoachesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-background via-background to-[#01ae79]/5 dark:to-[#01ae79]/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="outline" className="w-fit bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30 mx-auto">
              <Users className="w-4 h-4 mr-2" />
              For Coaches
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
              Find Talent in{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                One Place
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              Stop searching multiple platforms for athlete information. UpDrafted centralizes everything - Hudl highlights, stats, rankings, social media, and contact info - in one unified profile. Your one-stop shop for recruiting.
            </p>
          </div>
        </div>
      </section>

      {/* Recruiter Notice Section */}
      <section className="w-full py-8 md:py-12 bg-gradient-to-br from-slate-50/50 to-emerald-50/30 dark:from-slate-950/50 dark:to-emerald-950/20">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">
                    Are you a College Coach focused on Recruiting?
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                    While creating your verified coach profile here is a great step, our dedicated Recruiter Platform offers the best tools for discovering, evaluating, and connecting with prospective student-athletes.
                  </p>
                  <Link href="/for-recruiters">
                    <Button variant="outline" size="sm" className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50">
                      Explore Recruiter Tools <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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
                      <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">All Athlete Info in One View</h3>
                      <p className="text-muted-foreground">
                        See everything about a prospect in one place - Hudl highlights, ESPN rankings, 247 Sports profiles, social media, stats, and contact information. No more hunting across multiple platforms.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <Navigation className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Streamlined Communication</h3>
                      <p className="text-muted-foreground">
                        Direct messaging with verified athletes. Keep all recruiting conversations organized in one platform instead of scattered across emails and social media.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <Eye className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Get Your Verified Profile</h3>
                      <p className="text-muted-foreground">
                        Build trust with athletes and families through verification. Athletes can easily find and connect with verified coaches for their sport.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <Gift className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Free to Start</h3>
                      <p className="text-muted-foreground">
                        Try the platform free and see how much easier recruiting becomes when everything is centralized. Upgrade for more connections when you&apos;re ready.
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
                <Target className="h-8 w-8 text-[#01ae79]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Stop Searching. Start Recruiting.
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto">
                Join coaches who&apos;ve streamlined their recruiting with UpDrafted&apos;s centralized athlete profiles. Everything you need in one place.
              </p>
              <div className="pt-4">
                <Link href="/sign-up">
                  <Button size="lg" className="px-12 py-4 text-lg font-semibold bg-[#01ae79] hover:bg-[#01ae79]/90 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                    Get Started Free
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
                  <span>All verified athletes</span>
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