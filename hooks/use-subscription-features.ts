import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { createSecureHeaders } from '@/utils/clerk-security';

interface SubscriptionFeatures {
  advancedSearch: boolean;
  profileViewInsights: boolean;
  analytics: boolean;
}

interface SubscriptionData {
  tier: string;
  status: string;
  currentPeriodEnd: string | null;
}

interface UseSubscriptionFeaturesReturn {
  features: SubscriptionFeatures;
  subscription: SubscriptionData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Cache to prevent duplicate API calls across components
let cachedFeatures: SubscriptionFeatures | null = null;
let cachedSubscription: SubscriptionData | null = null;
let cacheTimestamp: number = 0;
let activeRequest: Promise<void> | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_FEATURES: SubscriptionFeatures = {
  advancedSearch: false,
  profileViewInsights: false,
  analytics: false,
};

export function useSubscriptionFeatures(): UseSubscriptionFeaturesReturn {
  const { user } = useUser();
  const [features, setFeatures] = useState<SubscriptionFeatures>(cachedFeatures || DEFAULT_FEATURES);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(cachedSubscription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async (force = false) => {
    if (!user?.id) {
      setFeatures(DEFAULT_FEATURES);
      setSubscription(null);
      return;
    }

    // Use cache if available and not expired
    const now = Date.now();
    if (!force && cachedFeatures && (now - cacheTimestamp) < CACHE_DURATION) {
      setFeatures(cachedFeatures);
      setSubscription(cachedSubscription);
      return;
    }

    // If there's already an active request, wait for it
    if (activeRequest) {
      try {
        await activeRequest;
        if (cachedFeatures) {
          setFeatures(cachedFeatures);
          setSubscription(cachedSubscription);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error waiting for active subscription request:', err);
        }
      }
      return;
    }

    setLoading(true);
    setError(null);

    const fetchPromise = (async () => {
      try {
        const windowWithClerk = window as unknown as {
          Clerk?: {
            session?: {
              getToken: () => Promise<string>;
            };
          };
        };
        
        const token = await windowWithClerk.Clerk?.session?.getToken();
        
        const response = await fetch('/api/subscription/features', {
          headers: createSecureHeaders(token || '')
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Update cache
        cachedFeatures = data.features || DEFAULT_FEATURES;
        cachedSubscription = data.subscription || null;
        cacheTimestamp = Date.now();
        
        // Update state
        setFeatures(cachedFeatures || DEFAULT_FEATURES);
        setSubscription(cachedSubscription);
        
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error checking subscription:', err);
        }
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription features';
        setError(errorMessage);
        
        // Set default values on error
        setFeatures(DEFAULT_FEATURES);
        setSubscription(null);
      } finally {
        setLoading(false);
        activeRequest = null;
      }
    })();

    activeRequest = fetchPromise;
    await fetchPromise;
  }, [user?.id]);

  const refetch = useCallback(async () => {
    await fetchFeatures(true);
  }, [fetchFeatures]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  return {
    features,
    subscription,
    loading,
    error,
    refetch,
  };
}