import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { SubscriptionManager } from '@/lib/subscription'
import { invalidateSubscriptionCache } from '@/hooks/use-subscription'
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
  '3.18.12.63',
  '3.130.192.231',
  '13.235.14.237',
  '13.235.122.149',
  '18.211.135.69',
  '35.154.171.200',
  '52.15.183.38',
  '54.88.130.119',
  '54.88.130.237',
  '54.187.174.169',
  '54.187.205.235',
  '54.187.216.72'
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
function isAllowedIP(ip: string | null): boolean {
  // Require explicit opt-out for security - IP filtering is enabled by default
  if (process.env.STRIPE_WEBHOOK_IP_FILTERING === 'false') {
    console.warn('Webhook IP filtering is disabled - this is not recommended for production')
    return true
  }
  
  if (!ip) {
    console.warn('No IP address provided for webhook request')
    return false
  }
  
  // Remove port if present
  const cleanIP = ip.split(':').slice(0, -1).join(':') || ip.split(':')[0]
  
  const isAllowed = STRIPE_IP_RANGES.includes(cleanIP) || 
                   cleanIP === '127.0.0.1' || 
                   cleanIP === '::1' // Allow localhost for development
  
  if (!isAllowed) {
    console.warn(`Webhook request from unauthorized IP: ${cleanIP}`)
  }
  
  return isAllowed
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const sig = headersList.get('stripe-signature')
    const forwardedFor = headersList.get('x-forwarded-for')
    const clientIP = headersList.get('x-real-ip') || 
                     forwardedFor?.split(',')[0]?.trim() || 
                     headersList.get('x-client-ip') ||
                     null

    // Validate webhook secret is configured
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET environment variable is not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (!sig) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // IP filtering with proper security defaults
    if (!isAllowedIP(clientIP)) {
      return NextResponse.json({ error: 'Unauthorized IP' }, { status: 403 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        signaturePresent: !!sig,
        bodyLength: body.length
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Enhanced timestamp extraction with proper validation
    const timestampMatch = sig.match(/t=([0-9]+)/)
    if (!timestampMatch) {
      console.error('Unable to extract timestamp from webhook signature')
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 })
    }
    
    const webhookTimestamp = parseInt(timestampMatch[1], 10)
    if (isNaN(webhookTimestamp)) {
      console.error('Invalid timestamp in webhook signature')
      return NextResponse.json({ error: 'Invalid timestamp' }, { status: 400 })
    }

    // Replay attack protection with proper signature validation
    if (isReplayAttack(sig, webhookTimestamp)) {
      console.warn('Potential replay attack detected:', { 
        eventType: event.type, 
        timestamp: webhookTimestamp,
        eventId: event.id 
      })
      return NextResponse.json({ error: 'Replay attack detected' }, { status: 400 })
    }

    // Enhanced rate limiting
    if (isRateLimited(event.type, sig)) {
      console.warn(`Rate limit exceeded for webhook type: ${event.type}`)
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

      default:
        // Silently ignore unhandled webhook types (they're not configured for production)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error
    })
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Extended Stripe subscription interface to handle webhook data
interface StripeSubscriptionWebhook extends Stripe.Subscription {
  current_period_start: number
  current_period_end: number
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error('No userId in subscription metadata')
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
    
    // Force cache refresh for this user's subscription
    invalidateSubscriptionCache(userId)
  } catch (error) {
    console.error(`Error updating subscription for user ${userId}:`, error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  try {
    await SubscriptionManager.cancelSubscription(userId)
    
    // Force cache refresh for this user's subscription
    invalidateSubscriptionCache(userId)
  } catch (error) {
    console.error(`Error canceling subscription for user ${userId}:`, error)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) {
    console.error('No userId in checkout session metadata')
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
            
      // Force cache refresh for this user's subscription
      invalidateSubscriptionCache(userId)
    } catch (error) {
      console.error(`Error creating subscription from checkout for user ${userId}:`, error)
    }
  }
}