"use client";

import { useUser } from '@/hooks/use-auth';
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
    // Add a small delay for smoother transition
    await new Promise(resolve => setTimeout(resolve, 300));
    router.push(path);
  }, [router]);

  useEffect(() => {
    const checkOnboardingAuth = async () => {
      if (!isLoaded) return;

      // If not signed in, redirect to landing page
      if (!isSignedIn) {
        await handleRedirect('/');
        return;
      }

      // Check if user already has a role (completed onboarding)
      const userRole = user?.role as string;
      if (userRole && ['athlete', 'coach', 'recruiter', 'admin'].includes(userRole)) {
        // User already completed onboarding, redirect to dashboard
        await handleRedirect('/dashboard');
        return;
      }

      // User is signed in, has no role -> Allow access to onboarding
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkOnboardingAuth();
  }, [isLoaded, isSignedIn, user, handleRedirect]);

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
            {isRedirecting ? 'Redirecting...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return null;
}

export function AuthWrapper({
  children,
  requireAuth = true,
  requireRole = [],
  fallbackPath = '/sign-in',
  loadingComponent,
  type = 'default'
}: AuthWrapperProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRedirect = useCallback(async (path: string) => {
    // Avoid infinite redirects to the same page
    if (pathname === path) return;

    setIsRedirecting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    router.push(path);
  }, [router, pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoaded) return;

      // 1. Landing Page Logic
      if (type === 'landing') {
        if (isSignedIn) {
          const userRole = user?.role as string;
          if (userRole && ['athlete', 'coach', 'recruiter', 'admin'].includes(userRole)) {
            await handleRedirect('/dashboard');
          } else {
            await handleRedirect('/onboarding');
          }
        } else {
          setIsAuthorized(true);
          setIsLoading(false);
        }
        return;
      }

      // 2. Onboarding Logic (Legacy support, prefer OnboardingWrapper)
      if (type === 'onboarding') {
        if (!isSignedIn) {
          await handleRedirect('/');
          return;
        }
        const userRole = user?.role as string;
        if (userRole && ['athlete', 'coach', 'recruiter', 'admin'].includes(userRole)) {
          // Instead of showing component, redirect to dashboard for better UX
          await handleRedirect('/dashboard');
          return;
        }
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // 3. Default Protected Routes Logic
      if (!requireAuth) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      if (!isSignedIn) {
        await handleRedirect(fallbackPath);
        return;
      }

      const userRole = user?.role as string;
      const hasRole = userRole && ['athlete', 'coach', 'recruiter', 'admin'].includes(userRole);

      // STRICT CHECK: Users without a role can ONLY access /onboarding and /account
      if (!hasRole) {
        // Allow access to account/settings pages for no-role users
        if (pathname?.startsWith('/account')) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Redirect all other attempts to onboarding
        if (!pathname?.startsWith('/onboarding')) {
          await handleRedirect('/onboarding');
          return;
        }
      }

      // Role-specific requirements for users WITH roles
      if (requireRole.length > 0) {
        if (!userRole || !requireRole.includes(userRole)) {
          // If they have a role but not the right one, usually redirect to dashboard
          // If they have NO role, they are caught by the check above
          await handleRedirect('/dashboard');
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [isLoaded, isSignedIn, user, requireAuth, requireRole, type, pathname, fallbackPath, handleRedirect]);

  if (isLoading || !isLoaded || isRedirecting) {
    return loadingComponent || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          {/* Simple loading spinner */}
          <div className="w-6 h-6 border-2 border-[#01ae79] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">{isRedirecting ? 'Redirecting...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Legacy support for OnboardingCompleted component if needed, but we redirect now
  if (type === 'onboarding' && !isAuthorized && !isLoading) {
    return null;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return null;
} 