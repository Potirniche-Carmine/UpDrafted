'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'

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

// Global cache with 24-hour expiry
const subscriptionCache = new Map<string, {
  subscription: SubscriptionData
  features: SubscriptionFeatures
  timestamp: number
}>()

// Pending requests to avoid duplicate API calls
const pendingRequests = new Map<string, Promise<{ subscription: SubscriptionData, features: SubscriptionFeatures }>>()

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
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

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [features, setFeatures] = useState<SubscriptionFeatures>(DEFAULT_FEATURES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isSignedIn, userId } = useAuth()

  const fetchSubscription = useCallback(async (force = false) => {
    if (!isSignedIn || !userId) {
      setSubscription(DEFAULT_SUBSCRIPTION)
      setFeatures(DEFAULT_FEATURES)
      return
    }

    // Check cache first (unless forced)
    if (!force) {
      const cached = subscriptionCache.get(userId)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setSubscription(cached.subscription)
        setFeatures(cached.features)
        return
      }
    }

    // Check if there's already a pending request for this user
    const pendingRequest = pendingRequests.get(userId)
    if (pendingRequest && !force) {
      try {
        const { subscription: subscriptionData, features: featuresData } = await pendingRequest
        setSubscription(subscriptionData)
        setFeatures(featuresData)
        return
      } catch {
        // If pending request failed, continue with new request
        pendingRequests.delete(userId)
      }
    }

    setLoading(true)
    setError(null)

    // Create and store the promise for this request
    const requestPromise = (async () => {
      const response = await fetch('/api/subscription')
      
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

      // Cache for 24 hours
      subscriptionCache.set(userId, {
        subscription: subscriptionData,
        features: featuresData,
        timestamp: Date.now()
      })

      return { subscription: subscriptionData, features: featuresData }
    })()

    pendingRequests.set(userId, requestPromise)

    try {
      const { subscription: subscriptionData, features: featuresData } = await requestPromise
      setSubscription(subscriptionData)
      setFeatures(featuresData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
      
      // Set defaults on error
      setSubscription(DEFAULT_SUBSCRIPTION)
      setFeatures(DEFAULT_FEATURES)
    } finally {
      setLoading(false)
      pendingRequests.delete(userId)
    }
  }, [isSignedIn, userId])

  const refetch = useCallback(async () => {
    if (userId) {
      subscriptionCache.delete(userId) // Clear cache
      pendingRequests.delete(userId) // Clear any pending requests
      await fetchSubscription(true)
    }
  }, [fetchSubscription, userId])

  // Auto-refetch when user changes (for admin switching views)
  useEffect(() => {
    if (userId) {
      const cached = subscriptionCache.get(userId)
      if (!cached) {
        fetchSubscription()
      }
    }
  }, [userId, fetchSubscription])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  return {
    subscription,
    features,
    loading,
    error,
    refetch
  }
}

// Helper hooks for common checks
export function useHasPremium(): boolean {
  const { subscription } = useSubscription()
  return subscription?.isPremium && subscription?.isActive || false
}

export function useFeatureAccess(): SubscriptionFeatures {
  const { features } = useSubscription()
  return features
}

// Global function to invalidate cache (call from webhooks)
export function invalidateSubscriptionCache(userId: string): void {
  subscriptionCache.delete(userId)
  pendingRequests.delete(userId)
}

// Cleanup function to prevent memory leaks
export function cleanupSubscriptionCache(): void {
  const now = Date.now()
  for (const [userId, cached] of subscriptionCache.entries()) {
    if (now - cached.timestamp > CACHE_DURATION) {
      subscriptionCache.delete(userId)
    }
  }
  // Also cleanup any stale pending requests (older than 30 seconds)
  // This should not normally happen but prevents memory leaks
  pendingRequests.clear()
}

// Run cleanup every hour in browser environments
if (typeof window !== 'undefined') {
  setInterval(cleanupSubscriptionCache, 60 * 60 * 1000)
}