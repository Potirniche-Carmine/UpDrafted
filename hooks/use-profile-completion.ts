import { useState, useEffect } from 'react';
import { type ProfileCompletion } from '@/lib/profile-completion';

export function useProfileCompletion(userId: string | undefined, userType: 'athlete' | 'coach' | 'recruiter' | null) {
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompletion() {
      if (!userId || !userType) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await fetch(`/api/profile-completion?userType=${userType}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setCompletion(result.data);
        } else {
          setError(result.error || 'Failed to fetch profile completion');
          setCompletion(null);
        }
      } catch (error) {
        console.error('Error fetching profile completion:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setCompletion(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCompletion();
  }, [userId, userType]);

  const recalculate = async (forceRecalculate = false) => {
    if (!userId || !userType) return null;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/profile-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
  };

  return { 
    completion, 
    loading, 
    error, 
    recalculate 
  };
} 