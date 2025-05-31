"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, User, Shield, Sparkles } from "lucide-react";
import { UserRole } from "./types";

interface LoadingScreenProps {
  role: UserRole;
}

const loadingSteps = [
  { icon: User, message: "Creating your profile..." },
  { icon: Shield, message: "Setting up your account..." },
  { icon: Sparkles, message: "Finalizing your setup..." },
];

export function LoadingScreen({ role }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < loadingSteps.length) {
          setCompletedSteps((completed) => [...completed, prev]);
          return next;
        } else {
          setCompletedSteps((completed) => [...completed, prev]);
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 1000); // Each step takes 1 second

    return () => clearInterval(stepInterval);
  }, []);

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'athlete':
        return 'Athletic';
      case 'coach':
        return 'Coaching';
      case 'recruiter':
        return 'Recruiting';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {/* Main Loading Animation */}
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-[#01ae79]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#01ae79] border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#01ae79] animate-spin" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Creating Your {getRoleDisplayName(role)} Profile
            </h2>
            <p className="text-muted-foreground">
              Please wait while we set everything up for you...
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {loadingSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isCurrent = currentStep === index;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                    isCurrent
                      ? 'bg-[#01ae79]/10 border border-[#01ae79]/30'
                      : isCompleted
                      ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                      : 'bg-muted/50 border border-transparent'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-[#01ae79] text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-500 ${
                      isCompleted
                        ? 'text-green-700 dark:text-green-300'
                        : isCurrent
                        ? 'text-[#01ae79]'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.message}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Message */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              This may take a few moments. Please don&apos;t close this window.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 