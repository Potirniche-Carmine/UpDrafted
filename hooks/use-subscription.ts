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

// In development, also use sessionStorage as backup to survive hot reloads
const isDevMode = process.env.NODE_ENV === 'development'

function getCachedData(userId: string) {
  // First check memory cache
  const memoryCache = subscriptionCache.get(userId)
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
    return memoryCache
  }

  // In dev mode, check sessionStorage as fallback
  if (isDevMode && typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`subscription_${userId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          // Restore to memory cache
          subscriptionCache.set(userId, parsed)
          return parsed
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }

  return null
}

function setCachedData(userId: string, data: { subscription: SubscriptionData, features: SubscriptionFeatures, timestamp: number }) {
  // Set in memory cache
  subscriptionCache.set(userId, data)
  
  // In dev mode, also set in sessionStorage
  if (isDevMode && typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`subscription_${userId}`, JSON.stringify(data))
    } catch {
      // Ignore sessionStorage errors (quota exceeded, etc.)
    }
  }
}

function clearCachedData(userId: string) {
  // Clear memory cache
  subscriptionCache.delete(userId)
  
  // Clear sessionStorage cache
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(`subscription_${userId}`)
    } catch {
      // Ignore sessionStorage errors
    }
  }
}

// Pending requests to avoid duplicate API calls with timestamp tracking
const pendingRequests = new Map<string, {
  promise: Promise<{ subscription: SubscriptionData, features: SubscriptionFeatures }>,
  timestamp: number,
  id: string
}>()

// Synchronous lock to prevent multiple simultaneous calls
const activeRequests = new Set<string>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes (much shorter for subscription changes)
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
  const { isSignedIn, userId, isLoaded } = useAuth()

  const fetchSubscription = useCallback(async (force = false) => {
    // Wait for Clerk to finish loading before making subscription decisions
    if (!isLoaded) {
      return
    }

    if (!isSignedIn || !userId) {
      setSubscription(DEFAULT_SUBSCRIPTION)
      setFeatures(DEFAULT_FEATURES)
      setLoading(false)
      return
    }

    // Immediate synchronous check to prevent race conditions
    if (activeRequests.has(userId) && !force) {
      return
    }

    // Check cache first (unless forced) - use shorter cache duration for subscription changes
    if (!force) {
      const cached = getCachedData(userId)
      if (cached) {
        setSubscription(cached.subscription)
        setFeatures(cached.features)
        return
      }
    }

    // Check if there's already a pending request for this user
    const pendingRequestEntry = pendingRequests.get(userId)
    if (pendingRequestEntry && !force) {
      try {
        const { subscription: subscriptionData, features: featuresData } = await pendingRequestEntry.promise
        setSubscription(subscriptionData)
        setFeatures(featuresData)
        return
      } catch {
        // If pending request failed, continue with new request
        pendingRequests.delete(userId)
      }
    }

    // Mark this request as active immediately
    activeRequests.add(userId)
    
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
      const cacheData = {
        subscription: subscriptionData,
        features: featuresData,
        timestamp: Date.now()
      }
      setCachedData(userId, cacheData)

      return { subscription: subscriptionData, features: featuresData }
    })()

    const requestId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    pendingRequests.set(userId, {
      promise: requestPromise,
      timestamp: Date.now(),
      id: requestId
    })

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
      activeRequests.delete(userId) // Clear the synchronous lock
    }
  }, [isSignedIn, userId, isLoaded])

  const refetch = useCallback(async () => {
    if (userId) {
      // Check if refetch is already in progress
      if (activeRequests.has(userId)) {
        return
      }
      
      clearCachedData(userId) // Clear all caches (memory + sessionStorage)
      pendingRequests.delete(userId) // Clear any pending requests
      await fetchSubscription(true)
    }
  }, [fetchSubscription, userId])

    // Auto-refetch when user changes (for admin switching views)
  useEffect(() => {
    // Wait for Clerk to finish loading
    if (!isLoaded) {
      return
    }

    if (userId) {
      const cached = getCachedData(userId)
      if (!cached) {
        fetchSubscription()
      } else {
        // Use cached data
        setSubscription(cached.subscription)
        setFeatures(cached.features)
      }
    }
  }, [userId, isLoaded, fetchSubscription])

  // Cleanup activeRequests on unmount to prevent blocking future requests
  useEffect(() => {
    return () => {
      if (userId) {
        activeRequests.delete(userId)
        pendingRequests.delete(userId)
      }
    }
  }, [userId])

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
  activeRequests.delete(userId)
}

// Cleanup function to prevent memory leaks
export function cleanupSubscriptionCache(): void {
  const now = Date.now()
  
  // Clean up expired cache entries
  for (const [userId, cached] of subscriptionCache.entries()) {
    if (now - cached.timestamp > CACHE_DURATION) {
      subscriptionCache.delete(userId)
    }
  }
  
  // Clean up stale pending requests (older than 30 seconds)
  for (const [userId, pending] of pendingRequests.entries()) {
    if (now - pending.timestamp > 30000) {
      pendingRequests.delete(userId)
    }
  }
}

// Run cleanup every hour in browser environments
if (typeof window !== 'undefined') {
  setInterval(cleanupSubscriptionCache, 60 * 60 * 1000)
}