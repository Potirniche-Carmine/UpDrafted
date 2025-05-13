"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] pt-2 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/10 dark:from-black dark:to-secondary/5">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Create your UpDrafted account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:text-primary/90">
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex justify-center">
          <SignUp 
            path="/sign-up" 
            routing="path" 
            signInUrl="/sign-in"
            redirectUrl="/"
            appearance={{
              elements: {
                card: "shadow-xl border border-border/30",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "border-border/50 hover:bg-muted/80",
                socialButtonsBlockButtonText: "text-foreground",
                formFieldLabel: "text-muted-foreground",
                formFieldInput: "border-border/50 focus:ring-primary focus:border-primary text-foreground",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                footerActionText: "text-muted-foreground",
                footerActionLink: "text-primary hover:text-primary/90",
                dividerLine: "bg-border/50",
                dividerText: "text-muted-foreground",
              }
            }}
          />
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center text-sm text-primary hover:text-primary/90">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
