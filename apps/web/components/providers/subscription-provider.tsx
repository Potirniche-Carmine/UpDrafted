"use client"

import React, { createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { useSubscription as useSubscriptionHook, type SubscriptionData, type SubscriptionFeatures } from '@/hooks/use-subscription'
import { isUnauthenticatedPagePath } from '@/lib/auth-routing'

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

const DEFAULT_SUBSCRIPTION: SubscriptionData = {
  tier: 'free',
  status: 'active',
  isActive: true,
  isPremium: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
}

const DEFAULT_FEATURES: SubscriptionFeatures = {
  advancedSearch: false,
  profileViewInsights: false,
  analytics: false,
  maxConnectionsPerMonth: 5,
}

function DefaultSubscriptionProvider({
  children,
  loading = false,
}: {
  children: React.ReactNode
  loading?: boolean
}) {
  const contextValue: SubscriptionContextType = {
    subscription: DEFAULT_SUBSCRIPTION,
    features: DEFAULT_FEATURES,
    loading,
    error: null,
    refetch: async () => {},
    isPremium: false,
    isActive: true,
  }

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}

function AuthenticatedSubscriptionProvider({ children }: { children: React.ReactNode }) {
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

function SessionSubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <DefaultSubscriptionProvider loading>{children}</DefaultSubscriptionProvider>
  }

  if (!session?.user) {
    return <DefaultSubscriptionProvider>{children}</DefaultSubscriptionProvider>
  }

  return <AuthenticatedSubscriptionProvider>{children}</AuthenticatedSubscriptionProvider>
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (isUnauthenticatedPagePath(pathname)) {
    return <DefaultSubscriptionProvider>{children}</DefaultSubscriptionProvider>
  }

  return <SessionSubscriptionProvider>{children}</SessionSubscriptionProvider>
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
