import { NextRequest, NextResponse } from 'next/server'
import { requireAnyRole } from '@/utils/roles'
import { SubscriptionManager } from '@/lib/subscription'
import { createPortalSession } from '@/lib/stripe-portal-configs'
import { Roles } from '@/types/globals'

function buildSafeReturnUrl(request: NextRequest, requestedUrl: unknown): string {
  const requestOrigin = new URL(request.url).origin
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL || requestOrigin
  const defaultUrl = `${appOrigin}/dashboard`

  if (typeof requestedUrl !== 'string' || !requestedUrl.trim()) {
    return defaultUrl
  }

  if (requestedUrl.startsWith('/')) {
    return `${appOrigin}${requestedUrl}`
  }

  try {
    const parsed = new URL(requestedUrl)
    if (parsed.origin === appOrigin || parsed.origin === requestOrigin) {
      return parsed.toString()
    }
  } catch {
    return defaultUrl
  }

  return defaultUrl
}

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
    const returnUrl = buildSafeReturnUrl(request, body.returnUrl)

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