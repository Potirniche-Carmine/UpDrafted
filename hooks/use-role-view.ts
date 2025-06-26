"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback, useRef } from "react";

type ViewRole = 'athlete' | 'coach' | 'recruiter';

interface AdminRolePreferences {
  currentViewingRole: ViewRole | null;
  verificationStatusOverride: boolean;
}

export function useRoleView() {
  const { user } = useUser();
  const [viewingAs, setViewingAs] = useState<ViewRole | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const actualRole = user?.publicMetadata?.role as string;

  // Fetch verification status for current role
  const fetchVerificationStatus = useCallback(async (role: ViewRole) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`/api/admin/verification?role=${role}`);
      if (response.ok) {
        const { isVerified } = await response.json();
        setVerificationStatus(isVerified);
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    }
  }, [isAdmin]);

  // Fetch admin preferences from database
  const fetchAdminPreferences = useCallback(async () => {
    if (!isAdmin || hasFetched.current) {
      setLoading(false);
      return;
    }

    hasFetched.current = true;

    try {
      const response = await fetch('/api/admin/role-preferences');
      if (response.ok) {
        const { preferences }: { preferences: AdminRolePreferences } = await response.json();
        setViewingAs(preferences.currentViewingRole);
        
        // Fetch verification status for the current role
        if (preferences.currentViewingRole) {
          await fetchVerificationStatus(preferences.currentViewingRole);
        } else {
          setVerificationStatus(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, fetchVerificationStatus]);

  // Update verification status in database
  const updateVerificationStatus = useCallback(async (role: ViewRole, isVerified: boolean) => {
    if (!isAdmin) return;

    try {
      const response = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          isVerified
        })
      });

      if (response.ok) {
        setVerificationStatus(isVerified);
      }
    } catch (error) {
      console.error('Failed to update verification status:', error);
    }
  }, [isAdmin]);

  // Update admin preferences in database
  const updateAdminPreferences = useCallback(async (
    currentViewingRole: ViewRole | null
  ) => {
    if (!isAdmin) return;

    try {
      const response = await fetch('/api/admin/role-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentViewingRole,
          verificationStatusOverride: false // Remove this since it's role-specific now
        })
      });

      if (response.ok) {
        setViewingAs(currentViewingRole);
        
        // Fetch verification status for the new role
        if (currentViewingRole) {
          await fetchVerificationStatus(currentViewingRole);
        } else {
          setVerificationStatus(false);
        }
      }
    } catch (error) {
      console.error('Failed to update admin preferences:', error);
    }
  }, [isAdmin, fetchVerificationStatus]);

  useEffect(() => {
    if (isAdmin && !hasFetched.current) {
      fetchAdminPreferences();
    } else if (!isAdmin) {
      setLoading(false);
      hasFetched.current = false; // Reset for when user becomes admin
    }
  }, [isAdmin, fetchAdminPreferences]);

  // Return the role to use for UI logic
  const effectiveRole = isAdmin && viewingAs ? viewingAs : actualRole;
  
  // Return the verification status - use admin override if admin, otherwise default to false
  const effectiveVerificationStatus = isAdmin ? verificationStatus : false;

  return {
    isAdmin,
    actualRole,
    viewingAs,
    effectiveRole,
    isViewingAsOtherRole: isAdmin && viewingAs !== null,
    verificationStatus: effectiveVerificationStatus,
    isVerified: effectiveVerificationStatus,
    loading,
    updateAdminPreferences,
    setViewingAs: (role: ViewRole | null) => {
      if (isAdmin) {
        updateAdminPreferences(role);
      }
    },
    setVerificationStatus: (status: boolean) => {
      if (isAdmin && viewingAs) {
        updateVerificationStatus(viewingAs, status);
      }
    }
  };
} 