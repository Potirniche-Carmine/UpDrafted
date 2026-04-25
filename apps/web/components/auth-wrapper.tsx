"use client";

import { useUser } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { canAccessWithoutAppRole, getAccessPathForUser, hasAppRole } from '@/lib/auth-routing';

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

// Dedicated OnboardingWrapper - more restrictive for onboarding flow
export function OnboardingWrapper({
  children,
  loadingComponent
}: OnboardingWrapperProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectTargetRef = useRef<string | null>(null);

  const handleRedirect = useCallback(async (path: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.pathname === path || redirectTargetRef.current === path) {
      return;
    }

    redirectTargetRef.current = path;
    setIsRedirecting(true);
    window.location.replace(path);
  }, []);

  useEffect(() => {
    const checkOnboardingAuth = async () => {
      if (!isLoaded) return;

      // If not signed in, send them to sign-in. Going to '/' would bounce off the
      // proxy back to /dashboard (and then back here) when a stale session cookie
      // is still present, producing a redirect loop.
      if (!isSignedIn) {
        await handleRedirect('/sign-in');
        return;
      }

      if (user?.emailVerified === false) {
        await handleRedirect('/verify-email');
        return;
      }

      if (hasAppRole(user?.role)) {
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
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectTargetRef = useRef<string | null>(null);

  const handleRedirect = useCallback(async (path: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    // Avoid infinite redirects to the same page
    if (pathname === path || redirectTargetRef.current === path) {
      return;
    }

    redirectTargetRef.current = path;
    setIsRedirecting(true);
    window.location.replace(path);
  }, [pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoaded) return;

      // 1. Landing Page Logic
      if (type === 'landing') {
        if (isSignedIn) {
          await handleRedirect(getAccessPathForUser(user));
        } else {
          setIsAuthorized(true);
          setIsLoading(false);
        }
        return;
      }

      // 2. Onboarding Logic (Legacy support, prefer OnboardingWrapper)
      if (type === 'onboarding') {
        if (!isSignedIn) {
          await handleRedirect('/sign-in');
          return;
        }
        if (user?.emailVerified === false) {
          await handleRedirect('/verify-email');
          return;
        }
        if (hasAppRole(user?.role)) {
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

      if (user?.emailVerified === false) {
        await handleRedirect('/verify-email');
        return;
      }

      const userRole = user?.role as string;
      const hasRole = hasAppRole(userRole);
      const canStayWithoutRole = canAccessWithoutAppRole(pathname);

      // Users without a completed onboarding role stay on onboarding until they finish.
      if (!hasRole) {
        if (!pathname?.startsWith('/onboarding') && !canStayWithoutRole) {
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
