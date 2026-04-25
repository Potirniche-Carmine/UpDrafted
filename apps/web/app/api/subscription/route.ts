import { NextRequest, NextResponse } from 'next/server'
import { getSession } from "@/utils/roles"
import { SubscriptionManager } from '@/lib/subscription'

function toClientSubscriptionPayload(subscription: Awaited<ReturnType<typeof SubscriptionManager.getUserSubscription>>) {
  return {
    tier: subscription.tier,
    status: subscription.status,
    isActive: subscription.isActive,
    isPremium: subscription.isPremium,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  }
}

function noStoreJson(body: unknown, init?: ConstructorParameters<typeof NextResponse.json>[1]) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req.headers);
    const userId = session?.user?.id;

    if (!userId) {
      return noStoreJson(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const force = searchParams.get('force') === 'true'

    if (force) {
      // Force fresh subscription data (ensures UI shows latest changes)
      SubscriptionManager.invalidateUserCache(userId)
    }

    // Get subscription and features in one call (24-hour cache unless forced)
    const [subscription, features] = await Promise.all([
      SubscriptionManager.getUserSubscription(userId),
      SubscriptionManager.getSubscriptionFeatures(userId)
    ])

    return noStoreJson({
      subscription: toClientSubscriptionPayload(subscription),
      features
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)

    // Return default free tier on error
    return noStoreJson({
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
