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
  lastSignature?: string
  lastTimestamp?: number
}>()

const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 100,
  windowMs: 60 * 1000,
  maxRequestsPerSecond: 10,
  secondWindowMs: 1000,
  replayProtectionWindow: 300000 // 5 minutes
}

// Stripe's documented webhook IP ranges (update as needed)
const STRIPE_IP_RANGES = [
  "3.18.12.63",
  "3.130.192.231",
  "13.235.14.237",
  "13.235.122.149",
  "18.211.135.69",
  "35.154.171.200",
  "52.15.183.38",
  "54.88.130.119",
  "54.88.130.237",
  "54.187.174.169",
  "54.187.205.235",
  "54.187.216.72"
]

/**
 * Enhanced rate limiting with per-second and per-minute limits
 */
function isRateLimited(eventType: string, signature: string): boolean {
  const now = Date.now()
  const current = webhookRequests.get(eventType)

  if (!current || now > current.resetTime) {
    webhookRequests.set(eventType, { 
      count: 1, 
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
      lastSignature: signature,
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
  current.lastSignature = signature
  current.lastTimestamp = now
  return false
}

/**
 * Check for replay attacks using webhook signature and timestamp
 */
function isReplayAttack(signature: string, timestamp: number): boolean {
  const now = Date.now()
  const webhookTime = timestamp * 1000 // Convert to milliseconds
  
  // Reject webhooks older than 5 minutes
  if (now - webhookTime > RATE_LIMIT_CONFIG.replayProtectionWindow) {
    return true
  }
  
  // Check if we've seen this exact signature recently
  for (const [, data] of webhookRequests) {
    if (data.lastSignature === signature && 
        data.lastTimestamp && 
        Math.abs(now - data.lastTimestamp) < RATE_LIMIT_CONFIG.replayProtectionWindow) {
      return true
    }
  }
  
  return false
}

/**
 * Basic IP allowlist check with proper security defaults
 */
function normalizeIp(raw: string): string {
  let ip = raw.trim()

  if (!ip) {
    return ''
  }

  if (ip.startsWith('[') && ip.includes(']')) {
    ip = ip.slice(1, ip.indexOf(']'))
  }

  if (ip.includes('%')) {
    ip = ip.split('%')[0] || ip
  }

  if (ip.includes('.') && ip.includes(':')) {
    ip = ip.split(':')[0] || ip
  }

  return ip
}

function isAllowedIP(candidates: string[]): boolean {
  // Disable IP filtering in development environment
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // Require explicit opt-out for security - IP filtering is enabled by default
  if (process.env.STRIPE_WEBHOOK_IP_FILTERING === 'false') {
    return true
  }
  
  if (!candidates.length) {
    return false
  }

  const cleanedIps = Array.from(new Set(candidates
    .map(normalizeIp)
    .filter(Boolean)))

  return cleanedIps.some(cleanIp =>
    STRIPE_IP_RANGES.includes(cleanIp) ||
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1'
  )
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
    const forwardedFor = headersList.get('x-forwarded-for')
    const forwardedIps = forwardedFor ? forwardedFor.split(',').map(ip => ip.trim()) : []
    const clientIps = [
      headersList.get('x-real-ip'),
      headersList.get('x-client-ip'),
      ...forwardedIps
    ].filter((ip): ip is string => Boolean(ip))

    // Validate webhook secret is configured
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // IP filtering with proper security defaults
    if (!isAllowedIP(clientIps)) {
      return NextResponse.json({ error: 'Unauthorized IP' }, { status: 403 })
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

    // Replay attack protection with proper signature validation
    if (isReplayAttack(sig, webhookTimestamp)) {
      return NextResponse.json({ error: 'Replay attack detected' }, { status: 400 })
    }

    // Enhanced rate limiting
    if (isRateLimited(event.type, sig)) {
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