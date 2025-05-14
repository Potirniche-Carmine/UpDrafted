"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, TrendingUp, ShieldCheck, Zap, DollarSign, Users } from 'lucide-react';

export default function ForAthletesPage() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl space-y-12">

            <div className="text-center mb-10 md:mb-14">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                    Why UpDrafted for Athletes?
                </h2>
                <p className="max-w-3xl mx-auto mt-3 text-muted-foreground md:text-lg">
                    We understand the challenges. Expensive camps, limited exposure, and the complex recruiting maze. UpDrafted offers a new way.
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <FeatureCard
                icon={<Target className="h-10 w-10 text-primary" />}
                title="Maximize Your Visibility"
                description="Create a stunning, comprehensive profile with your stats, highlight reels, academic achievements, and personal story. Be seen by college coaches and recruiters from D1, D2, D3, and JUCO programs nationwide who are actively looking for talent like yours."
              />
              <FeatureCard
                icon={<DollarSign className="h-10 w-10 text-primary" />}
                title="Free to Get Started"
                description="We believe opportunity shouldn't have a price tag. Access core features for free – build your profile, get discovered, and make initial connections. Say goodbye to expensive showcase fees just to get noticed."
              />
              <FeatureCard
                icon={<Zap className="h-10 w-10 text-primary" />}
                title="Direct Connections"
                description="No more waiting by the phone or relying on third parties. Engage directly with college programs that show interest. Our platform facilitates clear and direct communication."
              />
              <FeatureCard
                icon={<TrendingUp className="h-10 w-10 text-primary" />}
                title="Take Control of Your Narrative"
                description="You decide what to showcase. Highlight your strengths, your progress, and what makes you unique. UpDrafted gives you the tools to present your best self to potential college programs."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-10 w-10 text-primary" />}
                title="A Platform Built for You"
                description="Designed with athletes in mind, our intuitive interface makes it easy to manage your profile, track interest, and explore opportunities. Focus on your training while we help with the exposure."
              />
               <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title="Expand Your Horizons"
                description="Discover programs you might not have considered. Our extensive network helps you find the right academic and athletic fit, whether it's a major university or a smaller college with a strong program."
              />
            </div>

            <div className="text-center pt-10">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Ready to Get Noticed?</h3>
              <p className="text-muted-foreground md:text-lg max-w-xl mx-auto mb-6">
                Stop waiting to be found. Create your free UpDrafted profile today and let college programs discover your talent.
              </p>
              <Link href="/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                  Create Your Athlete Profile <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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