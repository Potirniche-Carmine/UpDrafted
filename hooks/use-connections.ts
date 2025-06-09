import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface ConnectionsState {
  pendingCount: number;
  lastFetched: number | null;
  setPendingCount: (count: number) => void;
  fetchPendingCount: (token: string) => Promise<void>;
}

interface ClerkSession {
    getToken: () => Promise<string>;
}

interface WindowWithClerk extends Window {
    Clerk?: {
        session?: ClerkSession;
    };
}

const useConnectionsStore = create(
  persist<ConnectionsState>(
    (set) => ({
      pendingCount: 0,
      lastFetched: null,
      setPendingCount: (count) => set({ pendingCount: count, lastFetched: Date.now() }),
      fetchPendingCount: async (token) => {
        try {
          const response = await fetch('/api/connections', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set({ pendingCount: data.pendingRequests?.length || 0, lastFetched: Date.now() });
            }
          }
        } catch (error) {
          console.error('Failed to fetch pending connections count:', error);
        }
      },
    }),
    {
      name: 'connections-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// React hook to use the store and fetch data
export const useConnections = () => {
  const { pendingCount, lastFetched, fetchPendingCount, setPendingCount } = useConnectionsStore();
  const [isFetching, setIsFetching] = useState(false);
  const pathname = usePathname();

  const fetchWithToken = useCallback(async () => {
    const windowWithClerk = window as WindowWithClerk;
    if (typeof windowWithClerk !== 'undefined' && windowWithClerk.Clerk?.session) {
      setIsFetching(true);
      try {
        const token = await windowWithClerk.Clerk.session.getToken();
        if (token) {
          await fetchPendingCount(token);
        }
      } catch (error) {
        console.error('Error fetching connections count with token:', error);
      } finally {
        setIsFetching(false);
      }
    }
  }, [fetchPendingCount]);

  useEffect(() => {
    // Only fetch on the client if we haven't fetched before
    const windowWithClerk = window as WindowWithClerk;
    if (typeof windowWithClerk !== 'undefined' && lastFetched === null && pathname !== '/connections') {
      fetchWithToken();
    }
  }, [lastFetched, pathname, fetchWithToken]);

  const refetch = useCallback(() => {
    return fetchWithToken();
  }, [fetchWithToken]);

  return { pendingCount, isFetching, refetch, setPendingCount };
};
