"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Crown } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/components/providers/subscription-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

// Helper function to get display name for subscription tiers
const getCurrentPlanDisplayName = (tier: string): string => {
  const tierMap: Record<string, string> = {
    'free': 'Free Plan',
    'pro_athlete_monthly': 'Pro Athlete (Monthly)',
    'pro_athlete_yearly': 'Pro Athlete (Yearly)', 
    'pro_coach_monthly': 'Pro Coach (Monthly)',
    'pro_coach_yearly': 'Pro Coach (Yearly)',
    'pro_recruiter_monthly': 'Pro Recruiter (Monthly)',
    'pro_recruiter_yearly': 'Pro Recruiter (Yearly)'
  }
  return tierMap[tier] || tier
}

interface StripeCheckoutButtonProps {
  priceId: string
  mode?: 'subscription' | 'payment'
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
}

export function StripeCheckoutButton({
  priceId,
  mode = 'subscription',
  children,
  variant = 'default',
  size = 'default',
  className,
  disabled = false
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const { subscription } = useSubscription()

  const handleCheckout = async () => {
    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    // Check if price ID is valid
    if (!priceId || priceId === 'MISSING_PRICE_ID') {
      setError('This pricing plan is not properly configured. Please contact support.')
      return
    }

    // Check if user already has an active premium subscription
    if (subscription?.isPremium && subscription?.status === 'active') {
      // Check if it's the same plan
      if (subscription.stripePriceId === priceId) {
        setError('You already have this plan active.')
        return
      }
      
      // Different plan - show plan switching message with manage subscription link
      const currentPlanName = getCurrentPlanDisplayName(subscription.tier)
      setError(`You currently have ${currentPlanName} active. To switch plans, please manage your subscription to cancel or modify your current plan first.`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.subscription) {
          // User already has an active subscription
          const currentPlanName = getCurrentPlanDisplayName(data.subscription.tier)
          setError(`You already have ${currentPlanName} active. To change plans, please manage your subscription to cancel or modify your current plan first.`)
          return
        }
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Checkout error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred during checkout')
    } finally {
      setIsLoading(false)
    }
  }

  // Show different button states based on subscription status
  if (subscription?.isPremium && subscription?.stripePriceId === priceId) {
    return (
      <Button
        disabled
        variant="outline"
        size={size}
        className={className}
      >
        Current Plan
      </Button>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            {error.includes('manage your subscription') && (
              <Link 
                href="/dashboard" 
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 underline"
              >
                Go to Dashboard →
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={handleCheckout}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </Button>
    </div>
  )
}

// Convenience component for premium upgrade buttons
interface PremiumUpgradeButtonProps {
  priceId: string
  mode?: 'subscription' | 'payment'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  children?: React.ReactNode
}

export function PremiumUpgradeButton({
  priceId,
  mode = 'subscription',
  variant = 'default',
  size = 'default',
  className,
  children
}: PremiumUpgradeButtonProps) {
  return (
    <StripeCheckoutButton
      priceId={priceId}
      mode={mode}
      variant={variant}
      size={size}
      className={className}
    >
      {children || (
        <>
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to Premium
        </>
      )}
    </StripeCheckoutButton>
  )
}