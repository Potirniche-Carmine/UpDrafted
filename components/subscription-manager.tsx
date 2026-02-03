"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink, Crown, CreditCard } from 'lucide-react'
import { useSubscription } from '@/components/providers/subscription-provider'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'

interface SubscriptionManagerProps {
  className?: string
}

export function SubscriptionManager({ className }: SubscriptionManagerProps) {
  const { user } = useUser()
  const { subscription, loading, refetch } = useSubscription()
  const { error: showError } = useToast()
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  // Check for URL parameters that might indicate return from Stripe portal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const fromStripe = urlParams.has('session_id') ||
      urlParams.has('payment_intent') ||
      document.referrer.includes('stripe.com')

    if (fromStripe) {
      console.log('🔄 Detected return from Stripe, refetching subscription...')
      // Wait a moment for webhooks to process, then refetch
      setTimeout(() => refetch(), 1000)
    }
  }, [refetch])

  // Periodic check for subscription changes (when user has premium)
  useEffect(() => {
    // Clear any existing interval first to prevent memory leaks
    let interval: NodeJS.Timeout | null = null

    if (subscription?.isPremium) {
      interval = setInterval(() => {
        // Only refetch if user has been active recently (tab is visible)
        if (document.visibilityState === 'visible') {
          console.log('🔄 Periodic subscription check...')
          refetch()
        }
      }, 2 * 60 * 1000) // Check every 2 minutes for premium users
    }

    // Cleanup function that always runs
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [subscription?.isPremium, refetch])

  const userRole = user?.role as string

  // Listen for when user returns from Stripe portal
  // Refetch immediately when user returns from any external navigation (like Stripe portal)
  useEffect(() => {
    let awayTime: number | null = null
    let hadPremiumBeforeLeaving = false

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        awayTime = Date.now()
        hadPremiumBeforeLeaving = subscription?.isPremium || false
      } else if (document.visibilityState === 'visible' && awayTime) {
        const timeAway = Date.now() - awayTime
        // Refetch if they were away for more than 30 seconds (indicating possible external navigation)
        // OR if they had premium subscription (more likely to use portal)
        if (timeAway > 30 * 1000 || hadPremiumBeforeLeaving) {
          console.log('🔄 User returned from external navigation, refetching subscription...')
          refetch()
        }
        awayTime = null
        hadPremiumBeforeLeaving = false
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refetch, subscription?.isPremium])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'trialing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'past_due':
      case 'unpaid':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Unable to load subscription information
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Subscription
        </CardTitle>
        <CardDescription>
          Manage your {userRole} subscription and billing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{getSubscriptionDisplayName(subscription.tier)}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(subscription.status)}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {subscription.isPremium && subscription.currentPeriodEnd && (
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-md p-3 border-l-2 border-muted-foreground/20">
            {subscription.cancelAtPeriodEnd
              ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Your subscription will end on <span className="font-medium text-foreground">{formatDate(subscription.currentPeriodEnd)}</span></span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Renews automatically on <span className="font-medium text-foreground">{formatDate(subscription.currentPeriodEnd)}</span></span>
                </div>
              )
            }
          </div>
        )}

        <div className="flex gap-2">
          {subscription.isPremium ? (
            <Button
              onClick={handleManageSubscription}
              disabled={isCreatingSession}
              className="flex items-center gap-2"
            >
              {isCreatingSession ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Manage Subscription
              <ExternalLink className="h-3 w-3" />
            </Button>
          ) : (
            <Button asChild className="flex items-center gap-2">
              <Link href="/pricing">
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
          )}
        </div>

        {subscription.isPremium && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            You can change between monthly and yearly billing, update payment methods,
            view invoices, and cancel your subscription through the billing portal.
          </div>
        )}
      </CardContent>
    </Card>
  )
}