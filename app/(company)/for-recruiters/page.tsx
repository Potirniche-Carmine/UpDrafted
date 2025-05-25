"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Search, ShieldCheck, MessagesSquare } from 'lucide-react';

export default function ForRecruitersPage() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl space-y-12">

            <div className="text-center mb-10 md:mb-14">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                    Discover, Verify & Connect with Talent
                </h2>
                <p className="max-w-3xl mx-auto mt-3 text-muted-foreground md:text-lg">
                    UpDrafted provides a simple platform to view detailed athlete profiles, build your trusted recruiter presence, and connect with emerging prospects.
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title="All-in-One Athlete Profiles"
                description="Access comprehensive athlete data: embedded YouTube highlights, stats, MaxPreps/Hudl links, social media, and key measurables, all in one spot."
              />
              <FeatureCard
                icon={<Search className="h-10 w-10 text-primary" />}
                title="Discover and View Talent"
                description="Easily browse and view athlete profiles. See all their crucial recruiting information consolidated for quick assessment."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-10 w-10 text-primary" />}
                title="Build a Trusted Profile"
                description="Share details about your school/program. You can submit verification materials (like a school profile link or PDF) for our team to review, helping you gain a trusted badge."
              />
              <FeatureCard
                icon={<MessagesSquare className="h-10 w-10 text-primary" />}
                title="Connect With Prospects"
                description="Once you find an athlete of interest, our platform facilitates making that initial connection to start the conversation."
              />
            </div>

            <div className="text-center pt-10">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Find Your Next Standout Athlete?</h3>
              <p className="text-muted-foreground md:text-lg max-w-xl mx-auto mb-6">
                Create your UpDrafted account to start viewing detailed athlete profiles, build your verified presence, and connect with the talent that fits your program.
              </p>
              <Link href="/sign-up-recruiter">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                  Create Your Recruiter Profile <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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