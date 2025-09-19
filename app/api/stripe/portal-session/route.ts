import { NextRequest, NextResponse } from 'next/server'
import { requireAnyRole } from '@/utils/roles'
import { SubscriptionManager } from '@/lib/subscription'
import { createPortalSession } from '@/lib/stripe-portal-configs'
import { Roles } from '@/types/globals'

export async function POST(request: NextRequest) {
  try {
    // Check authentication and get user role
    const authResult = await requireAnyRole()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId, role } = authResult

    // Get user's subscription to find their Stripe customer ID
    const subscription = await SubscriptionManager.getUserSubscription(userId)
    
    if (!subscription.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this user' },
        { status: 400 }
      )
    }

    // Parse request body for optional return URL
    const body = await request.json().catch(() => ({}))
    const returnUrl = body.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

    // Create portal session with role-specific configuration
    const session = await createPortalSession(
      subscription.stripeCustomerId,
      role as Roles,
      returnUrl
    )

    return NextResponse.json({ 
      url: session.url 
    })

  } catch (error) {
    console.error('Error creating portal session:', error)
    
    if (error instanceof Error && error.message.includes('Admin users cannot access')) {
      return NextResponse.json(
        { error: 'Admin users cannot access the customer portal' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}