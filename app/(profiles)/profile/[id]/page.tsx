"use client";

import { notFound } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { Suspense } from 'react';
import { AthleteProfileWrapper } from '../../components/athlete-profile-wrapper';
import { CoachProfileWrapper } from '../../components/coach-profile-wrapper';
import { RecruiterProfileWrapper } from '../../components/recruiter-profile-wrapper';
import { AuthWrapper } from '../../../../components/auth-wrapper';
import { navigationStateManager } from '../../lib/navigation-state';
import type { AthleteProfileData } from '../../components/athlete-profile';
import type { CoachProfileData, RecruitingProfileData } from '../../lib/base-profile-types';

// Global cache that persists across component mounts/unmounts
const globalProfileCache = new Map<string, { 
  data: ProfileApiResponse; 
  timestamp: number; 
  lastAccessed: number;
}>();

const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes (increased from 10 minutes for better cost optimization)
const MAX_CACHE_SIZE = 150; // Increased from 100 to store more profiles

// Cache management utilities
const getCachedProfile = (profileId: string) => {
  const cacheKey = `profile-${profileId}`;
  const cached = globalProfileCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    // Update last accessed time for LRU cleanup
    cached.lastAccessed = Date.now();
    globalProfileCache.set(cacheKey, cached);
    console.log(`Profile cache HIT for ${profileId}`);
    return cached.data;
  }
  
  console.log(`Profile cache MISS for ${profileId}${cached ? ' (expired)' : ' (not found)'}`);
  return null;
};

const setCachedProfile = (profileId: string, data: ProfileApiResponse) => {
  const cacheKey = `profile-${profileId}`;
  const now = Date.now();
  
  globalProfileCache.set(cacheKey, {
    data,
    timestamp: now,
    lastAccessed: now
  });
  
  console.log(`Profile cached for ${profileId}, cache size: ${globalProfileCache.size}`);
  
  // Clean up old cache entries using LRU strategy
  if (globalProfileCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(globalProfileCache.entries());
    const sortedByAccess = entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest 25% of entries or minimum 10, whichever is larger
    const entriesToRemove = Math.max(10, Math.floor(globalProfileCache.size * 0.25));
    for (let i = 0; i < entriesToRemove; i++) {
      globalProfileCache.delete(sortedByAccess[i][0]);
    }
    
    console.log(`Profile cache cleanup: removed ${entriesToRemove} entries, ${globalProfileCache.size} remaining`);
  }
};

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ProfileApiResponse {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any;
  profileType: 'athlete' | 'coach' | 'recruiter';
  isOwnProfile: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  currentUserRole: string;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
}

// Enhanced loading component for better UX
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-card/50 animate-pulse">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-muted rounded"></div>
              <div className="h-8 w-16 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content Skeleton */}
      <div className="container py-4 md:py-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="bg-card rounded-lg p-6">
              <div className="w-32 h-32 md:w-36 md:h-36 mx-auto rounded-full bg-muted"></div>
              <div className="mt-4 space-y-2">
                <div className="h-6 bg-muted rounded mx-auto w-48"></div>
                <div className="h-4 bg-muted rounded mx-auto w-32"></div>
                <div className="h-4 bg-muted rounded mx-auto w-40"></div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-6 space-y-3">
              <div className="h-5 bg-muted rounded w-24"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg p-6">
              <div className="h-6 bg-muted rounded w-32 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-6">
              <div className="h-6 bg-muted rounded w-40 mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileContent({ profileId }: { profileId: string }) {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [profileData, setProfileData] = useState<ProfileApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProfile = useCallback(async (retryCount = 0, forceFresh = false) => {
    // Don't make requests until auth is fully loaded
    if (!isLoaded) return;
    
    // If not signed in after auth is loaded, redirect or show error
    if (!isSignedIn) {
      setError('You must be signed in to view profiles');
      setLoading(false);
      return;
    }

    // Cancel any existing request and retry timeout
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Check global cache first (unless we're forcing a fresh fetch)
    if (!forceFresh) {
      const cachedData = getCachedProfile(profileId);
      if (cachedData) {
        setProfileData(cachedData);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Wait for auth to be fully ready, with progressive delays
      let token = await getToken();
      
      // If no token on first try, wait progressively longer and try again
      if (!token && retryCount < 5) {
        const delay = Math.min(500 * Math.pow(2, retryCount), 3000); // Exponential backoff, max 3s
        await new Promise(resolve => setTimeout(resolve, delay));
        token = await getToken();
      }
      
      if (!token) {
        throw new Error('No authentication token available after multiple attempts');
      }

      const response = await fetch(`/api/profile/${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // Add cache control headers to force fresh fetch when needed
          ...(forceFresh && { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          })
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        if (response.status === 404) {
          // For 404s, if this is the first attempt and we have no cached data, try once more with delay
          if (retryCount === 0) {
            retryTimeoutRef.current = setTimeout(() => {
              fetchProfile(retryCount + 1, true);
            }, 1000);
            return;
          }
          notFound();
          return;
        }
        
        // If unauthorized and this is an early attempt, try again
        if (response.status === 401 && retryCount < 3) {
          const delay = 1000 * (retryCount + 1); // Progressive delay
          retryTimeoutRef.current = setTimeout(() => {
            fetchProfile(retryCount + 1, forceFresh);
          }, delay);
          return;
        }
        
        // Try to get error details from response
        let errorMessage = `Failed to fetch profile: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
            if (errorData.details) {
              errorMessage += ` - ${errorData.details}`;
            }
          }
        } catch {
          // If we can't parse the error response, use the default message
        }
        
        throw new Error(errorMessage);
      }

      const data: ProfileApiResponse = await response.json();
      
      // Cache the response in global cache
      setCachedProfile(profileId, data);
      
      setProfileData(data);
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [profileId, isSignedIn, isLoaded, getToken]);

  useEffect(() => {
    // Only fetch when auth is loaded
    if (isLoaded) {
      // Get navigation source from the global state manager
      const navigationSource = navigationStateManager.getNavigationSource();
      
      // Determine if we should use cache or force fresh based on navigation source
      const shouldForceFresh = navigationSource === 'refresh' || navigationSource === 'direct';
      
      // Small delay to allow for better auth context stability, but only if forcing fresh
      const delay = shouldForceFresh ? 100 : 0;
      
      const timer = setTimeout(() => {
        fetchProfile(0, shouldForceFresh);
      }, delay);
      
      return () => clearTimeout(timer);
    }
    
    // Cleanup function to abort request if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchProfile, isLoaded]);

  // Cleanup navigation state on unmount to prevent leaking between page navigations
  useEffect(() => {
    return () => {
      // Set a timeout to reset after component unmounts
      setTimeout(() => {
        navigationStateManager.reset();
      }, 1000);
    };
  }, []);

  // Clear profile data when profileId changes
  useEffect(() => {
    setProfileData(null);
    setError(null);
    setLoading(true);
  }, [profileId]);

  // Show loading until auth is loaded or while fetching
  if (!isLoaded || loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Profile</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => fetchProfile(0, true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    notFound();
    return null;
  }

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <AuthWrapper 
        requireAuth={true}
        requireRole={['athlete', 'coach', 'recruiter', 'admin']}
        loadingComponent={<ProfileSkeleton />}
      >
        {profileData.profileType === 'athlete' && (
          <AthleteProfileWrapper
            data={profileData.profile as AthleteProfileData}
            isOwnProfile={profileData.isOwnProfile}
            hasPendingVerification={profileData.hasPendingVerification}
            pendingSubmittedAt={profileData.pendingSubmittedAt}
          />
        )}

        {profileData.profileType === 'coach' && (
          <CoachProfileWrapper
            data={profileData.profile as CoachProfileData}
            isOwnProfile={profileData.isOwnProfile}
          />
        )}

        {profileData.profileType === 'recruiter' && (
          <RecruiterProfileWrapper
            data={profileData.profile as RecruitingProfileData}
            isOwnProfile={profileData.isOwnProfile}
          />
        )}
      </AuthWrapper>
    </Suspense>
  );
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [paramsReady, setParamsReady] = useState(false);

  useEffect(() => {
    async function getParams() {
      try {
        const resolvedParams = await params;
        setProfileId(resolvedParams.id);
        setParamsReady(true);
      } catch (error) {
        console.error('Error resolving params:', error);
        setParamsReady(true); // Set to true even on error to prevent infinite loading
      }
    }
    getParams();
  }, [params]);

  // Show loading until params are resolved
  if (!paramsReady || !profileId) {
    return <ProfileSkeleton />;
  }

  return (
    <AuthWrapper 
      requireAuth={true}
      requireRole={['athlete', 'coach', 'recruiter', 'admin']}
      loadingComponent={<ProfileSkeleton />}
    >
      <ProfileContent profileId={profileId} />
    </AuthWrapper>
  );
} 