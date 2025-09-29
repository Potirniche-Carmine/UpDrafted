import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SubscriptionManager } from '@/lib/subscription'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Force fresh subscription data (ensures UI shows latest changes)
    SubscriptionManager.invalidateUserCache(userId)
    
    // Get subscription and features in one call (24-hour cache)
    const [subscription, features] = await Promise.all([
      SubscriptionManager.getUserSubscription(userId),
      SubscriptionManager.getSubscriptionFeatures(userId)
    ])

    return NextResponse.json({
      subscription,
      features
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    
    // Return default free tier on error
    return NextResponse.json({
      subscription: {
        tier: 'free',
        status: 'active',
        isActive: true,
        isPremium: false,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      },
      features: {
        advancedSearch: false,
        profileViewInsights: false,
        analytics: false,
        maxConnectionsPerMonth: 5
      }
    })
  }
}