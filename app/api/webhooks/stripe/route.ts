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
		"13.112.224.240",
		"13.115.13.148",
		"13.210.129.177",
		"13.210.176.167",
		"13.228.126.182",
		"13.228.224.121",
		"13.230.11.13",
		"13.230.90.110",
		"13.55.153.188",
		"13.55.5.15",
		"13.56.126.253",
		"13.56.173.200",
		"13.56.173.232",
		"13.57.108.134",
		"13.57.155.157",
		"13.57.156.206",
		"13.57.157.116",
		"13.57.90.254",
		"13.57.98.27",
		"18.194.147.12",
		"18.195.120.229",
		"18.195.125.165",
		"34.200.27.109",
		"34.200.47.89",
		"34.202.153.183",
		"34.204.109.15",
		"34.213.149.138",
		"34.214.229.69",
		"34.223.201.215",
		"34.237.201.68",
		"34.237.253.141",
		"34.238.187.115",
		"34.239.14.72",
		"34.240.123.193",
		"34.241.202.139",
		"34.241.54.72",
		"34.241.59.225",
		"34.250.29.31",
		"34.250.89.120",
		"35.156.131.6",
		"35.156.194.238",
		"35.157.227.67",
		"35.158.254.198",
		"35.163.82.19",
		"35.164.105.206",
		"35.164.124.216",
		"50.16.2.231",
		"50.18.212.157",
		"50.18.212.223",
		"50.18.219.232",
		"52.1.23.197",
		"52.196.53.105",
		"52.196.95.231",
		"52.204.6.233",
		"52.205.132.193",
		"52.211.198.11",
		"52.212.99.37",
		"52.213.35.125",
		"52.22.83.139",
		"52.220.44.249",
		"52.25.214.31",
		"52.26.11.205",
		"52.26.132.102",
		"52.26.14.11",
		"52.36.167.221",
		"52.53.133.6",
		"52.54.150.82",
		"52.57.221.37",
		"52.59.173.230",
		"52.62.14.35",
		"52.62.203.73",
		"52.63.106.9",
		"52.63.119.77",
		"52.65.161.237",
		"52.73.161.98",
		"52.74.114.251",
		"52.74.98.83",
		"52.76.14.176",
		"52.76.156.251",
		"52.76.174.156",
		"52.77.80.43",
		"52.8.19.58",
		"52.8.8.189",
		"54.149.153.72",
		"54.152.36.104",
		"54.183.95.195",
		"54.187.182.230",
		"54.187.199.38",
		"54.187.208.163",
		"54.238.140.239",
		"54.65.115.204",
		"54.65.97.98",
		"54.67.48.128",
		"54.67.52.245",
		"54.68.165.206",
		"54.68.183.151",
		"107.23.48.182",
		"107.23.48.232",
		"198.137.150.21",
		"198.137.150.22",
		"198.137.150.23",
		"198.137.150.24",
		"198.137.150.25",
		"198.137.150.26",
		"198.137.150.27",
		"198.137.150.28",
		"198.137.150.101",
		"198.137.150.102",
		"198.137.150.103",
		"198.137.150.104",
		"198.137.150.105",
		"198.137.150.106",
		"198.137.150.107",
		"198.137.150.108",
		"198.137.150.171",
		"198.137.150.172",
		"198.137.150.173",
		"198.137.150.174",
		"198.137.150.175",
		"198.137.150.176",
		"198.137.150.177",
		"198.137.150.178",
		"198.137.150.221",
		"198.137.150.222",
		"198.137.150.223",
		"198.137.150.224",
		"198.137.150.225",
		"198.137.150.226",
		"198.137.150.227",
		"198.137.150.228",
		"198.202.176.21",
		"198.202.176.22",
		"198.202.176.23",
		"198.202.176.24",
		"198.202.176.25",
		"198.202.176.26",
		"198.202.176.27",
		"198.202.176.28",
		"198.202.176.101",
		"198.202.176.102",
		"198.202.176.103",
		"198.202.176.104",
		"198.202.176.105",
		"198.202.176.106",
		"198.202.176.107",
		"198.202.176.108",
		"198.202.176.171",
		"198.202.176.172",
		"198.202.176.173",
		"198.202.176.174",
		"198.202.176.175",
		"198.202.176.176",
		"198.202.176.177",
		"198.202.176.178",
		"198.202.176.221",
		"198.202.176.222",
		"198.202.176.223",
		"198.202.176.224",
		"198.202.176.225",
		"198.202.176.226",
		"198.202.176.227",
		"198.202.176.228"
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
  // Disable IP filtering in development environment
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
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

/**
 * Lookup userId by Stripe customer ID when metadata is missing
 * This handles cases where Customer Portal updates don't preserve metadata
 */
async function getUserIdByStripeCustomer(stripeCustomerId: string): Promise<string | null> {
  try {
    console.log(`🔍 Looking up userId for Stripe customer: ${stripeCustomerId}`)
    const results = await db
      .select({ userId: userSubscriptions.userId })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeCustomerId, stripeCustomerId))
      .limit(1)
    
    // Safely check if results exist and have data
    const userId = results.length > 0 && results[0] ? results[0].userId : null
    console.log(`🔍 Database lookup result: ${userId ? `Found ${userId}` : 'Not found'}`)
    return userId
  } catch (error) {
    console.error('Error looking up userId by Stripe customer ID:', error)
    return null
  }
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
        console.log(`Processing ${event.type} for subscription:`, event.data.object.id)
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        console.log(`Processing ${event.type} for subscription:`, event.data.object.id)
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'checkout.session.completed':
        console.log(`Processing ${event.type} for session:`, event.data.object.id)
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
        // Log unhandled events temporarily to debug
        console.log(`Unhandled webhook event: ${event.type}`)
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
    console.error('No userId found in subscription metadata or database lookup', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      hasMetadata: !!subscription.metadata,
      metadataKeys: subscription.metadata ? Object.keys(subscription.metadata) : []
    })
    return
  }

  console.log(`Found userId: ${userId} for subscription: ${subscription.id}`)

  try {
    // Minimal logging for database fallback cases only
    if (!subscription.metadata?.userId) {
      console.log(`Webhook: Database fallback for ${subscription.id}`)
    }
    
    const webhookData = subscription as StripeSubscriptionWebhook    
    const priceId = subscription.items.data[0]?.price?.id
    console.log(`📋 Subscription details:`, {
      subscriptionId: subscription.id,
      status: subscription.status,
      priceId: priceId,
      customerId: subscription.customer
    })

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
    console.log(`✅ Subscription updated for user ${userId} - status: ${subscription.status}`)
  } catch (error) {
    console.error(`Error updating subscription for user ${userId}:`, error)
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
    console.error('No userId found in subscription metadata or database lookup for deletion', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      hasMetadata: !!subscription.metadata,
      metadataKeys: subscription.metadata ? Object.keys(subscription.metadata) : []
    })
    return
  }

  console.log(`Found userId: ${userId} for subscription deletion: ${subscription.id}`)

  try {
    await SubscriptionManager.cancelSubscription(userId)
    
    console.log(`Webhook: Subscription canceled ${subscription.id}`)
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
      
      console.log(`Webhook: Checkout completed ${subscription.id}`)
    } catch (error) {
      console.error(`Error creating subscription from checkout for user ${userId}:`, error)
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
    } catch (error) {
      console.error('Error handling successful invoice payment:', error)
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
    } catch (error) {
      console.error('Error handling failed invoice payment:', error)
    }
  }
}