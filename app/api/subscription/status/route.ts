import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SubscriptionService } from '@/lib/subscription-service'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get current subscription status
    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(userId)
    const subscription = await SubscriptionService.getUserSubscription(userId)

    return NextResponse.json({
      success: true,
      subscription: {
        tier: subscriptionStatus.tier,
        status: subscriptionStatus.status,
        isActive: subscriptionStatus.isActive,
        isPremium: subscriptionStatus.isPremium,
        currentPeriodEnd: subscriptionStatus.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptionStatus.cancelAtPeriodEnd,
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