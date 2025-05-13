"use client";

import { Mail, MapPin, Send } from 'lucide-react';
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/button'; // Import Button
import { ArrowRight } from 'lucide-react'; // Import ArrowRight

export default function ContactPage() {
  const contactEmail = "potirnichecarmine@gmail.com";

  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20 dark:from-black dark:to-secondary/15">
        <div className="container px-4 md:px-6 text-center">
          <Mail className="mx-auto h-16 w-16 text-primary mb-6" />
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 py-2">
            Get In Touch
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-xl">
            We&apos;d love to hear from you! For any questions, feedback, or inquiries, please feel free to reach out.
          </p>
        </div>
      </section>

      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-xl text-center space-y-8">
            
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center justify-center">
                <Send className="h-6 w-6 text-primary mr-2" />
                Email Us Directly
              </h2>
              <p className="text-muted-foreground md:text-lg mb-3">
                The best way to reach us is by email. We aim to respond to all inquiries as promptly as possible.
              </p>
              <a 
                href={`mailto:${contactEmail}`} 
                className="inline-block text-lg font-medium text-primary bg-primary/10 hover:bg-primary/20 px-6 py-3 rounded-lg transition-colors duration-200 break-all"
              >
                {contactEmail}
              </a>
            </div>
            
            <div className="border-t border-border/60 pt-8">
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary mr-2" />
                Our Base
              </h3>
              <p className="text-muted-foreground md:text-lg">
                UpDrafted is proudly based in
              </p>
              <p className="text-muted-foreground md:text-lg font-medium">
                Reno, Nevada, USA
              </p>
            </div>

            <div className="pt-8">
               <Link href="/">
                <Button variant="outline" size="lg">
                  Back to Home <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}