import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { SubscriptionService } from '@/lib/subscription-service'
import { clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

// Simple rate limiting to prevent webhook storms
class WebhookRateLimit {
  private requests = new Map<string, { count: number; resetTime: number }>()
  private readonly MAX_REQUESTS = 100 // Max requests per minute
  private readonly WINDOW_MS = 60 * 1000 // 1 minute

  isRateLimited(eventType: string): boolean {
    const now = Date.now()
    const key = eventType
    const current = this.requests.get(key)

    if (!current || now > current.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + this.WINDOW_MS })
      return false
    }

    if (current.count >= this.MAX_REQUESTS) {
      return true
    }

    current.count++
    return false
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

const webhookRateLimit = new WebhookRateLimit()

// Cleanup rate limit cache every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => webhookRateLimit.cleanup(), 5 * 60 * 1000)
}

// Helper function to safely convert Stripe timestamps to Date objects
function safeTimestampToDate(timestamp: number | null): Date | null {
  if (timestamp === null || timestamp === undefined) {
    return null
  }
  
  // Validate that timestamp is a reasonable value
  // Stripe uses Unix timestamps in seconds, so we expect values roughly between 2020-2040
  // 1577836800 = Jan 1, 2020 and 2208988800 = Jan 1, 2040
  if (typeof timestamp !== 'number' || timestamp < 1577836800 || timestamp > 2208988800) {
    console.warn(`Invalid timestamp value: ${timestamp}`)
    return null
  }
  
  try {
    const date = new Date(timestamp * 1000)
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Failed to create valid date from timestamp: ${timestamp}`)
      return null
    }
    return date
  } catch (error) {
    console.warn(`Error converting timestamp ${timestamp} to date:`, error)
    return null
  }
}

// Helper function to safely get event timestamp
function getEventTimestamp(event: Stripe.Event): Date {
  const timestamp = safeTimestampToDate(event.created)
  return timestamp || new Date() // fallback to current time if invalid
}

// Extended types for Stripe objects with correct property names
interface StripeSubscriptionExtended extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  trial_start: number | null;
  trial_end: number | null;
}

interface StripeInvoiceExtended extends Stripe.Invoice {
  subscription: string | null;
}

export async function POST(req: NextRequest) {
  let event: Stripe.Event

  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { message: 'No stripe signature found' },
        { status: 400 }
      )
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Webhook signature verification failed: ${errorMessage}`)
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    )
  }

  // Rate limiting check to prevent webhook storms
  if (webhookRateLimit.isRateLimited(event.type)) {
    console.warn(`Rate limit exceeded for webhook type: ${event.type}`)
    return NextResponse.json(
      { message: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  // Handle the event
  try {
    // Only log essential events to reduce noise
    const essentialEvents = [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_failed'
    ]
    
    // Only process and log essential events
    if (!essentialEvents.includes(event.type)) {
      // Just return success for non-essential events without any logging
      return NextResponse.json({ received: true }, { status: 200 })
    }
    
    console.log(`Processing webhook event: ${event.type} (${event.id})`)
    
    // Simple idempotency check - only for events we actually process
    try {
      const { SubscriptionService } = await import('@/lib/subscription-service')
      const existingEvent = await SubscriptionService.findBillingEventByStripeId(event.id)
      if (existingEvent) {
        console.log(`Event ${event.id} already processed, skipping`)
        return NextResponse.json({ message: 'Event already processed' }, { status: 200 })
      }
    } catch (idempotencyError) {
      // If idempotency check fails, continue processing but log the error
      console.warn(`Idempotency check failed for event ${event.id}:`, idempotencyError)
    }
    
    switch (event.type) {
      case 'checkout.session.completed': {
        try {
          const session = event.data.object as Stripe.Checkout.Session
          console.log(`Payment successful for session: ${session.id}`)
          
          const userId = session.metadata?.userId
          const clerkEmail = session.metadata?.clerkEmail

          if (userId && session.subscription) {
            // Security check: Verify the email used in checkout matches the Clerk user's email
            try {
              const clerk = await clerkClient()
              const clerkUser = await clerk.users.getUser(userId)
              const primaryEmailAddress = clerkUser.emailAddresses.find(
                (email) => email.id === clerkUser.primaryEmailAddressId
              )
              const userEmail = primaryEmailAddress?.emailAddress

              // Check if the email in the session matches the user's Clerk email
              if (session.customer_details?.email && userEmail && session.customer_details.email !== userEmail) {
                console.error(`EMAIL MISMATCH DETECTED: User ${userId} session email ${session.customer_details.email} != Clerk email ${userEmail}`)
                
                // Log this as a security incident
                await SubscriptionService.logBillingEvent({
                  userId,
                  stripeEventId: event.id,
                  eventType: 'security_email_mismatch',
                  status: 'security_violation',
                  eventTimestamp: getEventTimestamp(event),
                  eventData: {
                    ...session,
                    securityNote: 'Email mismatch between Stripe checkout and Clerk user'
                  }
                })
                
                // Don't process the subscription - this is a potential security issue
                console.log(`Subscription processing blocked for user ${userId} due to email mismatch`)
                break
              }

              // Additional check: verify the stored Clerk email matches current email
              if (clerkEmail && clerkEmail !== userEmail) {
                console.error(`CLERK EMAIL CHANGED: Stored ${clerkEmail} != Current ${userEmail} for user ${userId}`)
                
                await SubscriptionService.logBillingEvent({
                  userId,
                  stripeEventId: event.id,
                  eventType: 'security_email_change_detected',
                  status: 'security_warning',
                  eventTimestamp: getEventTimestamp(event),
                  eventData: {
                    ...session,
                    securityNote: 'Clerk email changed between checkout creation and completion'
                  }
                })
              }
            } catch (clerkError) {
              console.error(`Failed to verify user email for ${userId}:`, clerkError)
              
              // Log the error but don't block processing in case Clerk is temporarily down
              await SubscriptionService.logBillingEvent({
                userId,
                stripeEventId: event.id,
                eventType: 'clerk_verification_failed',
                status: 'verification_error',
                eventTimestamp: getEventTimestamp(event),
                eventData: {
                  ...session,
                  error: clerkError instanceof Error ? clerkError.message : 'Unknown error'
                }
              })
            }

            // Fetch the subscription details from Stripe
            const rawSubscription = await stripe.subscriptions.retrieve(session.subscription as string)
            const subscription = rawSubscription as unknown as StripeSubscriptionExtended
            
            // Debug logging to see the actual structure
            if (process.env.NODE_ENV === 'development') {
              console.log('Full Stripe subscription object keys:', Object.keys(rawSubscription))
              console.log('Raw Stripe subscription:', {
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end,
                status: subscription.status
              })
            }
            
            // Convert to our format and update database
            const subscriptionData = {
              id: subscription.id,
              customer: subscription.customer as string,
              status: subscription.status,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end,
              cancel_at_period_end: subscription.cancel_at_period_end,
              canceled_at: subscription.canceled_at,
              trial_start: subscription.trial_start,
              trial_end: subscription.trial_end,
              metadata: subscription.metadata,
              items: subscription.items
            }
            
            await SubscriptionService.upsertSubscriptionFromStripe(
              userId,
              subscriptionData,
              session.customer as string
            )
            
            // Log billing event
            await SubscriptionService.logBillingEvent({
              userId,
              stripeEventId: event.id,
              eventType: 'checkout_session_completed',
              status: 'completed',
              eventTimestamp: getEventTimestamp(event),
              eventData: session
            })
            
            console.log(`Subscription activated for user: ${userId}`)
          } else {
            console.log(`Skipping checkout session - no userId or subscription: ${session.id}`)
          }
        } catch (sessionError) {
          console.error(`Error processing checkout.session.completed:`, sessionError)
          throw new Error(`Failed to process checkout session: ${sessionError instanceof Error ? sessionError.message : 'Unknown error'}`)
        }
        break
      }
      
      case 'customer.subscription.created': 
      case 'customer.subscription.updated': {
        try {
          const subscription = event.data.object as unknown as StripeSubscriptionExtended
          console.log(`Subscription ${event.type}: ${subscription.id}`)
          
          const userId = subscription.metadata?.userId
          if (userId) {
            const subscriptionData = {
              id: subscription.id,
              customer: subscription.customer as string,
              status: subscription.status,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end,
              cancel_at_period_end: subscription.cancel_at_period_end,
              canceled_at: subscription.canceled_at,
              trial_start: subscription.trial_start,
              trial_end: subscription.trial_end,
              metadata: subscription.metadata,
              items: subscription.items
            }
            
            await SubscriptionService.upsertSubscriptionFromStripe(userId, subscriptionData)
            
            // Invalidate cache when subscription is updated
            const { invalidateSubscriptionCache } = await import('@/components/providers/subscription-provider')
            invalidateSubscriptionCache(userId)
            
            await SubscriptionService.logBillingEvent({
              userId,
              stripeEventId: event.id,
              eventType: event.type.replace('.', '_'),
              status: subscription.status,
              eventTimestamp: getEventTimestamp(event),
              eventData: subscription
            })
          }
        } catch (subscriptionError) {
          console.error(`Error processing ${event.type}:`, subscriptionError)
          throw new Error(`Failed to process subscription event: ${subscriptionError instanceof Error ? subscriptionError.message : 'Unknown error'}`)
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        try {
          const subscription = event.data.object as unknown as StripeSubscriptionExtended
          console.log(`Subscription ${event.type}: ${subscription.id}`)
          
          const userId = subscription.metadata?.userId
          if (userId) {
            const subscriptionData = {
              id: subscription.id,
              customer: subscription.customer as string,
              status: subscription.status,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end,
              cancel_at_period_end: subscription.cancel_at_period_end,
              canceled_at: subscription.canceled_at,
              trial_start: subscription.trial_start,
              trial_end: subscription.trial_end,
              metadata: subscription.metadata,
              items: subscription.items
            }
            
            // Use special deletion handler
            await SubscriptionService.handleSubscriptionDeletion(userId, subscriptionData)
            
            // Invalidate cache when subscription is deleted
            const { invalidateSubscriptionCache } = await import('@/components/providers/subscription-provider')
            invalidateSubscriptionCache(userId)
            
            await SubscriptionService.logBillingEvent({
              userId,
              stripeEventId: event.id,
              eventType: event.type.replace('.', '_'),
              status: 'cancelled',
              eventTimestamp: getEventTimestamp(event),
              eventData: subscription
            })
          }
        } catch (subscriptionError) {
          console.error(`Error processing ${event.type}:`, subscriptionError)
          throw new Error(`Failed to process subscription deletion: ${subscriptionError instanceof Error ? subscriptionError.message : 'Unknown error'}`)
        }
        break
      }
      
      case 'invoice.payment_failed': {
        try {
          const invoice = event.data.object as unknown as StripeInvoiceExtended
          console.log(`Payment failed for invoice: ${invoice.id}`)
          
          // Get subscription if exists
          if (invoice.subscription && typeof invoice.subscription === 'string') {
            try {
              const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
              const userId = subscription.metadata?.userId
              
              if (userId) {
                await SubscriptionService.logBillingEvent({
                  userId,
                  stripeEventId: event.id,
                  stripeInvoiceId: invoice.id,
                  eventType: 'invoice_payment_failed',
                  amount: invoice.amount_due,
                  currency: invoice.currency,
                  status: 'failed',
                  eventTimestamp: getEventTimestamp(event),
                  eventData: invoice
                })
                
                console.log(`Payment failed for user: ${userId}`)
              }
            } catch (subscriptionError) {
              console.error('Error retrieving subscription for invoice:', subscriptionError)
            }
          }
        } catch (invoiceError) {
          console.error(`Error processing invoice.payment_failed:`, invoiceError)
          throw new Error(`Failed to process invoice payment failure: ${invoiceError instanceof Error ? invoiceError.message : 'Unknown error'}`)
        }
        break
      }
      
      default:
        // This should never happen since we filter events above
        break
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error)
    
    console.error(`Error processing webhook event ${event.type} (${event.id}):`, errorMessage)
    
    // Only log error details in development to reduce log noise
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', errorDetails)
      console.error('Event data that caused error:', JSON.stringify(event.data, null, 2))
    }
    
    return NextResponse.json(
      { 
        message: 'Webhook handler failed',
        error: errorMessage,
        eventType: event.type,
        eventId: event.id
      },
      { status: 500 }
    )
  }

  // Return a response to acknowledge receipt of the event
  return NextResponse.json({ message: 'Received' }, { status: 200 })
}