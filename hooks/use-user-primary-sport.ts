import { useState, useEffect } from 'react';

interface UserSport {
  primarySport: string | null;
  role: string;
  secondarySports?: string[]; // Add secondary sports for recruiters and athletes
}

// Global cache to prevent duplicate API calls
const globalUserSportCache: {
  data: UserSport | null;
  loading: boolean;
  error: string | null;
  promise: Promise<UserSport | null> | null;
} = {
  data: null,
  loading: false,
  error: null,
  promise: null
};

export function useUserPrimarySport() {
  const [userSport, setUserSport] = useState<UserSport | null>(globalUserSportCache.data);
  const [loading, setLoading] = useState(!globalUserSportCache.data && !globalUserSportCache.error);
  const [error, setError] = useState<string | null>(globalUserSportCache.error);

  useEffect(() => {
    // If we already have cached data, use it
    if (globalUserSportCache.data) {
      setUserSport(globalUserSportCache.data);
      setLoading(false);
      setError(null);
      return;
    }

    // If we already have an error, use it
    if (globalUserSportCache.error) {
      setUserSport(null);
      setLoading(false);
      setError(globalUserSportCache.error);
      return;
    }

    // If there's already a request in progress, wait for it
    if (globalUserSportCache.promise) {
      globalUserSportCache.promise
        .then(data => {
          setUserSport(data);
          setLoading(false);
          setError(null);
        })
        .catch(err => {
          setUserSport(null);
          setLoading(false);
          setError(err instanceof Error ? err.message : 'Unknown error');
        });
      return;
    }

    // Make the API call and cache the promise
    const fetchUserSport = async (): Promise<UserSport | null> => {
      try {
        globalUserSportCache.loading = true;
        
        const response = await fetch('/api/user/primary-sport', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user sport');
        }

        const data = await response.json();
        
        // Cache the successful result
        globalUserSportCache.data = data;
        globalUserSportCache.error = null;
        globalUserSportCache.loading = false;
        globalUserSportCache.promise = null;
        
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching user sport:', err);
        
        // Cache the error
        globalUserSportCache.error = errorMessage;
        globalUserSportCache.data = null;
        globalUserSportCache.loading = false;
        globalUserSportCache.promise = null;
        
        throw err;
      }
    };

    globalUserSportCache.promise = fetchUserSport();
    
    globalUserSportCache.promise
      .then(data => {
        setUserSport(data);
        setError(null);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUserSport(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { userSport, loading, error };
}