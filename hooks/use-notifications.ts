import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";

interface NotificationsState {
  unreadCount: number;
  lastFetched: number | null;
  hasCheckedOnStartup: boolean;
  isFetching: boolean;
  setUnreadCount: (count: number) => void;
  setHasCheckedOnStartup: (checked: boolean) => void;
  setIsFetching: (fetching: boolean) => void;
  fetchUnreadCount: () => Promise<void>;
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
      fetchUnreadCount: async () => {
        // Prevent concurrent requests - but reset if stuck
        const currentState = get();
        if (currentState.isFetching) {
          // Check if request has been stuck for more than 30 seconds
          const now = Date.now();
          const timeSinceLastFetch = currentState.lastFetched ? now - currentState.lastFetched : Infinity;
          if (timeSinceLastFetch < 30000) { // Less than 30 seconds ago
            return;
          }
        }

        set({ isFetching: true });
        try {
          const response = await fetch('/api/notifications?operation=getUnreadCount', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            // Handle different error types
            if (response.status === 401) {
              throw new Error('Authentication failed');
            } else if (response.status === 403) {
              throw new Error('Access forbidden');
            } else if (response.status >= 500) {
              throw new Error('Server error');
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          }

          const data = await response.json();
          if (data.success) {
            // Only update if the count actually changed
            const currentCount = get().unreadCount;
            if (currentCount !== data.unreadCount) {
              set({ unreadCount: data.unreadCount, lastFetched: Date.now() });
            } else {
              // Still update lastFetched even if count is the same
              set({ lastFetched: Date.now() });
            }
          } else {
            console.warn('Failed to fetch unread count:', data.error);
          }
        } catch (error) {
          console.error('Failed to fetch unread notifications count:', error);
          // Don't reset count on network errors to prevent flickering
          if (error instanceof Error && error.message === 'Authentication failed') {
            set({ unreadCount: 0 }); // Reset count only on auth errors
          }
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
const FETCH_COOLDOWN = 30 * 1000; // 30 seconds - industry standard for active users
const POLLING_INTERVAL = 45 * 1000; // 45 seconds - more responsive polling

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
  const { isSignedIn, isLoaded } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isOnNotificationsPage = pathname === '/notifications';
  const lastFetchRef = useRef<number>(0);

  const fetchWithToken = useCallback(async (force = false) => {
    // Don't fetch if Clerk isn't loaded yet or user isn't signed in
    if (!isLoaded || !isSignedIn) {
      return;
    }

    // Don't fetch if we're on the notifications page (banner count is cleared there)
    if (pathname === '/notifications') {
      // Clear the count immediately when on notifications page
      setUnreadCount(0);
      return;
    }

    // Don't fetch if user is in onboarding (they don't have notifications yet)
    if (pathname?.startsWith('/onboarding')) {
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

    setLocalIsFetching(true);
    try {
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error fetching notifications count:', error);
      // Reset state on auth errors to prevent stuck loading states
      if (error instanceof Error && error.message.includes('auth')) {
        setUnreadCount(0);
        setHasCheckedOnStartup(false);
      }
    } finally {
      setLocalIsFetching(false);
    }
  }, [isLoaded, pathname, fetchUnreadCount, setUnreadCount, isSignedIn, setHasCheckedOnStartup]);

  // Check once on app startup/login
  useEffect(() => {
    // Only fetch if Clerk is loaded, user is signed in, and we haven't checked on this session
    if (
      isLoaded &&
      isSignedIn &&
      !hasCheckedOnStartup
    ) {
      fetchWithToken(true); // Force initial fetch
      setHasCheckedOnStartup(true);
    }
  }, [isLoaded, isSignedIn, hasCheckedOnStartup, fetchWithToken, setHasCheckedOnStartup]);

  // Set up periodic polling when navigating between pages
  useEffect(() => {
    // Don't do anything if Clerk isn't loaded yet
    if (!isLoaded) {
      return;
    }

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

    // Only set up polling if user is authenticated
    if (isSignedIn) {
      // Always fetch once on page navigation (remove cooldown for page changes)
      fetchWithToken(true);

      // Set up interval for periodic polling
      intervalRef.current = setInterval(() => {
        if (!document.hidden && !isOnNotificationsPage && isSignedIn) {
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
  }, [isLoaded, pathname, fetchWithToken, isOnNotificationsPage, setUnreadCount, isSignedIn]);  // Handle page visibility changes (less aggressive)
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
          // Only fetch if it's been a while since last fetch (use standard cooldown for visibility changes)
          const now = Date.now();
          if (now - lastFetchRef.current > FETCH_COOLDOWN) {
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

  // Reset startup check when user logs out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setHasCheckedOnStartup(false);
      // Clear any polling when logged out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Clear stored count when logged out
      setUnreadCount(0);
    }
  }, [isLoaded, isSignedIn, setHasCheckedOnStartup, setUnreadCount]);

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
    // Return 0 for unread count when on notifications page or onboarding to hide banner
    unreadCount: (isOnNotificationsPage || pathname?.startsWith('/onboarding')) ? 0 : unreadCount,
    isFetching: isFetching || localIsFetching,
    refetch,
    setUnreadCount,
    lastFetched
  };
}; 