import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getSession } from '@/utils/roles'
import { stripe } from '@/lib/stripe'
import { SubscriptionManager } from '@/lib/subscription'

type CheckoutMode = 'subscription' | 'payment'

const ALLOWED_MODES: CheckoutMode[] = ['subscription']

function getAllowedPriceIdsForRole(role: string | null | undefined): Set<string> {
  const basePriceIds = [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY,
  ].filter((value): value is string => Boolean(value))

  if (!role || role === 'admin') {
    return new Set<string>()
  }

  const rolePriceMap: Record<string, string[]> = {
    athlete: [
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY || '',
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY || '',
    ],
    coach: [
      process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY || '',
      process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY || '',
    ],
    recruiter: [
      process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY || '',
      process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY || '',
    ],
  }

  const rolePrices = rolePriceMap[role] || basePriceIds
  const resolved = new Set(rolePrices.filter(Boolean))

  // Keep local/dev environments usable when Stripe env vars are not present.
  if (resolved.size === 0 && process.env.NODE_ENV !== 'production') {
    return new Set(basePriceIds)
  }

  return resolved
}

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
    const userRole = session.user.role;

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
    const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
    const requestOrigin = headersList.get('origin')
    const origin = requestOrigin && requestOrigin === configuredOrigin ? requestOrigin : configuredOrigin

    const body = await req.json()
    const { priceId, mode = 'subscription' } = body as { priceId?: string; mode?: string }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    if (!ALLOWED_MODES.includes(mode as CheckoutMode)) {
      return NextResponse.json(
        { error: 'Invalid checkout mode' },
        { status: 400 }
      )
    }

    const allowedPrices = getAllowedPriceIdsForRole(userRole)
    if (!allowedPrices.has(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price for this account' },
        { status: 403 }
      )
    }

    // Create Checkout Session from validated params
    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as CheckoutMode,
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
    return NextResponse.json(
      { error: 'Unable to create checkout session' },
      { status: 500 }
    )
  }
}