"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback, useRef } from "react";

type ViewRole = 'athlete' | 'coach' | 'recruiter';

interface AdminRolePreferences {
  currentViewingRole: ViewRole | null;
  verificationStatusOverride: boolean;
}

// Module-level deduplication - shared across all hook instances
let pendingPreferencesRequest: Promise<AdminRolePreferences | null> | null = null;
const pendingVerificationRequests = new Map<ViewRole, Promise<boolean>>();
let pendingUpdateRequest: Promise<void> | null = null;

export function useRoleView() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [viewingAs, setViewingAs] = useState<ViewRole | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  
  // Refs to track component state
  const hasFetched = useRef(false);
  const isMounted = useRef(true);
  
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const actualRole = user?.publicMetadata?.role as string;

  // Cleanup function
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch verification status for current role with deduplication
  const fetchVerificationStatus = useCallback(async (role: ViewRole): Promise<void> => {
    if (!isAdmin || !isMounted.current || !user?.id) return;

    // Check if there's already a pending request for this role
    const existingRequest = pendingVerificationRequests.get(role);
    if (existingRequest) {
      const isVerified = await existingRequest;
      if (isMounted.current) {
        setVerificationStatus(isVerified);
      }
      return;
    }

    // Create new request
    const request = (async (): Promise<boolean> => {
      try {
        const token = await getToken();
        if (!token) {
          console.error('No auth token available');
          return false;
        }

        const response = await fetch(`/api/admin/verification?role=${role}&targetUserId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        if (response.ok) {
          const { isVerified } = await response.json();
          return isVerified;
        }
        return false;
      } catch (error) {
        console.error('Failed to fetch verification status:', error);
        return false;
      } finally {
        // Clean up the pending request
        pendingVerificationRequests.delete(role);
      }
    })();

    // Store the pending request
    pendingVerificationRequests.set(role, request);
    const isVerified = await request;
    if (isMounted.current) {
      setVerificationStatus(isVerified);
    }
  }, [isAdmin, getToken, user?.id]);

  // Fetch admin preferences from database with deduplication
  const fetchAdminPreferences = useCallback(async (): Promise<void> => {
    if (!isAdmin || hasFetched.current || !isMounted.current) {
      setLoading(false);
      return;
    }

    // Check if there's already a pending request
    if (pendingPreferencesRequest) {
      const preferences = await pendingPreferencesRequest;
      if (preferences && isMounted.current) {
        setViewingAs(preferences.currentViewingRole);
        if (preferences.currentViewingRole) {
          await fetchVerificationStatus(preferences.currentViewingRole);
        } else {
          setVerificationStatus(false);
        }
        setLoading(false);
      }
      return;
    }

    hasFetched.current = true;

    // Create new request
    pendingPreferencesRequest = (async (): Promise<AdminRolePreferences | null> => {
      try {
        const token = await getToken();
        if (!token) {
          console.error('No auth token available');
          return null;
        }

        const response = await fetch('/api/admin/role-preferences', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        if (response.ok) {
          const { preferences }: { preferences: AdminRolePreferences } = await response.json();
          return preferences;
        }
        return null;
      } catch (error) {
        console.error('Failed to fetch admin preferences:', error);
        return null;
      } finally {
        // Clean up the pending request
        pendingPreferencesRequest = null;
      }
    })();

    const preferences = await pendingPreferencesRequest;
    if (preferences && isMounted.current) {
      setViewingAs(preferences.currentViewingRole);
      
      // Fetch verification status for the current role
      if (preferences.currentViewingRole) {
        await fetchVerificationStatus(preferences.currentViewingRole);
      } else {
        setVerificationStatus(false);
      }
    }
    
    if (isMounted.current) {
      setLoading(false);
    }
  }, [isAdmin, fetchVerificationStatus, getToken]);

  // Update verification status in database
  const updateVerificationStatus = useCallback(async (role: ViewRole, isVerified: boolean): Promise<void> => {
    if (!isAdmin || !isMounted.current || !user?.id) return;

    try {
      const token = await getToken();
      if (!token) {
        console.error('No auth token available');
        return;
      }

      const response = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          role,
          isVerified,
          targetUserId: user.id
        })
      });

      if (response.ok && isMounted.current) {
        setVerificationStatus(isVerified);
      }
    } catch (error) {
      console.error('Failed to update verification status:', error);
    }
  }, [isAdmin, getToken, user?.id]);

  // Update admin preferences in database with deduplication
  const updateAdminPreferences = useCallback(async (
    currentViewingRole: ViewRole | null
  ): Promise<void> => {
    if (!isAdmin || !isMounted.current) return;

    // Check if there's already a pending update request
    if (pendingUpdateRequest) {
      return pendingUpdateRequest;
    }

    // Create new request
    pendingUpdateRequest = (async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.error('No auth token available');
          return;
        }

        const response = await fetch('/api/admin/role-preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            currentViewingRole,
            verificationStatusOverride: false
          })
        });

        if (response.ok && isMounted.current) {
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
      } finally {
        // Clean up the pending request
        pendingUpdateRequest = null;
      }
    })();

    return pendingUpdateRequest;
  }, [isAdmin, fetchVerificationStatus, getToken]);

  useEffect(() => {
    if (isAdmin && !hasFetched.current && isMounted.current) {
      fetchAdminPreferences();
    } else if (!isAdmin && isMounted.current) {
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