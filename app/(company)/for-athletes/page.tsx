"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserSquare, Ruler, Eye, DollarSign } from 'lucide-react';

export default function ForAthletesPage() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl space-y-12">

            <div className="text-center mb-10 md:mb-14">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                    Your MVP Season Starts Here
                </h2>
                <p className="max-w-3xl mx-auto mt-3 text-muted-foreground md:text-lg">
                    UpDrafted helps you consolidate all your athletic achievements, highlights, and stats into one powerful profile to share with coaches and recruiters.
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <FeatureCard
                icon={<UserSquare className="h-10 w-10 text-primary" />}
                title="Your Complete Recruiting Hub"
                description="Bring your Hudl, MaxPreps, YouTube highlights, social media links, and key stats together in one professional, shareable athletic profile."
              />
              <FeatureCard
                icon={<Ruler className="h-10 w-10 text-primary" />}
                title="Showcase Key Measurables"
                description="Easily add and update your sport-specific measurables and achievements. Let recruiters see your current capabilities and progress."
              />
              <FeatureCard
                icon={<Eye className="h-10 w-10 text-primary" />}
                title="Get Seen by College Programs"
                description="Make your profile discoverable. UpDrafted is your platform to be seen by college coaches and recruiters actively searching for new talent."
              />
              <FeatureCard
                icon={<DollarSign className="h-10 w-10 text-primary" />}
                title="Free to Build Your Future"
                description="Create your complete athletic profile, showcase your talent, and start your recruiting journey on UpDrafted—all at no cost."
              />
            </div>

            <div className="text-center pt-10">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Ready to Make Your Mark?</h3>
              <p className="text-muted-foreground md:text-lg max-w-xl mx-auto mb-6">
                Build your free UpDrafted profile today. It’s the first step to organizing your recruitment and getting noticed.
              </p>
              <Link href="/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                  Create Your Free Profile <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

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