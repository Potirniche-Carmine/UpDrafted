import { db } from '@/database/db'
import { userSubscriptions, userUsageTracking } from '@/database/schema'
import { eq } from 'drizzle-orm'

/**
 * Simplified subscription management - no over-engineering
 * 24-hour cache to reduce database calls significantly
 */

interface SubscriptionData {
  tier: string
  status: string
  isActive: boolean
  isPremium: boolean
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
}

interface SubscriptionFeatures {
  advancedSearch: boolean
  profileViewInsights: boolean
  analytics: boolean
  maxConnectionsPerMonth: number
}

// 24-hour cache for subscription data
const subscriptionCache = new Map<string, {
  data: SubscriptionData
  features: SubscriptionFeatures
  timestamp: number
}>()

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CACHE_SIZE = 10000 // Prevent memory leaks

export class SubscriptionManager {
  
  /**
   * Get user subscription with 24-hour caching
   */
  static async getUserSubscription(userId: string): Promise<SubscriptionData> {
    // Check cache first
    const cached = subscriptionCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    // Fetch from database
    try {
      const [subscription] = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1)

      const subscriptionData: SubscriptionData = subscription ? {
        tier: subscription.tier,
        status: subscription.status,
        isActive: ['active', 'trialing'].includes(subscription.status),
        isPremium: subscription.tier !== 'free',
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
        stripeCustomerId: subscription.stripeCustomerId || undefined,
        stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
        stripePriceId: subscription.stripePriceId || undefined
      } : {
        tier: 'free',
        status: 'active',
        isActive: true,
        isPremium: false,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      }

      const features = this.getFeatures(subscriptionData)

      // Cache for 24 hours
      this.updateCache(userId, subscriptionData, features)

      return subscriptionData
    } catch (error) {
      console.error(`Error fetching subscription for user ${userId}:`, error)
      return this.getDefaultSubscription()
    }
  }

  /**
   * Get subscription features
   */
  static async getSubscriptionFeatures(userId: string): Promise<SubscriptionFeatures> {
    const cached = subscriptionCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.features
    }

    const subscription = await this.getUserSubscription(userId)
    return this.getFeatures(subscription)
  }

  /**
   * Check if user has premium access
   */
  static async hasPremiumAccess(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    return subscription.isPremium && subscription.isActive
  }

  /**
   * Check for existing active subscription (prevents double checkout)
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    return subscription.isActive && subscription.isPremium
  }

  /**
   * Update subscription from Stripe webhook
   */
  static async updateSubscriptionFromStripe(
    userId: string,
    stripeData: {
      id: string
      customer: string
      status: string
      current_period_start: number
      current_period_end: number
      cancel_at_period_end: boolean
      canceled_at: number | null
      trial_start: number | null
      trial_end: number | null
      items: { data: Array<{ price: { id: string } }> }
    }
  ): Promise<void> {
    try {
      const tier = this.getPriceIdToTier(stripeData.items.data[0]?.price?.id)
      
      await db
        .insert(userSubscriptions)
        .values({
          userId,
          tier,
          status: this.mapStripeStatus(stripeData.status),
          stripeSubscriptionId: stripeData.id,
          stripeCustomerId: stripeData.customer,
          stripePriceId: stripeData.items.data[0]?.price?.id,
          currentPeriodStart: new Date(stripeData.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeData.current_period_end * 1000),
          cancelAtPeriodEnd: stripeData.cancel_at_period_end,
          trialStart: stripeData.trial_start ? new Date(stripeData.trial_start * 1000) : null,
          trialEnd: stripeData.trial_end ? new Date(stripeData.trial_end * 1000) : null,
        })
        .onConflictDoUpdate({
          target: userSubscriptions.userId,
          set: {
            tier,
            status: this.mapStripeStatus(stripeData.status),
            stripeSubscriptionId: stripeData.id,
            stripeCustomerId: stripeData.customer,
            stripePriceId: stripeData.items.data[0]?.price?.id,
            currentPeriodStart: new Date(stripeData.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeData.current_period_end * 1000),
            cancelAtPeriodEnd: stripeData.cancel_at_period_end,
            trialStart: stripeData.trial_start ? new Date(stripeData.trial_start * 1000) : null,
            trialEnd: stripeData.trial_end ? new Date(stripeData.trial_end * 1000) : null,
            updatedAt: new Date(),
          }
        })

      // Invalidate cache
      this.invalidateCache(userId)
    } catch (error) {
      console.error(`Error updating subscription for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Handle subscription cancellation
   */
  static async cancelSubscription(userId: string): Promise<void> {
    try {
      await db
        .update(userSubscriptions)
        .set({
          status: 'cancelled',
          tier: 'free',
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.userId, userId))

      this.invalidateCache(userId)
    } catch (error) {
      console.error(`Error canceling subscription for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get connection usage
   */
  static async getConnectionUsage(userId: string): Promise<{ current: number; limit: number }> {
    try {
      const [usage] = await db
        .select()
        .from(userUsageTracking)
        .where(eq(userUsageTracking.userId, userId))
        .limit(1)

      const features = await this.getSubscriptionFeatures(userId)
      
      return {
        current: usage?.connectionsRequested || 0,
        limit: features.maxConnectionsPerMonth
      }
    } catch (error) {
      console.error(`Error getting usage for user ${userId}:`, error)
      return { current: 0, limit: 5 }
    }
  }

  // Private helper methods

  private static getFeatures(subscription: SubscriptionData): SubscriptionFeatures {
    const isPremium = subscription.isPremium && subscription.isActive
    
    return {
      advancedSearch: isPremium,
      profileViewInsights: isPremium,
      analytics: isPremium,
      maxConnectionsPerMonth: isPremium ? 999999 : 5
    }
  }

  private static getDefaultSubscription(): SubscriptionData {
    return {
      tier: 'free',
      status: 'active',
      isActive: true,
      isPremium: false,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false
    }
  }

  private static updateCache(userId: string, data: SubscriptionData, features: SubscriptionFeatures): void {
    // Prevent cache from growing too large
    if (subscriptionCache.size >= MAX_CACHE_SIZE) {
      // Remove oldest entries (simple FIFO)
      const keys = Array.from(subscriptionCache.keys())
      for (let i = 0; i < Math.floor(MAX_CACHE_SIZE * 0.1); i++) {
        subscriptionCache.delete(keys[i])
      }
    }

    subscriptionCache.set(userId, {
      data,
      features,
      timestamp: Date.now()
    })
  }

  private static invalidateCache(userId: string): void {
    subscriptionCache.delete(userId)
  }

  private static mapStripeStatus(stripeStatus: string): 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' {
    if (stripeStatus === 'canceled') return 'cancelled'
    
    const validStatuses = ['active', 'cancelled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid'] as const
    if ((validStatuses as readonly string[]).includes(stripeStatus)) {
      return stripeStatus as typeof validStatuses[number]
    }
    
    return 'cancelled'
  }

  private static getPriceIdToTier(priceId: string): "free" | "pro_athlete_monthly" | "pro_athlete_yearly" | "pro_coach_monthly" | "pro_coach_yearly" | "pro_recruiter_monthly" | "pro_recruiter_yearly" {
    // Map your Stripe price IDs to tiers
    const priceMap: Record<string, "free" | "pro_athlete_monthly" | "pro_athlete_yearly" | "pro_coach_monthly" | "pro_coach_yearly" | "pro_recruiter_monthly" | "pro_recruiter_yearly"> = {
      // Add your actual Stripe price IDs here
      'price_athlete_monthly': 'pro_athlete_monthly',
      'price_athlete_yearly': 'pro_athlete_yearly',
      'price_coach_monthly': 'pro_coach_monthly',
      'price_coach_yearly': 'pro_coach_yearly',
      'price_recruiter_monthly': 'pro_recruiter_monthly',
      'price_recruiter_yearly': 'pro_recruiter_yearly',
    }
    
    return priceMap[priceId] || 'free'
  }

  // Global cache cleanup for memory management
  static startCacheCleanup(): void {
    if (typeof window === 'undefined') { // Server-side only
      setInterval(() => {
        const now = Date.now()
        for (const [key, value] of subscriptionCache.entries()) {
          if (now - value.timestamp > CACHE_DURATION) {
            subscriptionCache.delete(key)
          }
        }
      }, 60 * 60 * 1000) // Cleanup every hour
    }
  }
}

// Start cleanup when module loads
SubscriptionManager.startCacheCleanup()