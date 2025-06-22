"use client";

import { PricingTable } from '@clerk/nextjs'
import { AuthWrapper } from "../../../components/auth-wrapper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// FAQ Accordion Component
function FAQAccordion() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: "What's the difference between UpDrafted Free and Premium?",
      answer: "UpDrafted Free provides basic profile creation and networking features to help you get started. UpDrafted Premium adds advanced analytics, activity tracking, profile view insights, priority support, and exclusive features to accelerate your athletic recruitment journey."
    },
    {
      question: "Who is Premium best for?",
      answer: "UpDrafted Premium is ideal for serious athletes, coaches, and recruiters who want comprehensive insights into their profile performance, advanced networking capabilities, and priority access to new features. It's perfect for those actively engaged in the recruitment process."
    },
    {
      question: "How much does UpDrafted Premium cost?",
      answer: "Pricing for UpDrafted Premium varies based on your selected plan. You can view current subscription costs by clicking 'Upgrade Now' or checking our pricing table below. We offer flexible monthly and annual billing options."
    },
    {
      question: "What is the cancellation policy?",
      answer: "You can cancel your UpDrafted Premium subscription at any time. Cancellations are processed immediately, but you'll retain access to all Premium features until the end of your current billing cycle. Refunds may be available within 7 days of initial subscription."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital payment methods through our secure payment processor. All transactions are encrypted and processed safely to protect your financial information."
    },
    {
      question: "How do I upgrade or downgrade my plan?",
      answer: "You can easily change your subscription plan from your account settings. Upgrades take effect immediately, while downgrades will apply at the start of your next billing cycle. Contact support if you need assistance with plan changes."
    }
  ];

  return (
    <div className="space-y-3">
      {faqItems.map((item, index) => (
        <Card key={index} className="border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
          <button
            onClick={() => toggleItem(index)}
            className="w-full p-6 text-left hover:bg-muted/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#01ae79]/20 group"
          >
            <div className="flex justify-between items-start gap-4">
              <h3 className="font-semibold text-foreground text-base lg:text-lg leading-tight group-hover:text-[#01ae79] transition-colors duration-200">
                {item.question}
              </h3>
              <div className="flex-shrink-0 mt-1">
                {openItems.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-[#01ae79] transition-colors duration-200" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-[#01ae79] transition-colors duration-200" />
                )}
              </div>
            </div>
          </button>
          {openItems.includes(index) && (
            <div className="animate-in slide-in-from-top-1 duration-200">
              <CardContent className="px-6 pb-6 pt-0">
                <div className="border-t border-border/30 pt-4">
                  <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                    {item.answer}
                  </p>
                </div>
              </CardContent>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export default function PricingPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#01ae79]/5 dark:to-[#01ae79]/10">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-center max-w-4xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4 bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30">
              <Crown className="w-4 h-4 mr-2" />
              Premium Features
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none mb-6">
              Unlock Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                Potential
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Get advanced insights, track your visibility, and accelerate your athletic journey with premium features designed for serious athletes, coaches, and recruiters.
            </p>
          </div>

          {/* Pricing Table */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
                <p className="text-muted-foreground mb-4">
                  Select the plan that best fits your needs and start unlocking premium features today
                </p>
                <div className="flex justify-center">
                  <Link href="/pricing/billing">
                    <Button variant="outline" className="border-[#01ae79]/30 hover:bg-[#01ae79]/5 dark:border-[#01ae79]/30 dark:hover:bg-[#01ae79]/10">
                      <Crown className="w-4 h-4 mr-2" />
                      View Role-Specific Plans
                    </Button>
                  </Link>
                </div>
              </div>
              
              <PricingTable />
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about UpDrafted Premium
              </p>
            </div>
            
            <FAQAccordion />
          </div>

          {/* Support Section */}
          <div className="text-center mt-16 mb-8">
            <div className="bg-gradient-to-r from-[#01ae79]/5 to-[#01ae79]/10 dark:from-[#01ae79]/10 dark:to-[#01ae79]/20 rounded-2xl p-8 border border-[#01ae79]/20 dark:border-[#01ae79]/30 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help you get the most out of UpDrafted premium features and answer any questions about our platform.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="border-[#01ae79]/30 hover:bg-[#01ae79]/5 dark:border-[#01ae79]/30 dark:hover:bg-[#01ae79]/10">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
} 