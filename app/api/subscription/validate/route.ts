import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { SubscriptionService } from '@/lib/subscription-service'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

/**
 * POST /api/subscription/validate
 * Validates the current user's subscription for security issues
 * Checks email consistency between Clerk, Database, and Stripe
 */
export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const validation = {
      userId,
      isValid: true,
      issues: [] as string[],
      warnings: [] as string[],
      details: {} as Record<string, unknown>
    }

    // Get subscription from database
    const dbSubscription = await SubscriptionService.getUserSubscription(userId)
    
    if (!dbSubscription || dbSubscription.tier === 'free') {
      return NextResponse.json({
        success: true,
        validation: {
          ...validation,
          message: 'No premium subscription to validate'
        }
      })
    }

    // Get user email from Clerk
    try {
      const clerk = await clerkClient()
      const clerkUser = await clerk.users.getUser(userId)
      const primaryEmailAddress = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      )
      const clerkEmail = primaryEmailAddress?.emailAddress

      validation.details.clerkEmail = clerkEmail

      if (!clerkEmail) {
        validation.isValid = false
        validation.issues.push('No primary email found in Clerk')
      }

      // Get customer details from Stripe if we have a customer ID
      if (dbSubscription.stripeCustomerId && clerkEmail) {
        try {
          const stripeCustomer = await stripe.customers.retrieve(dbSubscription.stripeCustomerId)
          
          if (stripeCustomer.deleted) {
            validation.isValid = false
            validation.issues.push('Stripe customer has been deleted')
          } else {
            const stripeEmail = (stripeCustomer as Stripe.Customer).email
            validation.details.stripeEmail = stripeEmail

            if (stripeEmail && stripeEmail !== clerkEmail) {
              validation.isValid = false
              validation.issues.push(`Email mismatch: Clerk (${clerkEmail}) vs Stripe (${stripeEmail})`)
            }
          }
        } catch (stripeError) {
          validation.warnings.push('Could not verify Stripe customer details')
          validation.details.stripeError = stripeError instanceof Error ? stripeError.message : 'Unknown error'
        }
      }

      // Verify subscription status in Stripe
      if (dbSubscription.stripeSubscriptionId) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(dbSubscription.stripeSubscriptionId)
          validation.details.stripeStatus = stripeSubscription.status
          validation.details.dbStatus = dbSubscription.status

          if (stripeSubscription.status !== dbSubscription.status) {
            validation.warnings.push(`Status mismatch: DB (${dbSubscription.status}) vs Stripe (${stripeSubscription.status})`)
          }

          // Check if subscription is actually active
          if (!['active', 'trialing'].includes(stripeSubscription.status)) {
            validation.isValid = false
            validation.issues.push(`Subscription not active in Stripe: ${stripeSubscription.status}`)
          }
        } catch (stripeError) {
          validation.isValid = false
          validation.issues.push('Subscription not found in Stripe or access denied')
          validation.details.stripeError = stripeError instanceof Error ? stripeError.message : 'Unknown error'
        }
      }

    } catch (clerkError) {
      validation.isValid = false
      validation.issues.push('Could not verify user details in Clerk')
      validation.details.clerkError = clerkError instanceof Error ? clerkError.message : 'Unknown error'
    }

    // Log validation results if there are issues
    if (!validation.isValid || validation.warnings.length > 0) {
      await SubscriptionService.logBillingEvent({
        userId,
        eventType: 'subscription_validation',
        status: validation.isValid ? 'warning' : 'validation_failed',
        eventTimestamp: new Date(),
        eventData: validation
      })
    }

    return NextResponse.json({
      success: true,
      validation
    })

  } catch (error) {
    console.error('Subscription validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}