"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, User, Shield, Sparkles } from "lucide-react";
import { UserRole } from "../lib/types";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { generateProfileUrl } from "@/lib/utils";

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
  const [showFallbackButton, setShowFallbackButton] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    }, 1500); // Each step takes 1.5 seconds (total ~4.5 seconds for all steps)

    return () => clearInterval(stepInterval);
  }, []);

  // Auto-redirect after timeout or when steps complete
  useEffect(() => {
    if (completedSteps.length === loadingSteps.length) {
      // Wait a bit longer after steps complete, then redirect
      const redirectTimer = setTimeout(async () => {
        if (user?.id && !isRedirecting) {
          setIsRedirecting(true);
          try {
            // Generate profile URL with slug
            const fullName = user?.fullName || `${user?.firstName} ${user?.lastName}`;
            const profileUrl = fullName ? generateProfileUrl(fullName, user.id) : `/profile/${user.id}`;
            
            // Direct navigation to profile - avoid dashboard
            await router.push(profileUrl);
          } catch (error) {
            console.error('Auto-redirect failed:', error);
            setShowFallbackButton(true);
            setIsRedirecting(false);
          }
        }
      }, 2500); // Additional 2.5 seconds after steps complete (total ~7 seconds)

      // Show fallback button after 7 seconds total
      const fallbackTimer = setTimeout(() => {
        if (!isRedirecting) {
          setShowFallbackButton(true);
        }
      }, 2500);

      return () => {
        clearTimeout(redirectTimer);
        clearTimeout(fallbackTimer);
      };
    }
  }, [completedSteps.length, router, user?.id, user?.fullName, user?.firstName, user?.lastName, isRedirecting]);

  const handleManualRedirect = async () => {
    if (user?.id && !isRedirecting) {
      setIsRedirecting(true);
      const fullName = user?.fullName || `${user?.firstName} ${user?.lastName}`;
      try {
        // Generate profile URL with slug
        const profileUrl = fullName ? generateProfileUrl(fullName, user.id) : `/profile/${user.id}`;
        
        await router.push(profileUrl);
      } catch (error) {
        console.error('Manual redirect failed:', error);
        // Fallback to window.location if router fails
        const fallbackUrl = fullName ? generateProfileUrl(fullName, user.id) : `/profile/${user.id}`;
        window.location.href = fallbackUrl;
      }
    }
  };

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
              {isRedirecting ? 'Taking you to your profile...' : `Creating Your ${getRoleDisplayName(role)} Profile`}
            </h2>
            <p className="text-muted-foreground">
              {isRedirecting 
                ? 'Just a moment...' 
                : 'Please wait while we set everything up for you...'
              }
            </p>
          </div>

          {/* Progress Steps */}
          {!isRedirecting && (
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
          )}

          {/* Fallback Button */}
          {showFallbackButton && (
            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-sm text-muted-foreground">
                Something went wrong? Click here to see your profile.
              </p>
              <Button 
                onClick={handleManualRedirect}
                disabled={isRedirecting}
                className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  'Go to Your Profile'
                )}
              </Button>
            </div>
          )}

          {/* Bottom Message */}
          {!showFallbackButton && !isRedirecting && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                This may take a few moments. Please don&apos;t close this window.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 