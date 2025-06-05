import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

interface UseConnectionsReturn {
  pendingRequestsCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useConnections(): UseConnectionsReturn {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    // Don't fetch if user is not signed in
    if (!isSignedIn) {
      setPendingRequestsCount(0);
      return;
    }

    // Don't fetch if user is on onboarding page
    if (pathname?.startsWith('/onboarding')) {
      setPendingRequestsCount(0);
      return;
    }

    // Don't fetch if user doesn't have a role yet
    const userRole = user?.publicMetadata?.role as string;
    if (!userRole || !['athlete', 'coach', 'recruiter'].includes(userRole)) {
      setPendingRequestsCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      const response = await fetch('/api/connections', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }

      const result = await response.json();
      if (result.success) {
        setPendingRequestsCount(result.pendingRequests?.length || 0);
      } else {
        throw new Error(result.error || 'Failed to fetch connections');
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch connections');
      setPendingRequestsCount(0);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, pathname, user?.publicMetadata?.role]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    pendingRequestsCount,
    loading,
    error,
    refetch: fetchConnections
  };
} 