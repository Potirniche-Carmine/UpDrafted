"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PremiumUpgradeButton } from '@/app/(pricing)/components/stripe-checkout-button'
import { Check, Crown } from 'lucide-react'
import { PricingPlan, formatPrice } from '@/app/(pricing)/components/pricing-config'
import { SubscriptionStatus } from '@/hooks/use-subscription-status'

interface PricingCardProps {
  plan: PricingPlan
  className?: string
  subscription?: SubscriptionStatus | null
}

export function PricingCard({ plan, className, subscription }: PricingCardProps) {
  const monthlyPrice = plan.price.monthly
  const yearlyPrice = plan.price.yearly
  const isYearly = plan.interval === 'year'
  
  const displayPrice = isYearly && yearlyPrice ? yearlyPrice : monthlyPrice
  const monthlyEquivalent = isYearly && yearlyPrice ? yearlyPrice / 12 : monthlyPrice
  
  const savings = isYearly && yearlyPrice 
    ? Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100)
    : 0

  // Check if this is the user's current plan
  const isCurrentPlan = subscription?.stripePriceId === plan.priceId || 
    (plan.isFree && subscription?.tier === 'free')

  // Check if user has premium subscription
  const hasPremiumSubscription = subscription?.isPremium && subscription?.status === 'active'

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50 h-full flex flex-col ${plan.popular ? 'ring-2 ring-[#01ae79] ring-opacity-50' : ''} ${isCurrentPlan ? 'border-[#01ae79]' : ''} ${className}`}>
      {/* Reserve space for "Most Popular" badge on all cards to prevent layout shift */}
      <div className="h-10 relative">
        {plan.popular && (
          <div className="absolute top-0 left-0 right-0">
            <div className="bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80 text-white text-center py-2 text-sm font-medium">
              <Crown className="inline h-4 w-4 mr-1" />
              Most Popular
            </div>
          </div>
        )}
        {isCurrentPlan && !plan.popular && (
          <div className="absolute top-0 left-0 right-0">
            <div className="bg-[#01ae79] text-white text-center py-2 text-sm font-medium">
              Current Plan
            </div>
          </div>
        )}
      </div>
      
      <CardHeader className="text-center pt-2 pb-6">{/* Consistent padding for all cards */}
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <p className="text-muted-foreground text-sm mt-2">{plan.description}</p>
        
        <div className="mt-4">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold">{formatPrice(displayPrice)}</span>
            <span className="text-muted-foreground ml-1">
              /{isYearly ? 'year' : 'month'}
            </span>
          </div>
          
          {isYearly && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                {formatPrice(monthlyEquivalent)}/month when billed annually
              </p>
              {savings > 0 && (
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                  Save {savings}%
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-6">
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <p className="font-medium text-sm">What&apos;s included:</p>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-[#01ae79] mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          {plan.role && plan.role !== 'all' && (
            <div className="flex justify-center">
              <Badge variant="outline" className="text-xs">
                Optimized For {plan.role === 'coach' ? 'Coaches' : plan.role === 'recruiter' ? 'Recruiters' : `${plan.role.charAt(0).toUpperCase() + plan.role.slice(1)}s`}
              </Badge>
            </div>
          )}
          
          {isCurrentPlan ? (
            <Button
              className="w-full"
              variant="outline"
              disabled
            >
              {plan.isFree ? 'Current Plan' : 'Current Subscription'}
            </Button>
          ) : plan.isFree ? (
            <Button
              className="w-full"
              variant="outline"
              disabled={hasPremiumSubscription}
            >
              {hasPremiumSubscription ? 'Upgrade Required' : 'Current Plan'}
            </Button>
          ) : (
            <PremiumUpgradeButton
              priceId={plan.priceId}
              mode="subscription"
              className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              {plan.interval === 'year' ? 'Get Started - Save Money!' : 'Get Started'}
            </PremiumUpgradeButton>
          )}
        </div>
      </CardContent>
    </Card>
  )
}