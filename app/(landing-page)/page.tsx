import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Zap, Target, Users, TrendingUp } from "lucide-react"; 

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 md:space-y-16">
      <section className="w-full py-16 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-secondary/30 dark:from-black dark:to-secondary/20 rounded-b-xl">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_650px]">
            <div className="flex flex-col justify-center space-y-6 text-left">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 py-2">
                  UpDrafted: Your Direct Line to College Sports Success.
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl lg:text-lg xl:text-xl">
                  Connect instantly. Athletes: Showcase your talent to D1, D2, D3, & JUCO Programs. College Programs: Discover your next star with unparalleled efficiency.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Link href="/sign-up">
                  <Button size="lg" className="w-full min-[400px]:w-auto bg-primary hover:bg-primary/90 text-primary-foreground group">
                    Create Your Profile <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/explore-athletes">
                  <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto border-primary text-primary hover:bg-primary/10">
                    Explore Talent Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center p-6">
              {/* Suggestion: Replace with a dynamic image/graphic */}
              {/* e.g., a montage of diverse athletes, or a stylized representation of connections */}
              <div className="w-full h-72 lg:h-96 bg-muted/70 dark:bg-muted/40 rounded-xl shadow-xl flex flex-col items-center justify-center text-center p-8">
                  <TrendingUp className="h-24 w-24 text-primary mb-6" />
                  <p className="text-xl font-semibold text-primary/90">
                    Next Level Connections, Simplified.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Visualize your future team or your next opportunity.
                  </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The UpDrafted Edge Section - Highlighting the "Tinder-like" benefit */}
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              The UpDrafted Edge
            </h2>
            <p className="max-w-3xl mx-auto mt-3 text-muted-foreground md:text-lg">
              We&apos;re revolutionizing college sports recruitment by making connections faster and more meaningful.
            </p>
          </div>
          <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-1 md:gap-12 lg:max-w-5xl lg:grid-cols-2">
            <div className="p-6 bg-card border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-3">
                <Target className="h-10 w-10 text-primary mr-4" />
                <h3 className="text-2xl font-bold text-primary">For Athletes: Get Seen, Get Recruited</h3>
              </div>
              <p className="text-muted-foreground">
                Build a standout profile that highlights your skills, academics, and aspirations. Our platform puts you directly in front of college programs actively looking for talent like yours. Maximize your visibility, minimize the guesswork.
              </p>
            </div>
            <div className="p-6 bg-card border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-3">
                <Zap className="h-10 w-10 text-primary mr-4" />
                <h3 className="text-2xl font-bold text-primary">For Programs: Discover Talent, Instantly</h3>
              </div>
              <p className="text-muted-foreground">
                Cut through the noise. Our intuitive interface (inspired by quick-review mechanics) lets you efficiently assess athlete highlights and key stats at a glance. Spend less time searching, more time connecting with genuine prospects.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-20 lg:py-28 bg-secondary/30 dark:bg-secondary/20">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-10 md:mb-14">
            Unlock Your Potential
          </h2>
          <div className="mx-auto grid items-start gap-6 sm:max-w-4xl sm:grid-cols-2 md:gap-10 lg:max-w-5xl lg:grid-cols-3">
            <div className="flex flex-col items-center text-center gap-2 p-6 border border-transparent rounded-lg hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <Users className="h-12 w-12 text-primary mb-3" />
              <h3 className="text-xl font-bold text-primary/90">Dynamic Athlete Profiles</h3>
              <p className="text-sm text-muted-foreground">
                Showcase everything: highlight reels, stats, academic achievements, and personal statements. Make a lasting first impression.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-6 border border-transparent rounded-lg hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <Target className="h-12 w-12 text-primary mb-3" />
              <h3 className="text-xl font-bold text-primary/90">Precision Search for Programs</h3>
              <p className="text-sm text-muted-foreground">
                Filter by sport, division, position, academic standing, and more. Find verified athletes that fit your program&apos;s exact needs.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-6 border border-transparent rounded-lg hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <TrendingUp className="h-12 w-12 text-primary mb-3" />
              <h3 className="text-xl font-bold text-primary/90">Nationwide Network</h3>
              <p className="text-sm text-muted-foreground">
                Connect with opportunities across NCAA D1, D2, D3, and NJCAA (JUCO) institutions. Your next chapter starts here.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-6 px-4 text-center md:px-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to Make Your Mark in College Sports?
            </h2>
            <p className="mx-auto max-w-[650px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Whether you&apos;re an athlete dreaming of college play or a college program searching for the next game-changer, UpDrafted is your ultimate recruitment platform.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-3">
            <Link href="/sign-up">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 group">
                Get Started with UpDrafted <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-xs py-2 text-muted-foreground">
              Join free. Connect instantly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}