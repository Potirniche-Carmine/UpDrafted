import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

interface UseMessagesReturn {
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMessages(): UseMessagesReturn {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    // Don't fetch if user is not signed in
    if (!isSignedIn) {
      setUnreadCount(0);
      return;
    }

    // Don't fetch if user is on onboarding page
    if (pathname?.startsWith('/onboarding')) {
      setUnreadCount(0);
      return;
    }

    // Don't fetch if user doesn't have a role yet
    const userRole = user?.publicMetadata?.role as string;
    if (!userRole || !['athlete', 'coach', 'recruiter'].includes(userRole)) {
      setUnreadCount(0);
      return;
    }

    // Don't fetch if window/tab is not visible
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
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

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'getUnreadCount'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread messages count');
      }

      const result = await response.json();
      if (result.success) {
        setUnreadCount(result.unreadCount || 0);
      } else {
        throw new Error(result.error || 'Failed to fetch unread messages count');
      }
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch unread messages count');
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, pathname, user?.publicMetadata?.role]);

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();
    
    // Helper function to create a random interval between min and max seconds
    const getRandomInterval = () => {
      const min = 45000; // 45 seconds
      const max = 75000; // 75 seconds
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    // Store interval ID
    let intervalId: NodeJS.Timeout;
    
    // Function to start polling
    const startPolling = () => {
      // Clear any existing interval
      if (intervalId) clearInterval(intervalId);
      
      // Set a new interval with a random time
      intervalId = setInterval(() => {
        fetchUnreadCount();
        
        // Reset the interval with a new random time after each fetch
        clearInterval(intervalId);
        intervalId = setInterval(fetchUnreadCount, getRandomInterval());
      }, getRandomInterval());
    };
    
    // Start polling initially
    if (typeof window !== 'undefined') {
      startPolling();
      
      // Handle visibility change to pause/resume polling
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          // When tab becomes visible, fetch immediately and restart polling
          fetchUnreadCount();
          startPolling();
        } else {
          // When tab is hidden, clear the interval
          clearInterval(intervalId);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(intervalId);
      };
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount
  };
} 