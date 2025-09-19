"use client";

import { AuthWrapper } from "../../../components/auth-wrapper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, Suspense } from "react";
import { PricingCard } from "@/app/(pricing)/components/pricing-card";
import { getPlansByRole } from "@/app/(pricing)/components/pricing-config";
import { useSearchParams } from 'next/navigation';
import { useUser } from "@clerk/nextjs";

// FAQ Accordion Component
function FAQAccordion({ userRole }: { userRole: string }) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Role-specific FAQ items
  const getRoleSpecificFAQs = (role: string) => {
    const baseFAQs = [
      {
        question: "What's the difference between Free and Pro plans?",
        answer: "Our Free plan provides basic networking features to help you get started with 5 connection requests per month. Pro plans are for those serious about recruiting - get more connection requests, advanced search filters to find the right people, read receipts to know when your messages are seen, and insights into who's viewing your profile."
      },
      {
        question: "Can I switch between monthly and yearly billing?",
        answer: role === 'athlete' 
          ? "Yes! You can upgrade to yearly billing anytime to save money. Athletes save $36/year with annual billing."
          : "Yes! You can upgrade to yearly billing anytime to save money. Save $300/year with annual billing."
      },
      {
        question: "What is the cancellation policy?",
        answer: "You can cancel your Pro subscription at any time. Cancellations are processed immediately, but you'll retain access to all Pro features until the end of your current billing cycle. You can also downgrade to our Free plan."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, debit cards, and digital payment methods through our secure payment processor. All transactions are encrypted and processed safely to protect your financial information."
      },
      {
        question: "How do I upgrade or downgrade my plan?",
        answer: "You can easily change your subscription plan from this page or your account settings. Upgrades take effect immediately, while downgrades will apply at the start of your next billing cycle. Contact support if you need assistance with plan changes."
      }
    ];

    // Add role-specific "Which plan is right for me?" question
    let roleSpecificQuestion;
    if (role === 'athlete') {
      roleSpecificQuestion = {
        question: "Is Pro Athlete right for me?",
        answer: "Pro Athlete ($15/month) is perfect for athletes serious about getting recruited. You get 25 connection requests per month to reach more coaches, advanced search filters to find your perfect coach, read receipts to know when coaches see your messages, and insights into who's viewing your profile."
      };
    } else if (role === 'coach') {
      roleSpecificQuestion = {
        question: "Is Pro Coach right for me?",
        answer: "Pro Coach ($150/month) is ideal for coaches serious about recruiting. You get unlimited connection requests to athletes, advanced search filters to find perfect athletes for your team, read receipts, profile insights, and advanced analytics dashboard with priority support."
      };
    } else {
      roleSpecificQuestion = {
        question: "Is Pro Recruiter right for me?",
        answer: "Pro Recruiter ($150/month) is perfect for recruiters serious about talent acquisition. You get unlimited connection requests to athletes, advanced search and filtering for talent discovery, read receipts, profile insights, and advanced analytics with priority support."
      };
    }

    // Insert the role-specific question at position 1 (after the first question)
    return [
      baseFAQs[0],
      roleSpecificQuestion,
      ...baseFAQs.slice(1)
    ];
  };

  const faqItems = getRoleSpecificFAQs(userRole);

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

// Component that uses useSearchParams - needs to be wrapped in Suspense
function PricingPageContent() {
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled');
  const { user } = useUser();
  
  // Get user role from Clerk public metadata or default to 'athlete'
  const userRole = (user?.publicMetadata?.role as 'athlete' | 'coach' | 'recruiter') || 'athlete';
  
  // Get plans specific to the user's role (includes free tier)
  const availablePlans = getPlansByRole(userRole);
  
  // Role-specific messaging
  const getRoleSpecificContent = (role: string) => {
    switch (role) {
      case 'athlete':
        return {
          title: 'Pro Athlete',
          description: 'Get serious about recruiting. Connect with more coaches, stand out with advanced search, and track who\'s viewing your profile.',
          features: 'more connection requests, advanced coach search filters, read receipts, and profile insights'
        };
      case 'coach':
        return {
          title: 'Pro Coach',
          description: 'Serious about recruiting? Get unlimited athlete connections and professional tools to build your team.',
          features: 'unlimited athlete connections, advanced talent search filters, read receipts, and recruiting analytics'
        };
      case 'recruiter':
        return {
          title: 'Pro Recruiter',
          description: 'Serious about talent acquisition? Get unlimited athlete connections and professional recruiting tools.',
          features: 'unlimited athlete connections, advanced talent discovery filters, read receipts, and recruiting analytics'
        };
      default:
        return {
          title: 'Pro Features',
          description: 'Get serious about recruiting with professional tools.',
          features: 'advanced recruiting features and premium support'
        };
    }
  };
  
  const roleContent = getRoleSpecificContent(userRole);
  
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

          {/* Canceled payment message */}
          {canceled && (
            <div className="max-w-2xl mx-auto mb-8">
              <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                <CardContent className="p-6 text-center">
                  <p className="text-orange-800 dark:text-orange-200">
                    Payment was canceled. You can try again when you&apos;re ready to upgrade to {roleContent.title}.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="text-center max-w-4xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4 bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30">
              <Crown className="w-4 h-4 mr-2" />
              {userRole === 'coach' ? 'Coach Plans' : userRole === 'recruiter' ? 'Recruiter Plans' : userRole === 'athlete' ? 'Athlete Plans' : 'Pro Plans'}
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none mb-6">
              Unlock Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                Potential
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {roleContent.description} Get {roleContent.features} to accelerate your recruiting success.
            </p>
          </div>

          {/* Role-Specific Pricing Cards */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground mb-4">
                Plans designed specifically for {userRole === 'coach' ? 'coaches' : userRole === 'recruiter' ? 'recruiters' : `${userRole}s`} - start with our free tier or upgrade to unlock {roleContent.title} features
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8 items-stretch">
              {availablePlans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about {roleContent.title} and getting serious about recruiting
              </p>
            </div>
            
            <FAQAccordion userRole={userRole} />
          </div>

          {/* Support Section */}
          <div className="text-center mt-16 mb-8">
            <div className="bg-gradient-to-r from-[#01ae79]/5 to-[#01ae79]/10 dark:from-[#01ae79]/10 dark:to-[#01ae79]/20 rounded-2xl p-8 border border-[#01ae79]/20 dark:border-[#01ae79]/30 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Questions About {roleContent.title}?</h2>
              <p className="text-muted-foreground mb-6">
                Our support team understands recruiting and is here to help you get the most out of {roleContent.title} features.
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

// Main export with Suspense boundary
export default function PricingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PricingPageContent />
    </Suspense>
  );
} 