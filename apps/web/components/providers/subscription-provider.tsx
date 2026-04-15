"use client"

import React, { createContext, useContext } from 'react'
import { useSubscription as useSubscriptionHook, type SubscriptionData, type SubscriptionFeatures } from '@/hooks/use-subscription'

interface SubscriptionContextType {
  subscription: SubscriptionData | null
  features: SubscriptionFeatures
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  // Helper properties
  isPremium: boolean
  isActive: boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { subscription, features, loading, error, refetch } = useSubscriptionHook()

  const contextValue: SubscriptionContextType = {
    subscription,
    features,
    loading,
    error,
    refetch,
    isPremium: subscription?.isPremium || false,
    isActive: subscription?.isActive || false
  }

  return (
    <SubscriptionContext.Provider value={contextValue}>
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
  const { isPremium, isActive } = useSubscription()
  return isPremium && isActive
}

export function useFeatureAccess(): SubscriptionFeatures {
  const { features } = useSubscription()
  return features
}

export function useSubscriptionStatus(): SubscriptionData | null {
  const { subscription } = useSubscription()
  return subscription
}