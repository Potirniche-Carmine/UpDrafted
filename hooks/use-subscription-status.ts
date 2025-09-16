import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'

export interface SubscriptionStatus {
  tier: string
  status: string
  isActive: boolean
  isPremium: boolean
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
}

// Global cache to prevent multiple simultaneous requests
const subscriptionCache = new Map<string, {
  data: SubscriptionStatus | null
  timestamp: number
  promise: Promise<void> | null
}>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useSubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isSignedIn, userId } = useAuth()
  const fetchingRef = useRef(false)

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!isSignedIn || !userId || fetchingRef.current) {
      return
    }

    // Check cache first
    const cached = subscriptionCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSubscription(cached.data)
      setLoading(false)
      return
    }

    // If already fetching for this user, wait for that request
    if (cached?.promise) {
      try {
        await cached.promise
        const updatedCache = subscriptionCache.get(userId)
        if (updatedCache) {
          setSubscription(updatedCache.data)
        }
      } catch {
        // If waiting for another request fails, just proceed with our own request
      }
      setLoading(false)
      return
    }

    fetchingRef.current = true
    setLoading(true)
    setError(null)

    const fetchPromise = (async () => {
      try {
        const response = await fetch('/api/subscription/status')
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription status')
        }
        
        const data = await response.json()
        
        let subscriptionData: SubscriptionStatus
        
        if (data.success) {
          // Convert currentPeriodEnd string to Date if it exists
          subscriptionData = {
            ...data.subscription,
            currentPeriodEnd: data.subscription.currentPeriodEnd 
              ? new Date(data.subscription.currentPeriodEnd) 
              : null
          }
        } else {
          throw new Error(data.error || 'Unknown error')
        }

        // Cache the result
        subscriptionCache.set(userId, {
          data: subscriptionData,
          timestamp: Date.now(),
          promise: null
        })

        setSubscription(subscriptionData)
      } catch (err) {
        console.error('Error fetching subscription status:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        
        // Set default free tier values on error
        const defaultSubscription: SubscriptionStatus = {
          tier: 'free',
          status: 'active',
          isActive: true,
          isPremium: false,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false
        }

        subscriptionCache.set(userId, {
          data: defaultSubscription,
          timestamp: Date.now(),
          promise: null
        })

        setSubscription(defaultSubscription)
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    })()

    // Store the promise in cache
    subscriptionCache.set(userId, {
      data: null,
      timestamp: Date.now(),
      promise: fetchPromise
    })

    await fetchPromise
  }, [isSignedIn, userId])

  // Manual refetch function that clears cache
  const refetch = useCallback(async () => {
    if (userId) {
      subscriptionCache.delete(userId)
      fetchingRef.current = false
      await fetchSubscriptionStatus()
    }
  }, [fetchSubscriptionStatus, userId])

  useEffect(() => {
    if (isSignedIn && userId) {
      fetchSubscriptionStatus()
    } else {
      setSubscription(null)
      setLoading(false)
    }
  }, [fetchSubscriptionStatus, isSignedIn, userId])

  return {
    subscription,
    loading,
    error,
    refetch
  }
}