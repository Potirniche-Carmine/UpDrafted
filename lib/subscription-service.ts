import { db } from '@/database/db'
import { 
  userSubscriptions, 
  userUsageTracking, 
  subscriptionFeatureLimits, 
  billingEvents,
  type UserSubscription,
  type NewUserSubscription,
  type UserUsageTracking,
  type NewUserUsageTracking,
  type BillingEvent,
  type NewBillingEvent
} from '@/database/schema'
import { eq } from 'drizzle-orm'
import { stripe } from '@/lib/stripe'

// Subscription tier type for better type safety
export type SubscriptionTier = 'free' | 'pro_athlete_monthly' | 'pro_athlete_yearly' | 'pro_coach_monthly' | 'pro_coach_yearly' | 'pro_recruiter_monthly' | 'pro_recruiter_yearly'

// Extended Stripe Subscription type with correct property names
export interface StripeSubscriptionData {
  id: string
  customer: string
  status: string
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  canceled_at: number | null
  trial_start: number | null
  trial_end: number | null
  metadata: Record<string, string>
  items: {
    data: Array<{
      price: {
        id: string
      }
    }>
  }
}

export class SubscriptionService {
  // Get user's current subscription
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId)
    })
    return subscription || null
  }

  // Get user's usage tracking
  static async getUserUsage(userId: string): Promise<UserUsageTracking | null> {
    const usage = await db.query.userUsageTracking.findFirst({
      where: eq(userUsageTracking.userId, userId)
    })
    return usage || null
  }

  // Get feature limits for a tier
  static async getFeatureLimits(tier: SubscriptionTier) {
    const limits = await db.query.subscriptionFeatureLimits.findFirst({
      where: eq(subscriptionFeatureLimits.tier, tier)
    })
    return limits
  }

  // Create or update subscription from Stripe webhook
  static async upsertSubscriptionFromStripe(
    userId: string, 
    stripeSubscription: StripeSubscriptionData,
    stripeCustomerId?: string
  ): Promise<UserSubscription> {
    // Price ID to tier mapping using environment variables
    // These MUST match the priceId values in your pricing-config.ts file
    const tierMapping: Record<string, SubscriptionTier> = {
      // Athlete plans
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY || '']: 'pro_athlete_monthly',
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY || '']: 'pro_athlete_yearly',
      
      // Coach plans
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY || '']: 'pro_coach_monthly',
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY || '']: 'pro_coach_yearly',
      
      // Recruiter plans
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY || '']: 'pro_recruiter_monthly', 
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY || '']: 'pro_recruiter_yearly',
    }

    const priceId = stripeSubscription.items.data[0]?.price.id
    const tier = priceId ? tierMapping[priceId] || 'free' : 'free'

    const subscriptionData: NewUserSubscription = {
      userId,
      stripeCustomerId: stripeCustomerId || stripeSubscription.customer,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      tier,
      status: stripeSubscription.status as 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid',
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null,
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
      metadata: stripeSubscription.metadata,
      updatedAt: new Date(),
    }

    // Upsert subscription
    const [subscription] = await db
      .insert(userSubscriptions)
      .values(subscriptionData)
      .onConflictDoUpdate({
        target: userSubscriptions.userId,
        set: subscriptionData
      })
      .returning()

    // Initialize or reset usage tracking
    await this.initializeUsageTracking(userId, subscription.currentPeriodStart!, subscription.currentPeriodEnd!)

    return subscription
  }

  // Initialize usage tracking for a user
  static async initializeUsageTracking(
    userId: string, 
    periodStart: Date, 
    periodEnd: Date | null
  ): Promise<UserUsageTracking> {
    const usageData: NewUserUsageTracking = {
      userId,
      profileViewsReceived: 0,
      connectionsRequested: 0,
      messagesReceived: 0,
      searchesPerformed: 0,
      analyticsViews: 0,
      lastResetAt: new Date(),
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      updatedAt: new Date(),
    }

    const [usage] = await db
      .insert(userUsageTracking)
      .values(usageData)
      .onConflictDoUpdate({
        target: userUsageTracking.userId,
        set: usageData
      })
      .returning()

    return usage
  }

  // Check if user has access to a premium feature
  static async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    const tier = subscription?.tier || 'free'
    
    const limits = await this.getFeatureLimits(tier)
    if (!limits) return false

    // Type-safe feature access check based on pricing page features
    switch (feature) {
      case 'advancedSearch':
        return Boolean(limits.advancedSearchEnabled)
      case 'profileViewInsights':
        return Boolean(limits.profileViewInsights)
      case 'analytics':
        return Boolean(limits.analyticsEnabled)
      default:
        return false
    }
  }

  // Check if user has reached usage limit for connection requests
  static async checkConnectionRequestLimit(
    userId: string
  ): Promise<{ allowed: boolean; limit: number; current: number }> {
    const subscription = await this.getUserSubscription(userId)
    const usage = await this.getUserUsage(userId)
    const tier = subscription?.tier || 'free'
    
    const limits = await this.getFeatureLimits(tier)
    
    // Default limit for free tier is 5 connections per month
    const limitValue = limits?.maxConnectionsPerMonth || 5
    const current = usage?.connectionsRequested || 0
    
    // -1 means unlimited
    const allowed = limitValue === -1 || current < limitValue
    
    return { allowed, limit: limitValue === -1 ? -1 : limitValue, current }
  }

  // Helper method to get connection limits based on role and tier
  static getConnectionLimitsByRole(role: 'athlete' | 'coach' | 'recruiter', isPro: boolean): {
    outgoingConnections: number;
    incomingConnections: number;
  } {
    if (!isPro) {
      // Free tier: 5 outgoing, 5 incoming for all roles
      return {
        outgoingConnections: 5,
        incomingConnections: 5
      }
    }

    // Pro tier
    if (role === 'athlete') {
      return {
        outgoingConnections: 25,
        incomingConnections: -1 // unlimited
      }
    } else {
      // Coach and Recruiter get unlimited for both
      return {
        outgoingConnections: -1, // unlimited
        incomingConnections: -1 // unlimited
      }
    }
  }

  // Increment usage counter
  static async incrementUsage(
    userId: string, 
    usageType: 'profileViewsReceived' | 'connectionsRequested' | 'messagesReceived' | 'searchesPerformed' | 'analyticsViews',
    amount: number = 1
  ): Promise<void> {
    const usage = await this.getUserUsage(userId)
    if (!usage) {
      // Initialize usage tracking if it doesn't exist
      await this.initializeUsageTracking(userId, new Date(), null)
    }

    const currentValue = usage?.[usageType] || 0
    await db
      .update(userUsageTracking)
      .set({
        [usageType]: currentValue + amount,
        updatedAt: new Date()
      })
      .where(eq(userUsageTracking.userId, userId))
  }

  // Log billing event
  static async logBillingEvent(eventData: Omit<NewBillingEvent, 'createdAt'>): Promise<BillingEvent> {
    const [event] = await db
      .insert(billingEvents)
      .values({
        ...eventData,
        createdAt: new Date()
      })
      .returning()

    return event
  }

  // Cancel subscription
  static async cancelSubscription(userId: string, immediate: boolean = false): Promise<void> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found')
    }

    // Cancel in Stripe
    if (immediate) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
    } else {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      })
    }

    // Update in database
    await db
      .update(userSubscriptions)
      .set({
        cancelAtPeriodEnd: !immediate,
        canceledAt: immediate ? new Date() : null,
        status: immediate ? 'cancelled' : subscription.status,
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.userId, userId))
  }

  // Get subscription status for user
  static async getSubscriptionStatus(userId: string): Promise<{
    tier: SubscriptionTier
    status: string
    isActive: boolean
    isPremium: boolean
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
  }> {
    const subscription = await this.getUserSubscription(userId)
    
    const tier = subscription?.tier || 'free'
    const status = subscription?.status || 'active'
    const isActive = status === 'active' || status === 'trialing'
    const isPremium = tier !== 'free' && isActive
    
    return {
      tier,
      status,
      isActive,
      isPremium,
      currentPeriodEnd: subscription?.currentPeriodEnd || null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false
    }
  }
}

// Feature access based on pricing page descriptions
export const defaultFeatureLimits = {
  free: {
    // All roles get 5 connection requests per month for free
    maxConnectionsPerMonth: 5,
    advancedSearchEnabled: false,
    profileViewInsights: false,
    analyticsEnabled: false,
  },
  pro: {
    // Athletes get 25 connections, Coaches/Recruiters get unlimited
    // This is handled dynamically based on user role
    advancedSearchEnabled: true,
    profileViewInsights: true,
    analyticsEnabled: true,
  }
} as const