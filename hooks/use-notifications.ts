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
          const response = await fetch('/api/notifications?operation=getUnreadCount', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
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

// Constants outside the hook to prevent recreation
const FETCH_COOLDOWN = 5 * 60 * 1000; // 5 minutes
const POLLING_INTERVAL = 10 * 60 * 1000; // 10 minutes

// React hook to use the store and fetch data
export const useNotifications = () => {
  const { 
    unreadCount, 
    lastFetched,
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

  const fetchWithToken = useCallback(async (force = false) => {
    // Don't fetch if we're on the notifications page (banner count is cleared there)
    if (pathname === '/notifications') {
      // Clear the count immediately when on notifications page
      setUnreadCount(0);
      return;
    }
    
    // Check if we need to respect cooldown
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;
    
    if (!force && timeSinceLastFetch < FETCH_COOLDOWN) {
      return; // Too soon to fetch again
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
  }, [pathname, fetchUnreadCount, setUnreadCount]);

  // Check once on app startup/login
  useEffect(() => {
    const windowWithClerk = window as WindowWithClerk;
    
    // Only fetch if we haven't checked on this session and user is authenticated
    if (
      typeof windowWithClerk !== 'undefined' &&
      !hasCheckedOnStartup &&
      windowWithClerk.Clerk?.session
    ) {
      fetchWithToken(true); // Force initial fetch
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

    // Clear banner count immediately when on notifications page
    if (isOnNotificationsPage) {
      setUnreadCount(0);
      return; // Don't set up polling when on notifications page
    }

    // Only set up polling if not on notifications page and user is authenticated
    const windowWithClerk = window as WindowWithClerk;
    
    if (typeof windowWithClerk !== 'undefined' && windowWithClerk.Clerk?.session) {
      // Only fetch on page navigation if it's been a while since last fetch
      const now = Date.now();
      if (now - lastFetchRef.current > FETCH_COOLDOWN) {
        fetchWithToken();
      }
      
      // Set up interval for periodic polling (every 10 minutes)
      intervalRef.current = setInterval(() => {
        if (!document.hidden && !isOnNotificationsPage) {
          fetchWithToken();
        }
      }, POLLING_INTERVAL);
    }

    // Cleanup interval when component unmounts or dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pathname, fetchWithToken, isOnNotificationsPage, setUnreadCount]);

  // Handle page visibility changes (less aggressive)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, clear interval to save resources
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Page is visible, restart polling if not on notifications page
        if (!isOnNotificationsPage) {
          // Only fetch if it's been a very long time since last fetch (double cooldown for visibility changes)
          const now = Date.now();
          if (now - lastFetchRef.current > (FETCH_COOLDOWN * 2)) {
            fetchWithToken();
          }
          
          // Restart polling if not already running
          if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
              if (!document.hidden && !isOnNotificationsPage) {
                fetchWithToken();
              }
            }, POLLING_INTERVAL);
          }
        } else {
          // Clear banner count when becoming visible on notifications page
          setUnreadCount(0);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchWithToken, isOnNotificationsPage, setUnreadCount]);

  const refetch = useCallback(() => {
    return fetchWithToken(true); // Force immediate fetch
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

  // Listen for dismissal events to force refetch
  useEffect(() => {
    const handleNotificationsDismissed = () => {
      // Force immediate refetch after dismissal
      fetchWithToken(true);
    };

    window.addEventListener('notifications-dismissed', handleNotificationsDismissed);
    
    return () => {
      window.removeEventListener('notifications-dismissed', handleNotificationsDismissed);
    };
  }, [fetchWithToken]);

  return { 
    // Return 0 for unread count when on notifications page to hide banner
    unreadCount: isOnNotificationsPage ? 0 : unreadCount, 
    isFetching: isFetching || localIsFetching, 
    refetch, 
    setUnreadCount,
    lastFetched
  };
}; 