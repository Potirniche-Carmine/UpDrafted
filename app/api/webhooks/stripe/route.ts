import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { SubscriptionManager } from '@/lib/subscription'
import { db } from '@/database/db'
import { userSubscriptions } from '@/database/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

// Enhanced rate limiting to prevent webhook storms and abuse
const webhookRequests = new Map<string, { 
  count: number
  resetTime: number
  lastTimestamp?: number
}>()
const processedEvents = new Map<string, number>()

const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 100,
  windowMs: 60 * 1000,
  maxRequestsPerSecond: 10,
  secondWindowMs: 1000,
  replayProtectionWindow: 300000 // 5 minutes
}

/**
 * Enhanced rate limiting with per-second and per-minute limits
 */
function isRateLimited(eventType: string): boolean {
  const now = Date.now()
  const current = webhookRequests.get(eventType)

  if (!current || now > current.resetTime) {
    webhookRequests.set(eventType, { 
      count: 1, 
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
      lastTimestamp: now
    })
    return false
  }

  // Check per-second rate limit
  if (current.lastTimestamp && (now - current.lastTimestamp) < RATE_LIMIT_CONFIG.secondWindowMs) {
    const recentRequests = Array.from(webhookRequests.values())
      .filter(req => req.lastTimestamp && (now - req.lastTimestamp) < RATE_LIMIT_CONFIG.secondWindowMs)
    
    if (recentRequests.length >= RATE_LIMIT_CONFIG.maxRequestsPerSecond) {
      return true
    }
  }

  // Check per-minute rate limit
  if (current.count >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
    return true
  }

  current.count++
  current.lastTimestamp = now
  return false
}

/**
 * Reject stale webhook signatures by timestamp.
 */
function isStaleWebhook(timestamp: number): boolean {
  const now = Date.now()
  const webhookTime = timestamp * 1000 // Convert to milliseconds
  
  return now - webhookTime > RATE_LIMIT_CONFIG.replayProtectionWindow
}

function clearExpiredProcessedEvents(now: number): void {
  for (const [eventId, processedAt] of processedEvents.entries()) {
    if (now - processedAt > RATE_LIMIT_CONFIG.replayProtectionWindow) {
      processedEvents.delete(eventId)
    }
  }
}

/**
 * Lookup userId by Stripe customer ID when metadata is missing
 * This handles cases where Customer Portal updates don't preserve metadata
 */
async function getUserIdByStripeCustomer(stripeCustomerId: string): Promise<string | null> {
  try {
    const results = await db
      .select({ userId: userSubscriptions.userId })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeCustomerId, stripeCustomerId))
      .limit(1)
    
    // Safely check if results exist and have data
    return results.length > 0 && results[0] ? results[0].userId : null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const sig = headersList.get('stripe-signature')

    // Validate webhook secret is configured
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Enhanced timestamp extraction with proper validation
    const timestampMatch = sig.match(/t=([0-9]+)/)
    if (!timestampMatch) {
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 })
    }
    
    const webhookTimestamp = parseInt(timestampMatch[1], 10)
    if (isNaN(webhookTimestamp)) {
      return NextResponse.json({ error: 'Invalid timestamp' }, { status: 400 })
    }

    // Reject stale signatures. Duplicate events are handled idempotently by event ID.
    if (isStaleWebhook(webhookTimestamp)) {
      return NextResponse.json({ error: 'Stale webhook timestamp' }, { status: 400 })
    }

    const now = Date.now()
    clearExpiredProcessedEvents(now)
    if (processedEvents.has(event.id)) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    // Enhanced rate limiting
    if (isRateLimited(event.type)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    // Handle subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.payment_succeeded':
        // Handle successful recurring payments - ensures subscription stays active
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        // Handle failed payments - may need to update subscription status
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        break
    }

    processedEvents.set(event.id, now)
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Extended Stripe subscription interface to handle webhook data
interface StripeSubscriptionWebhook extends Stripe.Subscription {
  current_period_start: number
  current_period_end: number
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  let userId = subscription.metadata?.userId
  
  // Only use database fallback if metadata is truly missing (rare case)
  // Most updates from Customer Portal actually preserve metadata
  if (!userId && subscription.customer) {
    const lookedUpUserId = await getUserIdByStripeCustomer(subscription.customer as string)
    if (lookedUpUserId) {
      userId = lookedUpUserId
    }
  }
  
  if (!userId) {
    return
  }

  try {
    const webhookData = subscription as StripeSubscriptionWebhook

    await SubscriptionManager.updateSubscriptionFromStripe(userId, {
      id: subscription.id,
      customer: subscription.customer as string,
      status: subscription.status,
      current_period_start: webhookData.current_period_start,
      current_period_end: webhookData.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at,
      trial_start: subscription.trial_start,
      trial_end: subscription.trial_end,
      items: subscription.items
    })
    
    // Cache invalidation is automatically handled by updateSubscriptionFromStripe
  } catch {
    // Error handling - could integrate with monitoring service here
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  let userId = subscription.metadata?.userId
  
  // Fallback: lookup userId by Stripe customer ID if metadata is missing
  // This handles Customer Portal updates which may not preserve metadata
  if (!userId && subscription.customer) {
    const lookedUpUserId = await getUserIdByStripeCustomer(subscription.customer as string)
    if (lookedUpUserId) {
      userId = lookedUpUserId
    }
  }
  
  if (!userId) {
    return
  }

  try {
    await SubscriptionManager.cancelSubscription(userId)
  } catch {
    // Error handling - could integrate with monitoring service here
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) {
    return
  }
  
  // If this is a subscription checkout, handle the subscription creation
  if (session.mode === 'subscription' && session.subscription) {
    try {
      // Retrieve the full subscription object
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const subWithPeriods = subscription as unknown as StripeSubscriptionWebhook
      
      await SubscriptionManager.updateSubscriptionFromStripe(userId, {
        id: subscription.id,
        customer: subscription.customer as string,
        status: subscription.status,
        current_period_start: subWithPeriods.current_period_start || Math.floor(Date.now() / 1000),
        current_period_end: subWithPeriods.current_period_end || Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at,
        trial_start: subscription.trial_start,
        trial_end: subscription.trial_end,
        items: subscription.items
      })
    } catch {
      // Error handling - could integrate with monitoring service here
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // When a recurring payment succeeds, refresh the subscription status
  // Use type assertion to access subscription property
  const invoiceWithSub = invoice as Stripe.Invoice & { subscription?: string }
  if (invoiceWithSub.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(invoiceWithSub.subscription)
      await handleSubscriptionUpdate(subscription)
      // Cache invalidation is handled by handleSubscriptionUpdate
    } catch {
      // Error handling - could integrate with monitoring service here
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // When a payment fails, refresh the subscription status (it might go to past_due)
  // Use type assertion to access subscription property
  const invoiceWithSub = invoice as Stripe.Invoice & { subscription?: string }
  if (invoiceWithSub.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(invoiceWithSub.subscription)
      await handleSubscriptionUpdate(subscription)
      // Cache invalidation is handled by handleSubscriptionUpdate
    } catch {
      // Error handling - could integrate with monitoring service here
    }
  }
}