"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type ViewRole = 'athlete' | 'coach' | 'recruiter';

export function useRoleView() {
  const { user } = useUser();
  const [viewingAs, setViewingAs] = useState<ViewRole | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<boolean | null>(null);
  
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const actualRole = user?.publicMetadata?.role as string;

  useEffect(() => {
    if (isAdmin && typeof window !== 'undefined') {
      const storedRole = sessionStorage.getItem('adminViewingAs') as ViewRole;
      const storedVerification = sessionStorage.getItem('adminVerificationStatus');
      
      if (storedRole) {
        setViewingAs(storedRole);
      }
      
      if (storedVerification !== null) {
        setVerificationStatus(storedVerification === 'true');
      }
    }
  }, [isAdmin]);

  // Return the role to use for UI logic
  const effectiveRole = isAdmin && viewingAs ? viewingAs : actualRole;
  
  // Return the verification status - use admin override if available, otherwise default to false for testing
  const effectiveVerificationStatus = isAdmin && verificationStatus !== null ? verificationStatus : false;

  return {
    isAdmin,
    actualRole,
    viewingAs,
    effectiveRole,
    isViewingAsOtherRole: isAdmin && viewingAs !== null,
    verificationStatus: effectiveVerificationStatus,
    isVerified: effectiveVerificationStatus
  };
} 