'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from '@/lib/auth-client'

export interface SubscriptionData {
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

export interface SubscriptionFeatures {
  advancedSearch: boolean
  profileViewInsights: boolean
  analytics: boolean
  maxConnectionsPerMonth: number
}

interface UseSubscriptionReturn {
  subscription: SubscriptionData | null
  features: SubscriptionFeatures
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Cache with 5-minute expiry
const subscriptionCache = new Map<string, {
  subscription: SubscriptionData
  features: SubscriptionFeatures
  timestamp: number
}>()

// In-flight request map to dedupe concurrent fetches (e.g. React StrictMode
// double-invoking effects, or two components mounting at the same time).
const pendingFetches = new Map<string, Promise<{
  subscription: SubscriptionData
  features: SubscriptionFeatures
}>>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const DEFAULT_FEATURES: SubscriptionFeatures = {
  advancedSearch: false,
  profileViewInsights: false,
  analytics: false,
  maxConnectionsPerMonth: 5
}

const DEFAULT_SUBSCRIPTION: SubscriptionData = {
  tier: 'free',
  status: 'active',
  isActive: true,
  isPremium: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false
}

const AUTH_RETRY_DELAY_MS = 250

function getCachedData(userId: string) {
  const cached = subscriptionCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached
  }
  return null
}

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchSubscriptionResponse() {
  return fetch('/api/subscription', {
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [features, setFeatures] = useState<SubscriptionFeatures>(DEFAULT_FEATURES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session, isPending } = useSession()

  const userId = session?.user?.id

  const fetchSubscription = useCallback(async (force = false) => {
    if (isPending) return

    if (!userId) {
      setSubscription(DEFAULT_SUBSCRIPTION)
      setFeatures(DEFAULT_FEATURES)
      setLoading(false)
      return
    }

    // Check cache first
    if (!force) {
      const cached = getCachedData(userId)
      if (cached) {
        setSubscription(cached.subscription)
        setFeatures(cached.features)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      // If another caller already kicked off a request for this user, just
      // await its result instead of firing a duplicate /api/subscription call.
      let pending = pendingFetches.get(userId)
      if (!pending) {
        pending = (async () => {
          let response = await fetchSubscriptionResponse()

          if (response.status === 401 || response.status === 403) {
            await delay(AUTH_RETRY_DELAY_MS)
            response = await fetchSubscriptionResponse()
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()

          const subscriptionData: SubscriptionData = {
            ...data.subscription,
            currentPeriodEnd: data.subscription.currentPeriodEnd
              ? new Date(data.subscription.currentPeriodEnd)
              : null
          }

          const featuresData: SubscriptionFeatures = data.features || DEFAULT_FEATURES

          subscriptionCache.set(userId, {
            subscription: subscriptionData,
            features: featuresData,
            timestamp: Date.now()
          })

          return { subscription: subscriptionData, features: featuresData }
        })()

        pendingFetches.set(userId, pending)
        // Always clear the in-flight entry once the promise settles so the
        // next miss can refetch.
        pending.finally(() => {
          if (pendingFetches.get(userId) === pending) {
            pendingFetches.delete(userId)
          }
        })
      }

      const { subscription: subscriptionData, features: featuresData } = await pending

      setSubscription(subscriptionData)
      setFeatures(featuresData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
      setSubscription(DEFAULT_SUBSCRIPTION)
      setFeatures(DEFAULT_FEATURES)
    } finally {
      setLoading(false)
    }
  }, [userId, isPending])

  const refetch = useCallback(async () => {
    if (userId) {
      subscriptionCache.delete(userId)
      await fetchSubscription(true)
    }
  }, [fetchSubscription, userId])

  useEffect(() => {
    if (!isPending && userId) {
      const cached = getCachedData(userId)
      if (cached) {
        setSubscription(cached.subscription)
        setFeatures(cached.features)
      } else {
        fetchSubscription()
      }
    } else if (!isPending && !userId) {
      setSubscription(DEFAULT_SUBSCRIPTION)
      setFeatures(DEFAULT_FEATURES)
    }
  }, [userId, isPending, fetchSubscription])

  return {
    subscription,
    features,
    loading: loading || isPending,
    error,
    refetch
  }
}

export function useHasPremium(): boolean {
  const { subscription } = useSubscription()
  return subscription?.isPremium && subscription?.isActive || false
}

export function useFeatureAccess(): SubscriptionFeatures {
  const { features } = useSubscription()
  return features
}

export function invalidateSubscriptionCache(userId: string): void {
  subscriptionCache.delete(userId)
}
