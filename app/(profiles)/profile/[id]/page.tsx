"use client";

import { notFound } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
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
    return cached.data;
  }
  
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
  
  // Clean up old cache entries using LRU strategy
  if (globalProfileCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(globalProfileCache.entries());
    const sortedByAccess = entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest 25% of entries or minimum 10, whichever is larger
    const entriesToRemove = Math.max(10, Math.floor(globalProfileCache.size * 0.25));
    for (let i = 0; i < entriesToRemove; i++) {
      globalProfileCache.delete(sortedByAccess[i][0]);
    }
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
  connectionStatus?: "none" | "pending" | "connected";
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
  hasRejectedVerification?: boolean;
  rejectionReason?: string;
  rejectedAt?: string;
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

  // Don't show anything until params are resolved - let AuthWrapper handle loading
  if (!paramsReady || !profileId) {
    return null;
  }

  return (
    <AuthWrapper 
      requireAuth={true}
    >
      <ProfileContentWrapper profileId={profileId} />
    </AuthWrapper>
  );
}

// New wrapper component that only loads after authentication passes
function ProfileContentWrapper({ profileId }: { profileId: string }) {
  return <ProfileContent profileId={profileId} />;
}

function ProfileContent({ profileId }: { profileId: string }) {
  const { getToken } = useAuth();
  const [profileData, setProfileData] = useState<ProfileApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProfile = useCallback(async (retryCount = 0, forceFresh = false) => {
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

      // Get auth token - AuthWrapper already verified user is authenticated
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
  }, [profileId, getToken]);

  useEffect(() => {
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
    
    // Cleanup function to abort request if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchProfile]);

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

  // Loading skeleton - only shows for authenticated users after auth check passes
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header skeleton */}
          <div className="bg-card rounded-lg border shadow-sm mb-6">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile image skeleton */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-muted rounded-full animate-pulse"></div>
                </div>
                
                {/* Profile info skeleton */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="h-8 bg-muted rounded animate-pulse w-64"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-48"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-56"></div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded animate-pulse w-20"></div>
                    <div className="h-6 bg-muted rounded animate-pulse w-24"></div>
                    <div className="h-6 bg-muted rounded animate-pulse w-28"></div>
                  </div>
                </div>
                
                {/* Action buttons skeleton */}
                <div className="flex flex-col gap-2 min-w-fit">
                  <div className="h-10 bg-muted rounded animate-pulse w-32"></div>
                  <div className="h-10 bg-muted rounded animate-pulse w-32"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg border p-4">
                    <div className="h-4 bg-muted rounded animate-pulse w-16 mb-2"></div>
                    <div className="h-6 bg-muted rounded animate-pulse w-12"></div>
                  </div>
                ))}
              </div>
              
              {/* Content sections */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg border p-6">
                  <div className="h-6 bg-muted rounded animate-pulse w-48 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg border p-6">
                  <div className="h-6 bg-muted rounded animate-pulse w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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
    <>
      {profileData.profileType === 'athlete' && (
        <AthleteProfileWrapper
          data={profileData.profile as AthleteProfileData}
          isOwnProfile={profileData.isOwnProfile}
          connectionStatus={profileData.connectionStatus}
          hasPendingVerification={profileData.hasPendingVerification}
          pendingSubmittedAt={profileData.pendingSubmittedAt}
        />
      )}

      {profileData.profileType === 'coach' && (
        <CoachProfileWrapper
          data={profileData.profile as CoachProfileData}
          isOwnProfile={profileData.isOwnProfile}
          connectionStatus={profileData.connectionStatus}
          hasPendingVerification={profileData.hasPendingVerification}
          pendingSubmittedAt={profileData.pendingSubmittedAt}
        />
      )}

      {profileData.profileType === 'recruiter' && (
        <RecruiterProfileWrapper
          data={profileData.profile as RecruitingProfileData}
          isOwnProfile={profileData.isOwnProfile}
          connectionStatus={profileData.connectionStatus}
          hasPendingVerification={profileData.hasPendingVerification}
          pendingSubmittedAt={profileData.pendingSubmittedAt}
          hasRejectedVerification={profileData.hasRejectedVerification}
          rejectionReason={profileData.rejectionReason}
          rejectedAt={profileData.rejectedAt}
        />
      )}
    </>
  );
} 