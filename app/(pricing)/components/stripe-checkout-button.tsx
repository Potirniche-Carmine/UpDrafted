"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Crown } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/components/providers/subscription-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

    // Check if user already has an active premium subscription
    if (subscription?.isPremium && subscription?.status === 'active') {
      setError(`You already have an active ${subscription.tier} subscription. Please manage your existing subscription or contact support if you need to change plans.`)
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
          setError(`You already have an active ${data.subscription.tier} subscription.`)
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
          <AlertDescription>{error}</AlertDescription>
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