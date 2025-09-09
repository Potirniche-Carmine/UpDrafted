"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, User, Target, Shield, Trophy, Star, MessageCircle, CheckCircle } from 'lucide-react';

export default function ForAthletesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-background via-background to-[#01ae79]/5 dark:to-[#01ae79]/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="outline" className="w-fit bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30 mx-auto">
              <Star className="w-4 h-4 mr-2" />
              For Athletes
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
              Get Discovered by{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                College Programs
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              High school, college transfer, JUCO, and international athletes - build your unified profile and connect directly with coaches and recruiters. No more cold emails or scattered social media profiles.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white px-8 py-3 text-lg">
                  Start Your Profile Free
                </Button>
              </Link>
              <Link href="/for-coaches">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                  For Coaches
                </Button>
              </Link>
            </div>
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
                    <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-[#01ae79]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Build Your Complete Profile</h3>
                      <p className="text-muted-foreground">
                        Link your Hudl highlights, ESPN rankings, 247 Sports, social media, and stats all in one place. Make it easy for coaches to find everything they need about you.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                      <Shield className="h-8 w-8 text-[#01ae79]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Get Verified</h3>
                      <p className="text-muted-foreground">
                        Hudl verification for high school athletes, manual verification for college transfers, JUCO, and international athletes. Everyone gets their verification badge.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-[#01ae79]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Connect Directly</h3>
                      <p className="text-muted-foreground">
                        Message verified coaches and recruiters directly through our platform. No more cold emails or wondering if your message was received.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                      <Target className="h-8 w-8 text-[#01ae79]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Find Your Opportunity</h3>
                      <p className="text-muted-foreground">
                        Whether you&apos;re a high school recruit, transferring programs, or stepping up from JUCO - find college programs that match your goals and experience.
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
                <Trophy className="h-8 w-8 text-[#01ae79]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Start Building Your Athletic Profile Today
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto">
                Join athletes from all backgrounds - high school, college transfers, JUCO, and international players - who are connecting with college programs through UpDrafted.
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
                  <span>No spam or cold calls</span>
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