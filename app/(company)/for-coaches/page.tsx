"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Navigation, Shield, Eye, Gift, Users, ExternalLink, Target } from 'lucide-react';

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
              Guide Athletes to{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                Success
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              UpDrafted helps you build your verified presence, guide your athletes, or discover talent. Establish your coaching profile and make an impact.
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
                      <h3 className="text-xl font-semibold mb-3">Establish Your Verified Profile</h3>
                      <p className="text-muted-foreground">
                        Showcase your experience and credentials. Submit materials for our team&apos;s review to gain a verified status, building trust with athletes and the wider community.
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
                      <h3 className="text-xl font-semibold mb-3">Guide Aspiring Student-Athletes</h3>
                      <p className="text-muted-foreground">
                        For coaches advising prospective student-athletes: help them create comprehensive UpDrafted profiles, consolidating all their key recruiting info for college programs.
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
                      <h3 className="text-xl font-semibold mb-3">Amplify Athlete Visibility</h3>
                      <p className="text-muted-foreground">
                        For HS/Club Coaches: Help your athletes get their organized profiles seen by a wider network of college programs and recruiters looking for talent.
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
                      <h3 className="text-xl font-semibold mb-3">A Free Platform for Growth</h3>
                      <p className="text-muted-foreground">
                        Utilize UpDrafted&apos;s core features at no cost to establish your coaching presence and support the athletes you work with.
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
      <section className="w-full py-20 md:py-32 bg-gradient-to-r from-[#01ae79] via-[#01ae79]/90 to-[#01ae79]/80">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-8 text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready to Transform Your Coaching Impact?
            </h2>
            <p className="max-w-3xl mx-auto text-lg opacity-90">
              Join UpDrafted today and start helping your athletes reach their full potential in college sports.
            </p>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="px-12 py-4 text-xl group bg-white text-[#01ae79] hover:bg-gray-100">
                Start Coaching Success
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}