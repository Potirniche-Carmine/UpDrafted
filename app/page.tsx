import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 via-transparent rounded-xl">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="px-4 md:px-6 flex flex-col justify-center space-y-4 text-left">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  Find Your Next Athletic Opportunity with UpDrafted
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  UpDrafted connects talented high school and JUCO athletes with college coaches across D1, D2, D3, and JUCO programs. Build your profile, showcase your skills, and get recruited.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/sign-up">
                  <Button size="lg" className="w-full min-[400px]:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
                <Link href="/explore-athletes">
                  <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto">
                    Explore Athletes
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
               <div className="w-full h-64 lg:h-96 bg-muted rounded-lg flex items-center justify-center">
                 <p className="text-muted-foreground">Probably a video or something here</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-12">
            Why Choose UpDrafted?
          </h2>
          <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
            <div className="grid gap-1 p-4 border rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-primary">For Athletes</h3>
              <p className="text-sm text-muted-foreground">
                Create a dynamic profile, upload highlight reels, and connect directly with college recruiters. Take control of your future.
              </p>
            </div>
            <div className="grid gap-1 p-4 border rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-primary">For Coaches & Recruiters</h3>
              <p className="text-sm text-muted-foreground">
                Discover verified talent from across the nation. Filter by sport, division, academic performance, and more.
              </p>
            </div>
            <div className="grid gap-1 p-4 border rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-primary">Comprehensive Network</h3>
              <p className="text-sm text-muted-foreground">
                Access opportunities from NCAA Division 1, D2, D3, and NJCAA (JUCO) institutions. Your next step starts here.
              </p>
            </div>
          </div>
        </div>
      </section>

       <section className="w-full py-12 md:py-24 lg:py-32 ">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to Elevate Your Game?
            </h2> 
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join the UpDrafted community today and take the next step in your athletic and academic career.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
             <Link href="/sign-up">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Sign Up Now
                </Button>
              </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
