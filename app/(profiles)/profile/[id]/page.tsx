"use client";

import { notFound } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { Suspense } from 'react';
import { AthleteProfileWrapper } from '../../components/athlete-profile-wrapper';
import { CoachProfileWrapper } from '../../components/coach-profile-wrapper';
import { RecruiterProfileWrapper } from '../../components/recruiter-profile-wrapper';
import type { AthleteProfileData } from '../../components/athlete-profile';
import type { CoachProfileData, RecruitingProfileData } from '../../lib/base-profile-types';

// Client-side cache to prevent redundant API calls
const profileCache = new Map<string, { data: ProfileApiResponse; timestamp: number; }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

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
}

// Loading component for better UX
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="container py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="bg-card rounded-lg p-6">
              <div className="w-32 h-32 md:w-36 md:h-36 mx-auto rounded-full bg-muted"></div>
              <div className="mt-4 space-y-2">
                <div className="h-6 bg-muted rounded mx-auto w-48"></div>
                <div className="h-4 bg-muted rounded mx-auto w-32"></div>
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

  const fetchProfile = useCallback(async () => {
    if (!isSignedIn || !isLoaded) return;

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    const cacheKey = `profile-${profileId}`;
    const cached = profileCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProfileData(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Get the session token for authentication
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('Making profile request with token:', token ? 'Token present' : 'No token');

      const response = await fetch(`/api/profile/${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        signal: abortController.signal, // Add abort signal
      });

      if (!response.ok) {
        if (response.status === 404) {
          notFound();
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
      
      // Cache the response
      profileCache.set(cacheKey, { data, timestamp: Date.now() });
      
      // Clean up old cache entries (simple cleanup)
      if (profileCache.size > 50) { // Limit cache size
        const oldestKey = Array.from(profileCache.keys())[0];
        profileCache.delete(oldestKey);
      }
      
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
    fetchProfile();
    
    // Cleanup function to abort request if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProfile]);

  if (!isLoaded || loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Profile</h1>
          <p className="text-muted-foreground">{error}</p>
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
      {profileData.profileType === 'athlete' && (
        <AthleteProfileWrapper
          data={profileData.profile as AthleteProfileData}
          isOwnProfile={profileData.isOwnProfile}
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
    </Suspense>
  );
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setProfileId(resolvedParams.id);
    }
    getParams();
  }, [params]);

  if (!profileId) {
    return <ProfileSkeleton />;
  }

  return <ProfileContent profileId={profileId} />;
} 