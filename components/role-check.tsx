"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleCheckProps {
  children: React.ReactNode;
  allowedRoles?: ('athlete' | 'coach' | 'recruiter')[];
  requireRole?: boolean;
}

export function RoleCheck({ children, allowedRoles, requireRole = true }: RoleCheckProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return; // Wait for user to load
    
    if (!user) {
      // User not authenticated, let middleware handle it
      return;
    }

    const userRole = user.publicMetadata?.role as string | undefined;

    // If specific roles are required, check if user has one of them
    if (allowedRoles && userRole && !allowedRoles.includes(userRole as 'athlete' | 'coach' | 'recruiter')) {
      router.push('/'); // Redirect to home if role not allowed
      return;
    }

    // Note: We don't need to check for missing roles here anymore
    // The middleware will automatically redirect users without roles to /onboarding
  }, [user, isLoaded, router, allowedRoles, requireRole]);

  // Show loading state while user data is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 