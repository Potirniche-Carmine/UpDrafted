"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-emerald-50/30 dark:to-emerald-950/20 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="w-full max-w-md space-y-6 relative">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Create your UpDrafted account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
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
                card: "shadow-xl border border-border/30 bg-card",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "border-border/50 hover:bg-muted/80",
                socialButtonsBlockButtonText: "text-foreground",
                formFieldLabel: "text-muted-foreground",
                formFieldInput: "border-border/50 focus:ring-emerald-500 focus:border-emerald-500 text-foreground bg-background",
                formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white",
                footerActionText: "text-muted-foreground",
                footerActionLink: "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300",
                dividerLine: "bg-border/50",
                dividerText: "text-muted-foreground",
              }
            }}
          />
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
