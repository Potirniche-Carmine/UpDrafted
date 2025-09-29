"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Crown, Users, Eye, MessageSquare, TrendingUp, ArrowRight, CreditCard, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSubscription } from '@/components/providers/subscription-provider'
import { useUser } from '@clerk/nextjs'
import { useToast } from '@/components/ui/toast'

// Global request cache to prevent duplicate API calls with longer cache time
const requestCache = new Map<string, { promise: Promise<UsageLimits>, timestamp: number }>()
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

interface ConnectionUsage {
  current: number
  limit: number
  monthlyUsed: number
  monthlyLimit: number
}

interface UsageLimits {
  connections: ConnectionUsage
  readReceipts: boolean
  profileInsights: boolean
  activeConnections: {
    current: number
    limit: number | null  // null for unlimited
  }
}

async function fetchUsageLimits(): Promise<UsageLimits> {
  const cacheKey = 'usage-limits'
  
  // Check if there's already a recent request in cache
  const cached = requestCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.promise
  }

  // Create new request promise
  const requestPromise = fetch('/api/usage-limits').then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  })

  // Cache the promise with timestamp
  requestCache.set(cacheKey, { 
    promise: requestPromise, 
    timestamp: Date.now() 
  })
  
  // Clean up cache entry after completion (but keep successful results cached)
  requestPromise.catch(() => {
    requestCache.delete(cacheKey)
  })
  
  return requestPromise
}

export function PremiumLimitsCard() {
  const { subscription, features, loading } = useSubscription()
  const { user } = useUser()
  const { error: showError } = useToast()
  const [usageData, setUsageData] = useState<UsageLimits | null>(null)
  const [fetchingUsage, setFetchingUsage] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  const userRole = (user?.publicMetadata?.role as string) || 'athlete'

  // Subscription management handler
  const handleManageSubscription = async () => {
    if (!subscription?.isPremium) return

    setIsCreatingSession(true)
    try {
      const response = await fetch('/api/stripe/portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating portal session:', error)
      showError(
        'Error',
        error instanceof Error ? error.message : 'Failed to open billing portal'
      )
    } finally {
      setIsCreatingSession(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return null
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  const getSubscriptionDisplayName = (tier: string) => {
    const tierMap: Record<string, string> = {
      'free': 'Free Plan',
      'pro_athlete_monthly': 'Athlete Pro (Monthly)',
      'pro_athlete_yearly': 'Athlete Pro (Yearly)',
      'pro_coach_monthly': 'Coach Pro (Monthly)',
      'pro_coach_yearly': 'Coach Pro (Yearly)',
      'pro_recruiter_monthly': 'Recruiter Pro (Monthly)',
      'pro_recruiter_yearly': 'Recruiter Pro (Yearly)',
    }
    return tierMap[tier] || tier
  }

  // The useSubscription hook will automatically fetch data on mount if not cached.
  // A forced refetch on every mount is inefficient.

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Component cleanup
    }
  }, [user?.id])

  // Fetch current usage data using the deduplicated fetch function
  useEffect(() => {
    const loadUsageData = async () => {
      if (!user || loading) {
        return
      }
      
      setFetchingUsage(true)
      
      try {
        const data = await fetchUsageLimits()
        setUsageData(data)
      } catch (error) {
        console.error('PremiumLimitsCard: Fetch error:', error)
      } finally {
        setFetchingUsage(false)
      }
    }

    loadUsageData()
  }, [user, loading, subscription?.tier, subscription?.isPremium, subscription?.status])

  if (loading || fetchingUsage) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPremium = subscription?.isPremium && subscription?.status === 'active'
  const connectionLimit = features?.maxConnectionsPerMonth || 5
  const connectionUsage = usageData?.connections || { current: 0, limit: connectionLimit, monthlyUsed: 0, monthlyLimit: connectionLimit }
  
  // Calculate percentages
  const monthlyConnectionPercent = connectionUsage.monthlyLimit > 0 
    ? Math.min((connectionUsage.monthlyUsed / connectionUsage.monthlyLimit) * 100, 100)
    : 0
  
  const activeConnectionPercent = usageData?.activeConnections.limit 
    ? Math.min((usageData.activeConnections.current / usageData.activeConnections.limit) * 100, 100)
    : 0

  // Determine upgrade messaging based on role
  const getUpgradeMessage = () => {
    if (isPremium) return null
    
    switch (userRole) {
      case 'athlete':
        return {
          title: 'Upgrade to Pro Athlete',
          subtitle: 'Get 25 connections/month, read receipts, and profile insights',
          price: '$15/month'
        }
      case 'coach':
        return {
          title: 'Upgrade to Pro Coach',
          subtitle: 'Get unlimited connections, advanced search, and analytics',
          price: '$150/month'
        }
      case 'recruiter':
        return {
          title: 'Upgrade to Pro Recruiter',
          subtitle: 'Get unlimited connections, advanced search, and analytics',
          price: '$150/month'
        }
      default:
        return {
          title: 'Upgrade to Premium',
          subtitle: 'Unlock all premium features',
          price: 'Starting at $15/month'
        }
    }
  }

  const upgradeMessage = getUpgradeMessage()

  return (
    <Card className="border shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground flex items-center text-lg">
          {isPremium ? (
            <>
              <Crown className="mr-2 h-5 w-5 text-[#01ae79]" />
              Premium Features
            </>
          ) : (
            <>
              <Users className="mr-2 h-5 w-5 text-muted-foreground" />
              Current Limits
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Requests This Month */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monthly Connections Requests</span>
            <span className="font-medium">
              {connectionUsage.monthlyUsed} / {connectionUsage.monthlyLimit === 999999 ? '∞' : connectionUsage.monthlyLimit}
            </span>
          </div>
          {connectionUsage.monthlyLimit !== 999999 && (
            <Progress value={monthlyConnectionPercent} className="h-2" />
          )}
          {!isPremium && connectionUsage.monthlyUsed >= connectionUsage.monthlyLimit * 0.8 && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Running low on connections this month
            </p>
          )}
        </div>

        {/* Active Connections */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active Connections</span>
            <span className="font-medium">
              {usageData?.activeConnections.current || 0} / {
                usageData?.activeConnections.limit === null ? '∞' : usageData?.activeConnections.limit || 5
              }
            </span>
          </div>
          {usageData?.activeConnections.limit && (
            <Progress value={activeConnectionPercent} className="h-2" />
          )}
        </div>

        {/* Premium Features Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Read Receipts</span>
            </div>
            <Badge variant={features?.profileViewInsights ? "default" : "outline"} className="text-xs">
              {features?.profileViewInsights ? 'Enabled' : 'Premium'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Profile Insights</span>
            </div>
            <Badge variant={features?.profileViewInsights ? "default" : "outline"} className="text-xs">
              {features?.profileViewInsights ? 'Enabled' : 'Premium'}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Advanced Search</span>
            </div>
            <Badge variant={features?.advancedSearch ? "default" : "outline"} className="text-xs">
              {features?.advancedSearch ? 'Enabled' : 'Premium'}
            </Badge>
          </div>
        </div>

        {/* Upgrade CTA */}
        {upgradeMessage && (
          <div className="mt-4 pt-4 border-t">
            <div className="bg-gradient-to-r from-[#01ae79]/5 to-[#01ae79]/10 dark:from-[#01ae79]/10 dark:to-[#01ae79]/20 rounded-lg p-4 border border-[#01ae79]/20">
              <div className="text-center space-y-2">
                <h4 className="font-semibold text-sm text-foreground">{upgradeMessage.title}</h4>
                <p className="text-xs text-muted-foreground">{upgradeMessage.subtitle}</p>
                <p className="text-xs font-medium text-[#01ae79]">{upgradeMessage.price}</p>
                <Button asChild size="sm" className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90">
                  <Link href="/pricing">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Premium users get enhanced subscription management */}
        {isPremium && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {/* Subscription status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{getSubscriptionDisplayName(subscription.tier)}</p>
                <Badge variant="default" className="mt-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Renewal info */}
            {subscription.currentPeriodEnd && (
              <div className="text-sm text-muted-foreground bg-muted/30 rounded-md p-3 border-l-2 border-muted-foreground/20">
                {subscription.cancelAtPeriodEnd 
                  ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Ends on <span className="font-medium text-foreground">{formatDate(subscription.currentPeriodEnd)}</span></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Renews on <span className="font-medium text-foreground">{formatDate(subscription.currentPeriodEnd)}</span></span>
                    </div>
                  )
                }
              </div>
            )}

            {/* Manage subscription button */}
            <Button 
              onClick={handleManageSubscription}
              disabled={isCreatingSession}
              variant="outline" 
              size="sm"
              className="w-full"
            >
              {isCreatingSession ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
                  <ExternalLink className="h-3 w-3 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Change billing, update payment methods, or cancel your subscription
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}