import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { navigationStateManager } from '../app/(profiles)/lib/navigation-state';
import { generateProfileUrl } from '../lib/utils';

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
      
      // Fetch the user's profile data to get their fullName for slug generation
      let profileUrl: string;
      
      if (userId) {
        // If navigating to another user's profile, we need to fetch their profile data
        try {
          const response = await fetch(`/api/profile/${targetUserId}`);
          if (response.ok) {
            const profileData = await response.json();
            if (profileData.profile?.fullName) {
              profileUrl = generateProfileUrl(profileData.profile.fullName, targetUserId);
            } else {
              // Fallback to old format if no fullName
              profileUrl = `/profile/${targetUserId}`;
            }
          } else {
            // Fallback to old format if API call fails
            profileUrl = `/profile/${targetUserId}`;
          }
        } catch {
          // Fallback to old format if API call fails
          profileUrl = `/profile/${targetUserId}`;
        }
      } else {
        // If navigating to own profile, try to get from user metadata first
        const fullName = user?.fullName || user?.firstName + ' ' + user?.lastName;
        if (fullName) {
          profileUrl = generateProfileUrl(fullName, targetUserId);
        } else {
          // Fallback: fetch own profile data
          try {
            const response = await fetch(`/api/profile/${targetUserId}`);
            if (response.ok) {
              const profileData = await response.json();
              if (profileData.profile?.fullName) {
                profileUrl = generateProfileUrl(profileData.profile.fullName, targetUserId);
              } else {
                // Fallback to old format if no fullName
                profileUrl = `/profile/${targetUserId}`;
              }
            } else {
              // Fallback to old format if API call fails
              profileUrl = `/profile/${targetUserId}`;
            }
          } catch {
            // Fallback to old format if API call fails
            profileUrl = `/profile/${targetUserId}`;
          }
        }
      }
      
      // Pre-warm the profile route by prefetching it
      await router.prefetch(profileUrl);
      
      // Small delay to ensure auth context is stable and prefetch completes
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Navigate to profile
      await router.push(profileUrl);
      
    } catch {
      const errorMsg = 'Error navigating to profile';
      setError(errorMsg);
      
      // Fallback to window location if router.push fails
      try {
        // Use fallback URL format
        const fallbackUrl = `/profile/${targetUserId}`;
        window.location.href = fallbackUrl;
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