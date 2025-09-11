import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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
      customer_email: undefined, // Let Stripe collect email
      metadata: {
        userId: userId,
        priceId: priceId,
      },
      subscription_data: mode === 'subscription' ? {
        metadata: {
          userId: userId,
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