"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Users, Zap, ClipboardCheck, Microscope, BarChartBig } from 'lucide-react';

export default function ForCollegeProgramsPage() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20 dark:from-black dark:to-secondary/15">
        <div className="container px-4 md:px-6 text-center">
          <Search className="mx-auto h-16 w-16 text-primary mb-6" />
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 py-2">
            For College Programs: Discover Your Next Star
          </h1>
          <p className="max-w-3xl mx-auto mt-4 text-muted-foreground md:text-xl">
            Efficiently find, evaluate, and connect with talented athletes across all divisions. Streamline your recruitment process with UpDrafted.
          </p>
        </div>
      </section>

      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl space-y-12">

            <div className="text-center mb-10 md:mb-14">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                    The UpDrafted Advantage for Recruiters
                </h2>
                <p className="max-w-3xl mx-auto mt-3 text-muted-foreground md:text-lg">
                    Tired of sifting through endless emails and costly scouting trips? UpDrafted provides a smarter, more efficient way to build your team.
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <FeatureCard
                icon={<Microscope className="h-10 w-10 text-primary" />}
                title="Precision Talent Discovery"
                description="Utilize advanced search filters – sport, division, position, academics, location, and more – to pinpoint athletes who match your program's specific needs. Spend less time searching, more time evaluating qualified prospects."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title="Access a Diverse Talent Pool"
                description="Discover athletes from across the nation, including those who might not be on traditional recruiting circuits. Our platform hosts profiles from D1, D2, D3, and JUCO aspiring athletes."
              />
              <FeatureCard
                icon={<Zap className="h-10 w-10 text-primary" />}
                title="Efficient Evaluation Tools"
                description="Quickly review key information: verified stats, highlight videos, academic transcripts (where provided by athlete), and personal statements. Our intuitive 'Tinder-like' quick-review interface (for premium users) helps you assess fit rapidly."
              />
              <FeatureCard
                icon={<ClipboardCheck className="h-10 w-10 text-primary" />}
                title="Verified & Comprehensive Profiles"
                description="Access detailed athlete profiles that provide a holistic view of each prospect. We encourage athletes to provide accurate and up-to-date information, helping you make informed decisions."
              />
               <FeatureCard
                icon={<BarChartBig className="h-10 w-10 text-primary" />}
                title="Data-Driven Recruitment"
                description="Leverage data to identify trends and uncover hidden gems. Our platform aims to provide insights that can enhance your recruitment strategy and save valuable budget on unnecessary travel."
              />
              <FeatureCard
                icon={<ArrowRight className="h-10 w-10 text-primary" />}
                title="Direct & Streamlined Communication"
                description="Connect directly with athletes or their designated contacts once mutual interest is established. Manage your prospects and communications all in one place."
              />
            </div>

            <div className="text-center pt-10">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Ready to Find Your Next Game-Changer?</h3>
              <p className="text-muted-foreground md:text-lg max-w-xl mx-auto mb-6">
                Join UpDrafted today to start discovering and connecting with the next generation of college athletes.
              </p>
              <Link href="/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                  Access the Talent Pool <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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