import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SimpleSubscriptionService } from '@/lib/simple-subscription'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Use cached subscription lookup for faster response
    const subscription = await SimpleSubscriptionService.getUserSubscription(userId)
    const features = await SimpleSubscriptionService.getUserFeatures(userId)

    return NextResponse.json({
      success: true,
      subscription: {
        tier: subscription?.tier || 'free',
        status: subscription?.status || 'active',
        isActive: features.hasAccess,
        isPremium: features.tier !== 'free',
        currentPeriodEnd: subscription?.currentPeriodEnd,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
        stripeCustomerId: subscription?.stripeCustomerId,
        stripeSubscriptionId: subscription?.stripeSubscriptionId,
        stripePriceId: subscription?.stripePriceId
      }
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}