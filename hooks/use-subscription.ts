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

    setLoading(true)
    setError(null)

    try {
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

      setSubscription(subscriptionData)
      setFeatures(featuresData)
      
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
      
      // Set defaults on error
      setSubscription(DEFAULT_SUBSCRIPTION)
      setFeatures(DEFAULT_FEATURES)
    } finally {
      setLoading(false)
    }
  }, [isSignedIn, userId])

  const refetch = useCallback(async () => {
    if (userId) {
      subscriptionCache.delete(userId) // Clear cache
      await fetchSubscription(true)
    }
  }, [fetchSubscription, userId])

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
}