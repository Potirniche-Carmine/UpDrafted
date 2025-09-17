"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
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

interface SubscriptionContextType {
  subscription: SubscriptionData | null
  loading: boolean
  refetch: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// In-memory cache for subscription data
const subscriptionCache = new Map<string, {
  data: SubscriptionData
  timestamp: number
}>()

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(false)
  const { isSignedIn, userId } = useAuth()

  const fetchSubscription = useCallback(async (force = false) => {
    if (!isSignedIn || !userId) {
      setSubscription(null)
      return
    }

    // Check cache first (unless forced)
    if (!force) {
      const cached = subscriptionCache.get(userId)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setSubscription(cached.data)
        return
      }
    }

    setLoading(true)
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        const subscriptionData: SubscriptionData = {
          ...data.subscription,
          currentPeriodEnd: data.subscription.currentPeriodEnd 
            ? new Date(data.subscription.currentPeriodEnd) 
            : null
        }
        
        // Update cache
        subscriptionCache.set(userId, {
          data: subscriptionData,
          timestamp: Date.now()
        })
        
        setSubscription(subscriptionData)
      } else {
        console.error('Failed to fetch subscription status')
        // Default to free tier on error
        const defaultData: SubscriptionData = {
          tier: 'free',
          status: 'active',
          isActive: true,
          isPremium: false,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false
        }
        setSubscription(defaultData)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      // Default to free tier on error
      const defaultData: SubscriptionData = {
        tier: 'free',
        status: 'active',
        isActive: true,
        isPremium: false,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      }
      setSubscription(defaultData)
    } finally {
      setLoading(false)
    }
  }, [isSignedIn, userId])

  // Fetch on mount and when auth state changes
  useEffect(() => {
    fetchSubscription()
  }, [isSignedIn, userId, fetchSubscription])

  // Expose refetch function for manual updates (after subscription changes)
  const refetch = async () => {
    await fetchSubscription(true)
  }

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, refetch }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

// Helper hooks for common subscription checks
export function useHasPremium(): boolean {
  const { subscription } = useSubscription()
  return subscription?.isPremium && subscription?.isActive || false
}

export function useFeatureAccess(): boolean {
  const hasPremium = useHasPremium()
  return hasPremium
}

// Global function to invalidate cache (call from webhooks)
export function invalidateSubscriptionCache(userId: string) {
  subscriptionCache.delete(userId)
}