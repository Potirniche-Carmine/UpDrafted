"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Target, Users, Lightbulb, Shield, Heart, Zap } from 'lucide-react';

export default function AboutPageContent() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-background via-background to-[#01ae79]/5 dark:to-[#01ae79]/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="outline" className="w-fit bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30 mx-auto">
              <Target className="w-4 h-4 mr-2" />
              About UpDrafted
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
              Making Connections{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                Easier
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              UpDrafted bridges the gap between talented student-athletes and college programs, making recruitment connections simpler, more transparent, and accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto">
                <Lightbulb className="h-8 w-8 text-[#01ae79]" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At UpDrafted, we believe every talented athlete deserves a fair chance to be seen, and every college program should have access to a diverse pool of potential stars. Traditional college sports recruitment can be expensive, exclusive, and often overlooks hidden gems due to geographical limitations or lack of resources.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our mission is to break down these barriers. We&apos;re building a transparent, accessible, and efficient platform that directly connects student-athletes with college coaches, scouts, and recruiters across all divisions. We aim to make the recruitment process more equitable by providing powerful tools for free.
              </p>
            </div>

            {/* What We Do Cards */}
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#01ae79]" />
                    </div>
                    <h3 className="text-xl font-semibold">For Athletes</h3>
                    <p className="text-muted-foreground">
                      Create comprehensive profiles showcasing athletic achievements, stats, videos, academic records, and personal aspirations. Gain direct visibility to a nationwide network of college programs.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-[#01ae79]" />
                    </div>
                    <h3 className="text-xl font-semibold">For College Programs</h3>
                    <p className="text-muted-foreground">
                      Efficiently discover, evaluate, and connect with prospective student-athletes who fit specific criteria. Save time and resources while building championship-winning teams.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-50/50 to-[#01ae79]/5 dark:from-slate-950/50 dark:to-[#01ae79]/10">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6 mb-16">
              <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-[#01ae79]" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Our Values
              </h2>
              <p className="text-lg text-muted-foreground">
                The principles that guide everything we do at UpDrafted
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="h-6 w-6 text-[#01ae79]" />
                    </div>
                    <h3 className="text-xl font-semibold">Accessibility</h3>
                    <p className="text-muted-foreground">
                      We believe every athlete deserves equal opportunity, regardless of background or resources.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto">
                      <Shield className="h-6 w-6 text-[#01ae79]" />
                    </div>
                    <h3 className="text-xl font-semibold">Transparency</h3>
                    <p className="text-muted-foreground">
                      Clear, honest communication and verified profiles build trust in our community.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto">
                      <Zap className="h-6 w-6 text-[#01ae79]" />
                    </div>
                    <h3 className="text-xl font-semibold">Innovation</h3>
                    <p className="text-muted-foreground">
                      We continuously improve our platform to better serve the athletic community.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of athletes and coaches already using UpDrafted to make meaningful connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
