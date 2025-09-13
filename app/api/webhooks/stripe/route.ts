import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { SubscriptionService } from '@/lib/subscription-service'
import Stripe from 'stripe'

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

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`Payment successful for session: ${session.id}`)
        
        const userId = session.metadata?.userId
        if (userId && session.subscription) {
          // Fetch the subscription details from Stripe
          const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const subscription = stripeSubscription as unknown as StripeSubscriptionExtended
          
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
            eventTimestamp: new Date(event.created * 1000),
            eventData: session
          })
          
          console.log(`Subscription activated for user: ${userId}`)
        }
        break
      }
      
      case 'customer.subscription.created': 
      case 'customer.subscription.updated': 
      case 'customer.subscription.deleted': {
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
          
          await SubscriptionService.logBillingEvent({
            userId,
            stripeEventId: event.id,
            eventType: event.type.replace('.', '_'),
            status: subscription.status,
            eventTimestamp: new Date(event.created * 1000),
            eventData: subscription
          })
        }
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as unknown as StripeInvoiceExtended
        console.log(`Payment succeeded for invoice: ${invoice.id}`)
        
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
                eventType: 'invoice_payment_succeeded',
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: 'paid',
                eventTimestamp: new Date(event.created * 1000),
                eventData: invoice
              })
            }
          } catch (error) {
            console.error('Error retrieving subscription for invoice:', error)
          }
        }
        break
      }
      
      case 'invoice.payment_failed': {
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
                eventTimestamp: new Date(event.created * 1000),
                eventData: invoice
              })
              
              console.log(`Payment failed for user: ${userId}`)
            }
          } catch (error) {
            console.error('Error retrieving subscription for invoice:', error)
          }
        }
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { message: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  // Return a response to acknowledge receipt of the event
  return NextResponse.json({ message: 'Received' }, { status: 200 })
}