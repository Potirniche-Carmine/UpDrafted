import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getSession } from '@/utils/roles'
import { stripe } from '@/lib/stripe'
import { SubscriptionManager } from '@/lib/subscription'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    // Check if user already has an active subscription (prevents double checkout)
    const hasActiveSubscription = await SubscriptionManager.hasActiveSubscription(userId)
    if (hasActiveSubscription) {
      const subscription = await SubscriptionManager.getUserSubscription(userId)
      return NextResponse.json(
        {
          error: 'You already have an active subscription',
          subscription: {
            tier: subscription.tier,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd
          }
        },
        { status: 400 }
      )
    }

    const headersList = await headers()
    const origin = headersList.get('origin') || headersList.get('referer')?.split('/').slice(0, 3).join('/')

    const body = await req.json()
    const { priceId, mode = 'subscription' } = body

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Create Checkout Sessions from body params
    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as 'subscription' | 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      automatic_tax: { enabled: true },
      customer_email: userEmail, // Enforce the authenticated user's email
      metadata: {
        userId: userId,
        priceId: priceId,
        userEmail: userEmail, // Store in metadata
      },
      subscription_data: mode === 'subscription' ? {
        metadata: {
          userId: userId,
          userEmail: userEmail, // Store in subscription metadata too
        },
      } : undefined,
    })

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout session creation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const statusCode = error && typeof error === 'object' && 'statusCode' in error ?
      (error.statusCode as number) : 500
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}