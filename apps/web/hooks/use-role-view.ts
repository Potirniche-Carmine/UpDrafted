"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState, useCallback, useRef } from "react";

type ViewRole = 'athlete' | 'coach' | 'recruiter';

interface AdminRolePreferences {
  currentViewingRole: ViewRole | null;
  verificationStatusOverride: boolean;
}

// Module-level deduplication
let pendingPreferencesRequest: Promise<AdminRolePreferences | null> | null = null;
const pendingVerificationRequests = new Map<ViewRole, Promise<boolean>>();
let pendingUpdateRequest: Promise<void> | null = null;

export function useRoleView() {
  const { data: session, isPending } = useSession();
  const [viewingAs, setViewingAs] = useState<ViewRole | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);
  const isMounted = useRef(true);

  const user = session?.user as { id: string; role?: string } | undefined;
  const isAdmin = user?.role === 'admin';
  const actualRole = user?.role as string;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch verification status for current role
  const fetchVerificationStatus = useCallback(async (role: ViewRole): Promise<void> => {
    if (!isAdmin || !isMounted.current || !user?.id) return;

    const existingRequest = pendingVerificationRequests.get(role);
    if (existingRequest) {
      const isVerified = await existingRequest;
      if (isMounted.current) {
        setVerificationStatus(isVerified);
      }
      return;
    }

    const request = (async (): Promise<boolean> => {
      try {
        const response = await fetch(`/api/admin/verification?role=${role}&targetUserId=${user.id}`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const { isVerified } = await response.json();
          return isVerified;
        }
        return false;
      } catch {
        return false;
      } finally {
        pendingVerificationRequests.delete(role);
      }
    })();

    pendingVerificationRequests.set(role, request);
    const isVerified = await request;
    if (isMounted.current) {
      setVerificationStatus(isVerified);
    }
  }, [isAdmin, user?.id]);

  // Fetch admin preferences
  const fetchAdminPreferences = useCallback(async (): Promise<void> => {
    if (!isAdmin || hasFetched.current || !isMounted.current) {
      setLoading(false);
      return;
    }

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

    pendingPreferencesRequest = (async (): Promise<AdminRolePreferences | null> => {
      try {
        const response = await fetch('/api/admin/role-preferences', {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const { preferences }: { preferences: AdminRolePreferences } = await response.json();
          return preferences;
        }
        return null;
      } catch {
        return null;
      } finally {
        pendingPreferencesRequest = null;
      }
    })();

    const preferences = await pendingPreferencesRequest;
    if (preferences && isMounted.current) {
      setViewingAs(preferences.currentViewingRole);
      if (preferences.currentViewingRole) {
        await fetchVerificationStatus(preferences.currentViewingRole);
      } else {
        setVerificationStatus(false);
      }
    }

    if (isMounted.current) {
      setLoading(false);
    }
  }, [isAdmin, fetchVerificationStatus]);

  // Update verification status
  const updateVerificationStatus = useCallback(async (role: ViewRole, isVerified: boolean): Promise<void> => {
    if (!isAdmin || !isMounted.current || !user?.id) return;

    try {
      const response = await fetch('/api/admin/verification', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ role, isVerified, targetUserId: user.id })
      });

      if (response.ok && isMounted.current) {
        setVerificationStatus(isVerified);
      }
    } catch {
      // Ignore errors
    }
  }, [isAdmin, user?.id]);

  // Update admin preferences
  const updateAdminPreferences = useCallback(async (currentViewingRole: ViewRole | null): Promise<void> => {
    if (!isAdmin || !isMounted.current) return;

    if (pendingUpdateRequest) {
      return pendingUpdateRequest;
    }

    pendingUpdateRequest = (async () => {
      try {
        const response = await fetch('/api/admin/role-preferences', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ currentViewingRole, verificationStatusOverride: false })
        });

        if (response.ok && isMounted.current) {
          setViewingAs(currentViewingRole);
          if (currentViewingRole) {
            await fetchVerificationStatus(currentViewingRole);
          } else {
            setVerificationStatus(false);
          }
        }
      } catch {
        // Ignore errors
      } finally {
        pendingUpdateRequest = null;
      }
    })();

    return pendingUpdateRequest;
  }, [isAdmin, fetchVerificationStatus]);

  useEffect(() => {
    if (isPending) return;

    if (isAdmin && !hasFetched.current && isMounted.current) {
      fetchAdminPreferences();
    } else if (!isAdmin && isMounted.current) {
      setLoading(false);
      hasFetched.current = false;
    }
  }, [isAdmin, isPending, fetchAdminPreferences]);

  const effectiveRole = isAdmin && viewingAs ? viewingAs : actualRole;
  const effectiveVerificationStatus = isAdmin ? verificationStatus : false;

  return {
    isAdmin,
    actualRole,
    viewingAs,
    effectiveRole,
    isViewingAsOtherRole: isAdmin && viewingAs !== null,
    verificationStatus: effectiveVerificationStatus,
    isVerified: effectiveVerificationStatus,
    loading: loading || isPending,
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