/*import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface MessagesState {
  unreadCount: number;
  lastFetched: number | null;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: (token: string) => Promise<void>;
}

interface ClerkSession {
    getToken: () => Promise<string>;
}

interface WindowWithClerk extends Window {
    Clerk?: {
        session?: ClerkSession;
    };
}

const useMessagesStore = create(
  persist<MessagesState>(
    (set) => ({
      unreadCount: 0,
      lastFetched: null,
      setUnreadCount: (count) => set({ unreadCount: count, lastFetched: Date.now() }),
      fetchUnreadCount: async (token) => {
        try {
          const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ operation: 'getUnreadCount' })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set({ unreadCount: data.totalUnreadCount, lastFetched: Date.now() });
            }
          }
        } catch (error) {
          console.error('Failed to fetch unread message count:', error);
        }
      },
    }),
    {
      name: 'messages-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// React hook to use the store and fetch data
export const useMessages = () => {
  const { unreadCount, lastFetched, fetchUnreadCount, setUnreadCount } = useMessagesStore();
  const [isFetching, setIsFetching] = useState(false);
  const pathname = usePathname();

  const fetchWithToken = useCallback(async () => {
    // Check if Clerk is loaded and user is available
    const windowWithClerk = window as WindowWithClerk;
    if (typeof windowWithClerk !== 'undefined' && windowWithClerk.Clerk?.session) {
      setIsFetching(true);
      try {
        const token = await windowWithClerk.Clerk.session.getToken();
        if (token) {
          await fetchUnreadCount(token);
        }
      } catch (error) {
        console.error('Error fetching message count with token:', error);
      } finally {
        setIsFetching(false);
      }
    }
  }, [fetchUnreadCount]);

  useEffect(() => {
    const now = Date.now();
    const oneMinute = 1 * 60 * 1000; // 1 minute
    const windowWithClerk = window as WindowWithClerk;
    // Fetch if we are on the client, not on the messages page, and the data is stale or never fetched.
    if (
      typeof windowWithClerk !== 'undefined' &&
      pathname !== '/messages' &&
      (!lastFetched || now - lastFetched > oneMinute)
    ) {
      fetchWithToken();
    }
  }, [lastFetched, pathname, fetchWithToken]);

  const refetch = useCallback(() => {
    return fetchWithToken();
  }, [fetchWithToken]);

  return { unreadCount, isFetching, refetch, setUnreadCount };
};
*/
