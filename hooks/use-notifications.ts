import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface NotificationsState {
  unreadCount: number;
  lastFetched: number | null;
  hasCheckedOnStartup: boolean;
  isFetching: boolean;
  setUnreadCount: (count: number) => void;
  setHasCheckedOnStartup: (checked: boolean) => void;
  setIsFetching: (fetching: boolean) => void;
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

const useNotificationsStore = create(
  persist<NotificationsState>(
    (set, get) => ({
      unreadCount: 0,
      lastFetched: null,
      hasCheckedOnStartup: false,
      isFetching: false,
      setUnreadCount: (count) => {
        // Prevent unnecessary updates if count is the same
        if (get().unreadCount !== count) {
          set({ unreadCount: count, lastFetched: Date.now() });
        }
      },
      setHasCheckedOnStartup: (checked) => set({ hasCheckedOnStartup: checked }),
      setIsFetching: (fetching) => set({ isFetching: fetching }),
      fetchUnreadCount: async (token) => {
        // Prevent concurrent requests
        if (get().isFetching) return;
        
        set({ isFetching: true });
        try {
          const response = await fetch('/api/notifications', {
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
              // Only update if the count actually changed
              const currentCount = get().unreadCount;
              if (currentCount !== data.unreadCount) {
                set({ unreadCount: data.unreadCount, lastFetched: Date.now() });
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch unread notifications count:', error);
        } finally {
          set({ isFetching: false });
        }
      },
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// React hook to use the store and fetch data
export const useNotifications = () => {
  const { 
    unreadCount, 
    hasCheckedOnStartup, 
    isFetching,
    fetchUnreadCount, 
    setUnreadCount, 
    setHasCheckedOnStartup 
  } = useNotificationsStore();
  const [localIsFetching, setLocalIsFetching] = useState(false);
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isOnNotificationsPage = pathname === '/notifications';
  const lastFetchRef = useRef<number>(0);

  const fetchWithToken = useCallback(async () => {
    // Don't fetch if we're on the notifications page (let the page handle it)
    if (isOnNotificationsPage) return;
    
    // Prevent rapid successive calls with longer debounce
    const now = Date.now();
    if (now - lastFetchRef.current < 30000) { // 30 second debounce (increased from 10)
      return;
    }
    lastFetchRef.current = now;
    
    const windowWithClerk = window as WindowWithClerk;
    if (typeof windowWithClerk !== 'undefined' && windowWithClerk.Clerk?.session) {
      setLocalIsFetching(true);
      try {
        const token = await windowWithClerk.Clerk.session.getToken();
        if (token) {
          await fetchUnreadCount(token);
        }
      } catch (error) {
        console.error('Error fetching notifications count with token:', error);
      } finally {
        setLocalIsFetching(false);
      }
    }
  }, [fetchUnreadCount, isOnNotificationsPage]);

  // Check once on app startup/login
  useEffect(() => {
    const windowWithClerk = window as WindowWithClerk;
    
    // Only fetch if we haven't checked on this session and user is authenticated
    if (
      typeof windowWithClerk !== 'undefined' &&
      !hasCheckedOnStartup &&
      windowWithClerk.Clerk?.session
    ) {
      fetchWithToken();
      setHasCheckedOnStartup(true);
    }
  }, [hasCheckedOnStartup, fetchWithToken, setHasCheckedOnStartup]);

  // Set up periodic polling when navigating between pages
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only set up polling if not on notifications page and user is authenticated
    if (!isOnNotificationsPage) {
      const windowWithClerk = window as WindowWithClerk;
      
      if (typeof windowWithClerk !== 'undefined' && windowWithClerk.Clerk?.session) {
        // Only fetch on navigation if we haven't fetched recently (avoid duplicate calls)
        const now = Date.now();
        if (now - lastFetchRef.current > 30000) { // 30 second cooldown between navigation fetches
          fetchWithToken();
        }
        
        // Set up interval for periodic polling (every 2 minutes)
        intervalRef.current = setInterval(() => {
          if (!document.hidden && !isOnNotificationsPage) {
            fetchWithToken();
          }
        }, 2 * 60 * 1000); // 2 minutes
      }
    }

    // Cleanup interval when component unmounts or dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pathname, isOnNotificationsPage, fetchWithToken]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Page is visible, restart polling if not on notifications page
        if (!isOnNotificationsPage) {
          // Only fetch if we haven't fetched very recently
          const now = Date.now();
          if (now - lastFetchRef.current > 30000) { // 30 second cooldown
            fetchWithToken();
          }
          
          if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
              if (!document.hidden && !isOnNotificationsPage) {
                fetchWithToken();
              }
            }, 2 * 60 * 1000); // 2 minutes
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchWithToken, isOnNotificationsPage]);

  const refetch = useCallback(() => {
    lastFetchRef.current = 0; // Reset debounce
    return fetchWithToken();
  }, [fetchWithToken]);

  // Reset startup check when user logs out (pathname changes to non-authenticated pages)
  useEffect(() => {
    if (pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up') {
      setHasCheckedOnStartup(false);
      // Clear any polling when logged out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [pathname, setHasCheckedOnStartup]);

  return { 
    unreadCount, 
    isFetching: isFetching || localIsFetching, 
    refetch, 
    setUnreadCount 
  };
}; 