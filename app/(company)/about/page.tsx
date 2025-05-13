"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Info, Lightbulb, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20 dark:from-black dark:to-secondary/15">
        <div className="container px-4 md:px-6 text-center">
          <Info className="mx-auto h-16 w-16 text-primary mb-6" />
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 py-2">
            About UpDrafted
          </h1>
          <p className="max-w-3xl mx-auto mt-4 text-muted-foreground md:text-xl">
            Leveling the playing field in college sports recruitment, one connection at a time.
          </p>
        </div>
      </section>

      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl space-y-12">
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center">
                <Lightbulb className="h-8 w-8 text-primary mr-3" />
                Our Mission
              </h2>
              <p className="text-muted-foreground md:text-lg leading-relaxed">
                At UpDrafted, we believe every talented athlete deserves a fair chance to be seen, and every college program should have access to a diverse pool of potential stars. Traditional college sports recruitment can be expensive, exclusive, and often overlooks hidden gems due to geographical limitations or lack of resources. Many athletes can&apos;t afford to attend multiple high-priced exposure camps or showcases.
              </p>
              <p className="text-muted-foreground md:text-lg leading-relaxed">
                Our mission is to break down these barriers. We&apos;re building a transparent, accessible, and efficient platform that directly connects high school athletes with college coaches, scouts, and recruiters across all divisions (NCAA D1, D2, D3, and NJCAA/JUCO). We aim to make the recruitment process more equitable by providing powerful tools for free, with premium options for those who want to enhance their experience further.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center">
                <Target className="h-8 w-8 text-primary mr-3" />
                What We Do
              </h2>
              <p className="text-muted-foreground md:text-lg leading-relaxed">
                UpDrafted provides a dynamic platform where:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground md:text-lg">
                <li><strong>Athletes</strong> can create comprehensive profiles, showcasing their athletic achievements (stats, videos), academic records, and personal aspirations. They gain direct visibility to a nationwide network of college programs.</li>
                <li><strong>College Programs</strong> (coaches, recruiters, scouts) can efficiently discover, evaluate, and connect with prospective student-athletes who fit their specific criteria, saving time and resources.</li>
              </ul>
              <p className="text-muted-foreground md:text-lg leading-relaxed">
                We leverage technology to simplify discovery and foster meaningful interactions, helping athletes find the right fit and programs build championship-winning teams.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center">
                <ShieldCheck className="h-8 w-8 text-primary mr-3" />
                Our Values
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground md:text-lg">
                <li><strong>Accessibility:</strong> Ensuring that financial status doesn&apos;t dictate an athlete&apos;s opportunity.</li>
                <li><strong>Efficiency:</strong> Streamlining the recruitment process for both athletes and programs.</li>
                <li><strong>Transparency:</strong> Fostering open communication and clear pathways.</li>
                <li><strong>Opportunity:</strong> Unlocking potential by connecting talent with the right programs.</li>
                <li><strong>Integrity:</strong> Building a trustworthy platform for all users.</li>
              </ul>
              <p className="text-muted-foreground md:text-lg leading-relaxed">
                Based in Reno, Nevada, we&apos;re passionate about sports and technology, and we&apos;re excited to help shape the future of college athletic recruitment.
              </p>
            </div>

            <div className="text-center pt-8">
              <Link href="/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                  Join the UpDrafted Community <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}