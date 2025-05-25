"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Navigation, ShieldCheck, Eye, Gift, ExternalLink } from 'lucide-react';

export default function ForHsClubCoachesPage() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl space-y-12">

            <div className="text-center mb-10 md:mb-14">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                    Tools for Coaches at All Levels
                </h2>
                <p className="max-w-3xl mx-auto mt-3 text-muted-foreground md:text-lg">
                    UpDrafted helps you build your verified presence, guide your athletes, or discover talent. Establish your coaching profile and make an impact.
                </p>
            </div>

            <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl text-center">
                <h3 className="text-xl font-semibold text-primary mb-2">Are you a College Coach focused on Recruiting?</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                    While creating your verified coach profile here is a great step, our dedicated **Recruiter Platform** offers the best tools for discovering, evaluating, and connecting with prospective student-athletes.
                </p>
                <Link href="/for-recruiters"> 
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                        Explore Recruiter Tools <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 pt-8">
              <FeatureCard
                icon={<ShieldCheck className="h-10 w-10 text-primary" />}
                title="Establish Your Verified Profile"
                description="Showcase your experience and credentials. Submit materials for our team's review to gain a verified status, building trust with athletes and the wider community."
              />
              <FeatureCard
                icon={<Navigation className="h-10 w-10 text-primary" />}
                title="Guide Aspiring Student-Athletes"
                description="For coaches advising prospective student-athletes: help them create comprehensive UpDrafted profiles, consolidating all their key recruiting info for college programs."
              />
              <FeatureCard
                icon={<Eye className="h-10 w-10 text-primary" />}
                title="Amplify Athlete Visibility"
                description="For HS/Club Coaches: Help your athletes get their organized profiles seen by a wider network of college programs and recruiters looking for talent."
              />
               <FeatureCard
                icon={<Gift className="h-10 w-10 text-primary" />}
                title="A Free Platform for Growth"
                description="Utilize UpDrafted's core features at no cost to establish your coaching presence and support the athletes you work with."
              />
            </div>

            <div className="text-center pt-10">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Ready to Make an Impact?</h3>
              <p className="text-muted-foreground md:text-lg max-w-xl mx-auto mb-6">
                Create your UpDrafted coach profile today. If you&apos;re an HS/Club coach, also encourage your athletes to sign up and build their future.
              </p>
              <Link href="/sign-up"> 
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                  Create Your Coach Profile <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

// FeatureCard component (ensure it's defined or imported from your project)
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-start p-6 bg-card border border-border/50 rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
    <div className="mb-4 bg-primary/10 p-3 rounded-lg">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);