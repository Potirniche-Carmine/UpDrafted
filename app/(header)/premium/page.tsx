"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Star, Eye, Send, Search, TrendingUp, CheckCircle, XCircle, BadgePercent, MessageSquarePlus, Filter, Users, NotebookText } from 'lucide-react';
import { useState } from 'react';
import { cn } from "@/lib/utils";

export default function PremiumPage() {
  const [showAnnual, setShowAnnual] = useState(true); 

  const athleteMonthlyPrice = 4.99;
  const athleteAnnualPrice = 47.99; // Approx 20% discount ($3.99/month)

  const programMonthlyPrice = 79;
  const programAnnualPrice = 759; // Approx 20% discount (~$63.25/month)

  const athleteFeatures = {
    free: [
      { text: "Create your athlete profile", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
      { text: "Basic search for colleges", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
      { text: "5 connection requests per month", icon: <XCircle className="h-5 w-5 text-destructive/80" /> },
      { text: "See only count of profile views (e.g., '14 views')", icon: <XCircle className="h-5 w-5 text-destructive/80" /> },
      { text: "Standard connection requests", icon: <XCircle className="h-5 w-5 text-destructive/80" /> },
      { text: "No message read receipts", icon: <XCircle className="h-5 w-5 text-destructive/80" /> },
    ],
    premium: [
      { text: "All Free features, plus:", icon: <CheckCircle className="h-5 w-5 text-primary" /> },
      { text: "30 connection requests per month", icon: <TrendingUp className="h-5 w-5 text-primary" /> },
      { text: "See exactly who viewed your profile", icon: <Eye className="h-5 w-5 text-primary" /> },
      { text: "Send 'Drafted' connections (priority placement)", icon: <Send className="h-5 w-5 text-primary" /> },
      { text: "Message read receipts from programs", icon: <MessageSquarePlus className="h-5 w-5 text-primary" /> },
      { text: "Premium Athlete badge on your profile", icon: <Star className="h-5 w-5 text-primary" /> },
    ]
  };

  const programFeatures = {
    free: [
      { text: "Create your program profile", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
      { text: "Basic athlete search (name, sport)", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
      { text: "25 athlete profile views per day", icon: <XCircle className="h-5 w-5 text-destructive/80" /> },
      { text: "Cannot see who viewed your program profile", icon: <XCircle className="h-5 w-5 text-destructive/80" /> },
      { text: "Standard recruiting tools", icon: <XCircle className="h-5 w-5 text-destructive/80" /> },
    ],
    premium: [
      { text: "All Free features, plus:", icon: <CheckCircle className="h-5 w-5 text-primary" /> },
      { text: "150 athlete profile views per day", icon: <Users className="h-5 w-5 text-primary" /> },
      { text: "Advanced Search Filters (GPA, position, measurables)", icon: <Filter className="h-5 w-5 text-primary" /> },
      { text: "See which athletes viewed your program profile", icon: <Eye className="h-5 w-5 text-primary" /> },
      { text: "Add private notes to athlete profiles", icon: <NotebookText className="h-5 w-5 text-primary" /> },
      { text: "Premium Program badge for enhanced visibility", icon: <Star className="h-5 w-5 text-primary" /> },
    ]
  };


  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20 dark:from-black dark:to-secondary/15">
        <div className="container px-4 md:px-6 text-center">
          <TrendingUp className="mx-auto h-16 w-16 text-amber-500 mb-6" />
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-400 py-2">
            Unlock UpDrafted Premium
          </h1>
          <p className="max-w-3xl mx-auto mt-4 text-muted-foreground md:text-xl">
            Elevate your recruitment game. Get the tools you need to connect, get noticed, and succeed.
          </p>
        </div>
      </section>

      <section className="w-full py-8 md:py-12">
        <div className="container px-4 md:px-6 flex flex-col items-center">
          <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg mb-10 md:mb-16">
            <Button
              variant={!showAnnual ? "default" : "ghost"}
              onClick={() => setShowAnnual(false)}
              className={cn("px-6 py-2 rounded-md", !showAnnual && "shadow-md bg-primary text-primary-foreground hover:bg-primary/90")}
            >
              Monthly
            </Button>
            <Button
              variant={showAnnual ? "default" : "ghost"}
              onClick={() => setShowAnnual(true)}
              className={cn("px-6 py-2 rounded-md relative", showAnnual && "shadow-md bg-primary text-primary-foreground hover:bg-primary/90")}
            >
              Annual
              {showAnnual && (
                <span className="absolute -top-2 -right-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full flex items-center">
                  <BadgePercent className="h-3 w-3 mr-1" /> Save 20%
                </span>
              )}
            </Button>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-start">
            
            <PricingCard
              userType="Athletes"
              icon={<Users className="h-10 w-10 text-primary" />}
              monthlyPrice={athleteMonthlyPrice}
              annualPrice={athleteAnnualPrice}
              showAnnual={showAnnual}
              freeFeatures={athleteFeatures.free}
              premiumFeatures={athleteFeatures.premium}
              ctaLink="/subscribe/athlete" 
              premiumTierName="Athlete Pro"
            />

            {/* For College Programs */}
            <PricingCard
              userType="College Programs"
              icon={<Search className="h-10 w-10 text-primary" />}
              monthlyPrice={programMonthlyPrice}
              annualPrice={programAnnualPrice}
              showAnnual={showAnnual}
              freeFeatures={programFeatures.free}
              premiumFeatures={programFeatures.premium}
              ctaLink="/subscribe/program" // Placeholder Link
              premiumTierName="Recruiter Pro"
            />
            
          </div>
        </div>
      </section>

      {/* Why Go Premium? Or FAQ section - Optional */}
      <section className="w-full py-12 md:py-20 lg:py-28 bg-secondary/30 dark:bg-secondary/20">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-10 md:mb-14">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-6">
            <FAQItem
              question="Can I cancel my subscription anytime?"
              answer="Yes, you can cancel your monthly or annual subscription at any time. If you cancel an annual subscription, you'll retain premium access until the end of your billing period."
            />
            <FAQItem
              question="What happens when my premium features expire?"
              answer="Your account will revert to the free plan. You'll still have your profile and basic access, but premium features will be locked until you resubscribe."
            />
             <FAQItem
              question="Is there a free trial for Premium features?"
              answer="We occasionally offer promotional free trials. Keep an eye on our announcements or subscribe to our newsletter for updates on special offers."
            />
             <FAQItem
              question="How does 'Drafted' connection work for athletes?"
              answer="'Drafted' connections are a premium feature that gives your connection request priority placement in a program's list, increasing its visibility."
            />
          </div>
        </div>
      </section>

    </div>
  );
}


interface PricingCardProps {
  userType: string;
  icon: React.ReactNode;
  monthlyPrice: number;
  annualPrice: number;
  showAnnual: boolean;
  freeFeatures: { text: string; icon: React.ReactNode }[];
  premiumFeatures: { text: string; icon: React.ReactNode }[];
  ctaLink: string;
  premiumTierName: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  userType,
  icon,
  monthlyPrice,
  annualPrice,
  showAnnual,
  freeFeatures,
  premiumFeatures,
  ctaLink,
  premiumTierName
}) => {
  const displayPrice = showAnnual ? (annualPrice / 12).toFixed(2) : monthlyPrice.toFixed(2);
  const billedText = showAnnual ? `Billed as $${annualPrice.toFixed(2)} per year` : "Billed monthly";

  return (
    <div className="flex flex-col bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 md:p-8 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
            {icon}
            <span className="ml-3">For {userType}</span>
          </h2>
          <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {premiumTierName}
          </span>
        </div>
        <p className="text-4xl sm:text-5xl font-extrabold text-foreground mb-1">
          ${displayPrice}
          <span className="text-base sm:text-lg font-medium text-muted-foreground">/month</span>
        </p>
        <p className="text-sm text-muted-foreground h-6">{showAnnual ? billedText : " "}</p>
      </div>
      
      <div className="p-6 md:p-8 flex-grow">
        <h4 className="text-lg font-semibold text-foreground mb-1">Standard Features (Free Tier):</h4>
        <ul className="space-y-2 mb-6">
          {freeFeatures.map((feature, index) => (
            <li key={`free-${index}`} className="flex items-start">
              {feature.icon}
              <span className="ml-2 text-muted-foreground text-sm">{feature.text}</span>
            </li>
          ))}
        </ul>

        <h4 className="text-lg font-semibold text-primary mb-1">All {premiumTierName} Features:</h4>
        <ul className="space-y-2 mb-6">
          {premiumFeatures.map((feature, index) => (
            <li key={`premium-${index}`} className="flex items-start">
             {feature.icon}
              <span className="ml-2 text-foreground text-sm">{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-6 md:p-8 border-t border-border/60 mt-auto">
        <Link href={ctaLink} className="w-full">
          <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg group">
            Upgrade to {premiumTierName}
            <TrendingUp className="ml-2 h-5 w-5 fill-current text-amber-500 group-hover:scale-110 transition-transform" />
          </Button>
        </Link>
        {showAnnual && (
          <p className="text-center text-xs text-green-600 dark:text-green-500 mt-3 font-medium">
            You save ${((monthlyPrice * 12) - annualPrice).toFixed(2)} with an annual plan!
          </p>
        )}
      </div>
    </div>
  );
};

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => (
  <details className="group p-4 bg-card border border-border/60 rounded-lg">
    <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-foreground">
      <span>{question}</span>
      <span className="transition group-open:rotate-180">
        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
      </span>
    </summary>
    <p className="text-muted-foreground mt-3 group-open:animate-fadeIn">
      {answer}
    </p>
  </details>
);