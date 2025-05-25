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
    if (!isLoaded) return; 
    
    if (!user) {
      return;
    }

    const userRole = user.publicMetadata?.role as string | undefined;

    if (allowedRoles && userRole && !allowedRoles.includes(userRole as 'athlete' | 'coach' | 'recruiter')) {
      router.push('/'); 
      return;
    }
  }, [user, isLoaded, router, allowedRoles, requireRole]);

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