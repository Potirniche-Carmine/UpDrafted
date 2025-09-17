import { db } from '@/database/db'
import { userSubscriptions, type UserSubscription } from '@/database/schema'
import { eq } from 'drizzle-orm'

/**
 * Simple in-memory cache for subscription status
 * This reduces the need for constant database and Stripe API calls
 */
class SubscriptionCache {
  private cache = new Map<string, {
    subscription: UserSubscription | null
    timestamp: number
    expires: number
  }>()
  
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_CACHE_SIZE = 10000 // Prevent memory leaks

  get(userId: string): UserSubscription | null | undefined {
    const cached = this.cache.get(userId)
    if (!cached) return undefined
    
    if (Date.now() > cached.expires) {
      this.cache.delete(userId)
      return undefined
    }
    
    return cached.subscription
  }

  set(userId: string, subscription: UserSubscription | null): void {
    // Prevent cache from growing too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanupExpired()
      
      // If still too large, clear oldest entries
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const entries = Array.from(this.cache.entries())
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
        const toDelete = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE / 2))
        toDelete.forEach(([key]) => this.cache.delete(key))
      }
    }

    this.cache.set(userId, {
      subscription,
      timestamp: Date.now(),
      expires: Date.now() + this.CACHE_TTL
    })
  }

  delete(userId: string): void {
    this.cache.delete(userId)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanupExpired(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expires) {
        this.cache.delete(key)
      }
    }
  }

  // Periodic cleanup to prevent memory leaks
  startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpired()
    }, 10 * 60 * 1000) // Cleanup every 10 minutes
  }
}

// Global cache instance
const subscriptionCache = new SubscriptionCache()

// Start cleanup interval when this module is imported
if (typeof window === 'undefined') { // Only on server
  subscriptionCache.startCleanupInterval()
}

/**
 * Simplified subscription service without over-engineering
 */
export class SimpleSubscriptionService {
  
  /**
   * Get user subscription with caching
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    // Check cache first
    const cached = subscriptionCache.get(userId)
    if (cached !== undefined) {
      return cached
    }

    // Fetch from database
    try {
      const subscription = await db.query.userSubscriptions.findFirst({
        where: eq(userSubscriptions.userId, userId)
      })

      // Cache the result
      subscriptionCache.set(userId, subscription || null)
      
      return subscription || null
    } catch (error) {
      console.error(`Error fetching subscription for user ${userId}:`, error)
      return null
    }
  }

  /**
   * Check if user has premium access
   */
  static async hasPremiumAccess(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    
    if (!subscription) return false
    
    // Simple checks - no over-engineering
    const isActive = ['active', 'trialing'].includes(subscription.status)
    const isPremium = subscription.tier !== 'free'
    const notExpired = !subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date()
    
    return isActive && isPremium && notExpired
  }

  /**
   * Get user features based on subscription
   */
  static async getUserFeatures(userId: string): Promise<{
    hasAccess: boolean
    tier: string
    features: {
      advancedSearch: boolean
      profileViewInsights: boolean
      analytics: boolean
    }
  }> {
    const hasPremium = await this.hasPremiumAccess(userId)
    const subscription = await this.getUserSubscription(userId)
    
    return {
      hasAccess: true, // Always allow basic access
      tier: subscription?.tier || 'free',
      features: {
        advancedSearch: hasPremium,
        profileViewInsights: hasPremium,
        analytics: hasPremium
      }
    }
  }

  /**
   * Update subscription and invalidate cache
   */
  static async updateSubscription(userId: string, subscriptionData: Partial<UserSubscription>): Promise<void> {
    try {
      // Update database
      await db.update(userSubscriptions)
        .set({
          ...subscriptionData,
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.userId, userId))

      // Invalidate cache
      subscriptionCache.delete(userId)
      
      console.log(`Subscription updated for user ${userId}`)
    } catch (error) {
      console.error(`Error updating subscription for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Invalidate cache when webhooks update subscription
   */
  static invalidateCache(userId: string): void {
    subscriptionCache.delete(userId)
  }

  /**
   * Check subscription without complex validation
   * This replaces the over-engineered security service
   */
  static async validateBasicAccess(userId: string): Promise<{
    valid: boolean
    tier: string
    reason?: string
  }> {
    try {
      const subscription = await this.getUserSubscription(userId)
      
      if (!subscription) {
        return { valid: true, tier: 'free' }
      }

      // Basic validation without paranoid checks
      if (!['active', 'trialing', 'past_due'].includes(subscription.status)) {
        return { 
          valid: false, 
          tier: 'free', 
          reason: `Subscription status: ${subscription.status}` 
        }
      }

      if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
        return { 
          valid: false, 
          tier: 'free', 
          reason: 'Subscription expired' 
        }
      }

      return { valid: true, tier: subscription.tier }
      
    } catch (error) {
      console.error(`Error validating access for user ${userId}:`, error)
      // On error, allow access but log it
      return { valid: true, tier: 'free', reason: 'Validation error - defaulting to free' }
    }
  }
}