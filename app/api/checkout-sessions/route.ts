import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { SubscriptionService } from '@/lib/subscription-service'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user details from Clerk to validate email
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    const primaryEmailAddress = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )
    const userEmail = primaryEmailAddress?.emailAddress

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    // Check if user already has an active subscription
    const existingSubscription = await SubscriptionService.getUserSubscription(userId)
    if (existingSubscription && existingSubscription.status === 'active' && existingSubscription.tier !== 'free') {
      return NextResponse.json(
        { 
          error: 'You already have an active subscription',
          subscription: {
            tier: existingSubscription.tier,
            status: existingSubscription.status,
            currentPeriodEnd: existingSubscription.currentPeriodEnd
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
    const session = await stripe.checkout.sessions.create({
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
        clerkEmail: userEmail, // Store the original Clerk email for verification
      },
      subscription_data: mode === 'subscription' ? {
        metadata: {
          userId: userId,
          clerkEmail: userEmail, // Store in subscription metadata too
        },
      } : undefined,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
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