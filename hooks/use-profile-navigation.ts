import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { navigationStateManager } from '../app/(profiles)/profile/[id]/page';

interface UseProfileNavigationReturn {
  navigateToProfile: (userId?: string) => Promise<void>;
  isNavigating: boolean;
  error: string | null;
}

export function useProfileNavigation(): UseProfileNavigationReturn {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigateToProfile = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId || !isSignedIn || !isLoaded) {
      const errorMsg = 'Cannot navigate to profile: user not authenticated or not loaded';
      setError(errorMsg);
      return;
    }

    // Prevent multiple simultaneous navigation attempts
    if (isNavigating) {
      return;
    }

    try {
      setIsNavigating(true);
      setError(null);
      
      // Set navigation source to indicate this is internal navigation
      navigationStateManager.setNavigationSource('internal');
      
      // Pre-warm the profile route by prefetching it
      await router.prefetch(`/profile/${targetUserId}`);
      
      // Small delay to ensure auth context is stable and prefetch completes
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Navigate to profile
      await router.push(`/profile/${targetUserId}`);
      
    } catch {
      const errorMsg = 'Error navigating to profile';
      setError(errorMsg);
      
      // Fallback to window location if router.push fails
      try {
        window.location.href = `/profile/${targetUserId}`;
      } catch {
        // Silent fallback failure
      }
    } finally {
      setIsNavigating(false);
    }
  };

  return {
    navigateToProfile,
    isNavigating,
    error
  };
} 