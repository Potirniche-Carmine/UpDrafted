"use client";

import { useUser, useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: string[];
  fallbackPath?: string;
  loadingComponent?: ReactNode;
  enforceServerSide?: boolean;
  // New props for specific behaviors
  type?: 'default' | 'onboarding' | 'landing';
}

interface OnboardingWrapperProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
}

// Component for when user already completed onboarding
function OnboardingCompleted() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-[#01ae79]" />
          </div>
          <CardTitle className="text-xl font-semibold">You already completed onboarding!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            It looks like you&apos;ve already set up your profile. Head back to your dashboard to continue.
          </p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Dedicated OnboardingWrapper - more restrictive for onboarding flow
export function OnboardingWrapper({
  children,
  loadingComponent
}: OnboardingWrapperProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRedirect = useCallback(async (path: string) => {
    setIsRedirecting(true);

    // Add a small delay to show loading state and make transition smoother
    await new Promise(resolve => setTimeout(resolve, 500));

    router.push(path);
  }, [router]);

  useEffect(() => {
    const checkOnboardingAuth = async () => {
      if (!isLoaded) return;

      // If not signed in, redirect to landing page
      if (!isSignedIn) {
        await handleRedirect('/sign-in');
        return;
      }

      // Check if user already has a role (completed onboarding)
      const userRole = user?.role as string;
      if (userRole && ['athlete', 'coach', 'recruiter'].includes(userRole)) {
        // User already completed onboarding, redirect to dashboard
        await handleRedirect('/dashboard');
        return;
      }

      // User is signed in but hasn't completed onboarding - allow access
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkOnboardingAuth();
  }, [isLoaded, isSignedIn, user, handleRedirect]);

  // Show loading state or redirecting state
  if (isLoading || !isLoaded || isRedirecting) {
    return loadingComponent || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-[#01ae79] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#01ae79] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-[#01ae79] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-muted-foreground">
            {isRedirecting
              ? 'Redirecting...'
              : !isLoaded
                ? 'Loading...'
                : 'Checking authentication...'
            }
          </p>
        </div>
      </div>
    );
  }

  // Show children if authorized (signed in but no role yet)
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Return null while processing
  return null;
}

export function AuthWrapper({
  children,
  requireAuth = true,
  requireRole = [],
  fallbackPath = '/sign-in',
  loadingComponent,
  enforceServerSide = false,
  type = 'default'
}: AuthWrapperProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverVerified, setServerVerified] = useState(!enforceServerSide);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Special handling for different wrapper types
  const getRedirectPath = useCallback(() => {
    if (type === 'onboarding' && !isSignedIn) {
      return '/';
    }
    if (type === 'landing' && isSignedIn) {
      return '/dashboard';
    }
    if (pathname?.startsWith('/onboarding') && !isSignedIn) {
      return '/';
    }
    return fallbackPath;
  }, [type, pathname, isSignedIn, fallbackPath]);

  const handleRedirect = useCallback(async (path: string) => {
    setIsRedirecting(true);

    // Add a small delay to show loading state and make transition smoother
    await new Promise(resolve => setTimeout(resolve, 500));

    router.push(path);
  }, [router]);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoaded) return;

      // Landing page logic - redirect authenticated users to dashboard
      if (type === 'landing') {
        if (isSignedIn) {
          // Check if user has completed onboarding (has a role)
          const userRole = user?.role as string;

          if (userRole && ['athlete', 'coach', 'recruiter'].includes(userRole)) {
            // User has completed onboarding, redirect to dashboard
            await handleRedirect('/dashboard');
          } else {
            // User is signed in but hasn't completed onboarding, redirect to onboarding
            await handleRedirect('/onboarding');
          }
          return;
        } else {
          // Allow unauthenticated users to see landing page
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
      }

      // Onboarding logic (kept for backward compatibility, but OnboardingWrapper should be used instead)
      if (type === 'onboarding') {
        if (!isSignedIn) {
          // Redirect unauthenticated users away from onboarding
          await handleRedirect('/');
          return;
        }

        // Check if user already has a role (completed onboarding)
        const userRole = user?.role as string;
        if (userRole && ['athlete', 'coach', 'recruiter'].includes(userRole)) {
          // User already completed onboarding, show completion message
          setIsAuthorized(false); // This will trigger showing OnboardingCompleted
          setIsLoading(false);
          return;
        }

        // User is signed in but hasn't completed onboarding - allow access
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Default logic for other wrappers
      if (!requireAuth) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Check if user is signed in - this is the critical check for dashboard
      if (!isSignedIn) {
        await handleRedirect(getRedirectPath());
        return;
      }

      // Get user role for role-based checks
      const userRole = user?.role as string;

      // Check role requirements
      if (requireRole.length > 0) {
        if (!userRole || !requireRole.includes(userRole)) {
          // Redirect based on user's role or to onboarding
          if (!userRole) {
            await handleRedirect('/onboarding');
          } else {
            await handleRedirect('/dashboard');
          }
          return;
        }
      } else {
        // For all authenticated pages, ensure user has completed onboarding (has a role)
        // Users without roles should only be able to access onboarding
        if (!userRole || !['athlete', 'coach', 'recruiter', 'admin'].includes(userRole)) {
          await handleRedirect('/onboarding');
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [isLoaded, isSignedIn, user, requireAuth, requireRole, enforceServerSide, serverVerified, getRedirectPath, handleRedirect, type, pathname]);

  // Show loading state or redirecting state
  if (isLoading || !isLoaded || isRedirecting) {
    return loadingComponent || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-[#01ae79] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#01ae79] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-[#01ae79] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-muted-foreground">
            {isRedirecting
              ? 'Redirecting...'
              : !isLoaded
                ? 'Loading...'
                : 'Checking authentication...'
            }
          </p>
        </div>
      </div>
    );
  }

  // Special case: onboarding wrapper with user who already completed onboarding
  if (type === 'onboarding' && !isAuthorized && !isLoading) {
    return <OnboardingCompleted />;
  }

  // Show children if authorized
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
} 