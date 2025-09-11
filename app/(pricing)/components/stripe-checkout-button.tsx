"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Crown } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

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
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const handleCheckout = async () => {
    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    setIsLoading(true)

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
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Checkout error:', error)
      // You might want to show a toast notification here
      alert(error instanceof Error ? error.message : 'An error occurred during checkout')
    } finally {
      setIsLoading(false)
    }
  }

  return (
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