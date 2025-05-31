"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Mail, Clock, ArrowRight, HelpCircle } from "lucide-react";

export default function ContactPage() {
  const contactEmail = "potirnichecarmine@gmail.com";

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-background via-background to-[#01ae79]/5 dark:to-[#01ae79]/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="outline" className="w-fit bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30 mx-auto">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
              Get in{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                Touch
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              Have questions, need support, or want to learn more about UpDrafted? We&apos;re here to help make your recruiting journey a success.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Multiple Ways to Reach Us
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose the contact method that works best for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Email Support */}
              <Card className="border border-[#01ae79]/20 dark:border-[#01ae79]/30 hover:border-[#01ae79]/30 dark:hover:border-[#01ae79]/40 transition-colors">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-[#01ae79]" />
                    </div>
                    <h3 className="text-xl font-semibold">Email Support</h3>
                    <p className="text-muted-foreground">
                      Send us a detailed message and we&apos;ll get back to you as soon as possible.
                    </p>
                    <div className="space-y-2">
                      <p className="font-medium text-[#01ae79]">
                        <a href={`mailto:${contactEmail}`} className="hover:underline">
                          {contactEmail}
                        </a>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Response time: 24-48 hours
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Support */}
              <Card className="border border-[#01ae79]/20 dark:border-[#01ae79]/30 hover:border-[#01ae79]/30 dark:hover:border-[#01ae79]/40 transition-colors">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                      <HelpCircle className="h-6 w-6 text-[#01ae79]" />
                    </div>
                    <h3 className="text-xl font-semibold">Technical Support</h3>
                    <p className="text-muted-foreground">
                      Having technical issues? We&apos;re here to help resolve any platform problems.
                    </p>
                    <div className="space-y-2">
                      <p className="font-medium text-[#01ae79]">
                        <a href={`mailto:${contactEmail}`} className="hover:underline">
                          {contactEmail}
                        </a>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Response time: 12-24 hours
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Response Times */}
            <Card className="bg-[#01ae79]/5 dark:bg-[#01ae79]/10 border-[#01ae79]/20 dark:border-[#01ae79]/30">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#01ae79]/20 dark:bg-[#01ae79]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-[#01ae79]" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Expected Response Times</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-medium text-[#01ae79]">General Inquiries</p>
                        <p className="text-sm text-muted-foreground">24-48 hours</p>
                      </div>
                      <div>
                        <p className="font-medium text-[#01ae79]">Technical Support</p>
                        <p className="text-sm text-muted-foreground">12-24 hours</p>
                      </div>
                      <div>
                        <p className="font-medium text-[#01ae79]">Urgent Issues</p>
                        <p className="text-sm text-muted-foreground">Same day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Tips */}
            <div className="mt-16 text-center">
              <h3 className="text-xl font-semibold mb-6">What to Include in Your Message</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-sm">
                  <div className="w-8 h-8 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-[#01ae79] font-bold">1</span>
                  </div>
                  <p className="font-medium">Account Issues</p>
                </div>
                <div className="text-sm">
                  <div className="w-8 h-8 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-[#01ae79] font-bold">2</span>
                  </div>
                  <p className="font-medium">Feature Questions</p>
                </div>
                <div className="text-sm">
                  <div className="w-8 h-8 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-[#01ae79] font-bold">3</span>
                  </div>
                  <p className="font-medium">Partnership Inquiries</p>
                </div>
                <div className="text-sm">
                  <div className="w-8 h-8 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-[#01ae79] font-bold">4</span>
                  </div>
                  <p className="font-medium">General Feedback</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-50/50 to-[#01ae79]/5 dark:from-slate-950/50 dark:to-[#01ae79]/10">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground">
              Don&apos;t wait to begin your recruiting journey. Join UpDrafted today and start making connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline" size="lg" className="border-[#01ae79]/30 dark:border-[#01ae79]/30 text-[#01ae79] hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10">
                  Back to Home
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white group">
                  Join UpDrafted
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}