import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { type ProfileCompletion } from '@/app/(profiles)/lib/profile-completion';

/**
 * Smart Profile Completion Hook with Intelligent Caching
 * 
 * This hook provides profile completion data with the following features:
 * - Local storage caching (30 minutes)
 * - Automatic cache invalidation
 * - Manual refresh and recalculation
 * - Reduced API calls
 * 
 * Usage:
 * ```tsx
 * const { completion, loading, invalidateCache } = useProfileCompletion(userId, userType);
 * 
 * // After updating profile data:
 * await updateProfile(data);
 * invalidateCache(); // This will force a refresh on next access
 * ```
 */

interface CachedCompletion {
  data: ProfileCompletion;
  timestamp: number;
  profileLastUpdated?: number;
}

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes cache duration
const CACHE_KEY_PREFIX = 'profile-completion-';

export function useProfileCompletion(userId: string | undefined, userType: 'athlete' | 'coach' | 'recruiter' | null) {
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  // Generate cache key
  const getCacheKey = useCallback((userId: string, userType: string) => {
    return `${CACHE_KEY_PREFIX}${userId}-${userType}`;
  }, []);

  // Get cached data
  const getCachedCompletion = useCallback((userId: string, userType: string): CachedCompletion | null => {
    try {
      const cacheKey = getCacheKey(userId, userType);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedCache: CachedCompletion = JSON.parse(cached);
        
        // Check if cache is still valid
        if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
          return parsedCache;
        }
      }
    } catch (error) {
      console.warn('Failed to read cached completion data:', error);
    }
    return null;
  }, [getCacheKey]);

  // Set cached data
  const setCachedCompletion = useCallback((userId: string, userType: string, data: ProfileCompletion) => {
    try {
      const cacheKey = getCacheKey(userId, userType);
      const cacheData: CachedCompletion = {
        data,
        timestamp: Date.now(),
        profileLastUpdated: data.profileLastUpdated?.getTime(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache completion data:', error);
    }
  }, [getCacheKey]);

  // Clear cache for a specific user/type
  const clearCache = useCallback((userId: string, userType: string) => {
    try {
      const cacheKey = getCacheKey(userId, userType);
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Failed to clear completion cache:', error);
    }
  }, [getCacheKey]);

  // Fetch from API
  const fetchFromAPI = useCallback(async (userId: string, userType: string) => {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`/api/profile-completion?userType=${userType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch profile completion');
    }
  }, [getToken]);

  // Main fetch function with caching logic
  const fetchCompletion = useCallback(async (forceRefresh = false) => {
    if (!userId || !userType) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Check cache first (unless forced refresh)
      if (!forceRefresh) {
        const cached = getCachedCompletion(userId, userType);
        if (cached) {
          setCompletion(cached.data);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      setLoading(true);
      const data = await fetchFromAPI(userId, userType);
      
      // Cache the new data
      setCachedCompletion(userId, userType, data);
      setCompletion(data);
      
    } catch (error) {
      console.error('Error fetching profile completion:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setCompletion(null);
    } finally {
      setLoading(false);
    }
  }, [userId, userType, getCachedCompletion, fetchFromAPI, setCachedCompletion]);

  // Initial fetch on mount
  useEffect(() => {
    fetchCompletion();
  }, [fetchCompletion]);

  // Recalculate function (forces refresh and clears cache)
  const recalculate = useCallback(async (forceRecalculate = false) => {
    if (!userId || !userType) return null;

    try {
      setLoading(true);
      setError(null);
      
      // Clear cache since we're forcing a recalculation
      clearCache(userId, userType);
      
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch('/api/profile-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userType,
          forceRecalculate,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Cache the new data
        setCachedCompletion(userId, userType, result.data);
        setCompletion(result.data);
        return result.data;
      } else {
        setError(result.error || 'Failed to recalculate profile completion');
        return null;
      }
    } catch (error) {
      console.error('Error recalculating profile completion:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, userType, getToken, clearCache, setCachedCompletion]);

  // Refresh function (checks cache validity and refreshes if needed)
  const refresh = useCallback(() => {
    fetchCompletion(true);
  }, [fetchCompletion]);

  // Invalidate cache (call this when profile is updated)
  const invalidateCache = useCallback(() => {
    if (userId && userType) {
      clearCache(userId, userType);
    }
  }, [userId, userType, clearCache]);

  return { 
    completion, 
    loading, 
    error, 
    recalculate,
    refresh,
    invalidateCache
  };
} 