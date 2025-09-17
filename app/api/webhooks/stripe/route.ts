import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { SubscriptionManager } from '@/lib/subscription'
import Stripe from 'stripe'

// Simple rate limiting to prevent webhook storms
const webhookRequests = new Map<string, { count: number; resetTime: number }>()
const MAX_REQUESTS_PER_MINUTE = 100
const RATE_LIMIT_WINDOW = 60 * 1000

function isRateLimited(eventType: string): boolean {
  const now = Date.now()
  const current = webhookRequests.get(eventType)

  if (!current || now > current.resetTime) {
    webhookRequests.set(eventType, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (current.count >= MAX_REQUESTS_PER_MINUTE) {
    return true
  }

  current.count++
  return false
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const sig = headersList.get('stripe-signature')

    if (!sig) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Rate limiting
    if (isRateLimited(event.type)) {
      console.warn(`Rate limit exceeded for webhook type: ${event.type}`)
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    console.log(`Processing webhook: ${event.type}`)

    // Handle subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`Unhandled webhook type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
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

    console.log(`Subscription updated for user ${userId}`)
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
    console.log(`Subscription canceled for user ${userId}`)
  } catch (error) {
    console.error(`Error canceling subscription for user ${userId}:`, error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice ${invoice.id}`)
  // Could send notification to user here
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) {
    console.error('No userId in checkout session metadata')
    return
  }

  console.log(`Checkout completed for user ${userId}`)
  
  // If this is a subscription checkout, the subscription webhook will handle the update
  // For one-time payments, you could handle those here
}