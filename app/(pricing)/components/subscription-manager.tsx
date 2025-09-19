"use client"

import { useSubscription } from '@/components/providers/subscription-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Crown, Calendar, CreditCard, AlertTriangle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SubscriptionManagerProps {
  className?: string
}

export function SubscriptionManager({ className }: SubscriptionManagerProps) {
  const { subscription, loading, error } = useSubscription()

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading subscription status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load subscription status</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return null
  }

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'Free'
      case 'pro_athlete_monthly':
        return 'Pro Athlete (Monthly)'
      case 'pro_athlete_yearly':
        return 'Pro Athlete (Yearly)'
      case 'pro_coach_monthly':
        return 'Pro Coach (Monthly)'
      case 'pro_coach_yearly':
        return 'Pro Coach (Yearly)'
      case 'pro_recruiter_monthly':
        return 'Pro Recruiter (Monthly)'
      case 'pro_recruiter_yearly':
        return 'Pro Recruiter (Yearly)'
      default:
        return tier
    }
  }

  const getStatusBadge = (status: string, isPremium: boolean) => {
    if (status === 'active' && isPremium) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>
    }
    if (status === 'trialing') {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Trial</Badge>
    }
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>
    }
    if (status === 'past_due') {
      return <Badge variant="destructive">Past Due</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {subscription.isPremium ? (
            <Crown className="h-5 w-5 text-[#01ae79]" />
          ) : (
            <CreditCard className="h-5 w-5" />
          )}
          <span>Current Plan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{getTierDisplayName(subscription.tier)}</h3>
            <p className="text-sm text-muted-foreground">
              {subscription.isPremium ? 'Premium features enabled' : 'Basic features included'}
            </p>
          </div>
          {getStatusBadge(subscription.status, subscription.isPremium)}
        </div>

        {subscription.isPremium && subscription.currentPeriodEnd && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {subscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'} in{' '}
              {formatDistanceToNow(subscription.currentPeriodEnd)}
            </span>
          </div>
        )}

        {subscription.cancelAtPeriodEnd && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                Your subscription will not renew and will end on{' '}
                {subscription.currentPeriodEnd?.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {subscription.tier === 'free' && (
          <div className="pt-2">
            <Button asChild className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90 text-white">
              <a href="/pricing">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </a>
            </Button>
          </div>
        )}

        {subscription.isPremium && (
          <div className="text-xs text-muted-foreground space-y-1">
            {subscription.stripeSubscriptionId && (
              <p>Subscription ID: {subscription.stripeSubscriptionId.substring(0, 20)}...</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}