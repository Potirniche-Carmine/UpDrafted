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

// Enhanced error types for better error handling
class SubscriptionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'SubscriptionError'
  }
}

class DatabaseError extends SubscriptionError {
  constructor(message: string, cause?: Error) {
    super(message, 'DATABASE_ERROR', cause)
    this.name = 'DatabaseError'
  }
}

class NetworkError extends SubscriptionError {
  constructor(message: string, cause?: Error) {
    super(message, 'NETWORK_ERROR', cause)
    this.name = 'NetworkError'
  }
}

class ValidationError extends SubscriptionError {
  constructor(message: string, cause?: Error) {
    super(message, 'VALIDATION_ERROR', cause)
    this.name = 'ValidationError'
  }
}

// 24-hour cache for subscription data with LRU eviction
const subscriptionCache = new Map<string, {
  data: SubscriptionData
  features: SubscriptionFeatures
  timestamp: number
  accessCount: number
  lastAccessed: number
}>()

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CACHE_SIZE = 5000 // Reduced from 10000 to prevent memory issues
const CLEANUP_INTERVAL = 30 * 60 * 1000 // Cleanup every 30 minutes instead of 1 hour
const LRU_EVICTION_BATCH_SIZE = 500 // Remove this many entries when cache is full

// Track cleanup interval for proper cleanup
let cleanupInterval: NodeJS.Timeout | null = null

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  backoffMs: 1000,
  backoffMultiplier: 2
}

/**
 * Retry wrapper for database operations with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  context: string,
  maxAttempts = RETRY_CONFIG.maxAttempts
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Don't retry validation errors or certain database constraint errors
      if (isNonRetryableError(lastError)) {
        throw new ValidationError(`${context}: ${lastError.message}`, lastError)
      }
      
      // Check if this looks like a network/database error
      if (isDatabaseError(lastError)) {
        if (attempt === maxAttempts) {
          throw new DatabaseError(`${context} failed after ${maxAttempts} attempts: ${lastError.message}`, lastError)
        }
        
        // Exponential backoff
        const delayMs = RETRY_CONFIG.backoffMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }
      
      // For other errors, throw immediately
      throw new SubscriptionError(`${context}: ${lastError.message}`, 'UNKNOWN_ERROR', lastError)
    }
  }
  
  throw lastError!
}

/**
 * Check if error should not be retried
 */
function isNonRetryableError(error: Error): boolean {
  const nonRetryablePatterns = [
    'constraint',
    'validation',
    'duplicate',
    'unique',
    'foreign key',
    'not null'
  ]
  
  return nonRetryablePatterns.some(pattern => 
    error.message.toLowerCase().includes(pattern)
  )
}

/**
 * Check if error is likely a database/network error that can be retried
 */
function isDatabaseError(error: Error): boolean {
  const retryablePatterns = [
    'connection',
    'timeout',
    'network',
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNREFUSED',
    'database is locked',
    'server is not ready'
  ]
  
  return retryablePatterns.some(pattern => 
    error.message.toLowerCase().includes(pattern)
  )
}

export class SubscriptionManager {
  
  /**
   * Get user subscription with 24-hour caching
   */
  static async getUserSubscription(userId: string): Promise<SubscriptionData> {
    // Check cache first with LRU access tracking
    const cached = subscriptionCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Update access tracking for LRU
      cached.accessCount++
      cached.lastAccessed = Date.now()
      return cached.data
    }

    // Fetch from database with retry logic
    try {
      const subscriptionData = await withRetry(async () => {
        const [subscription] = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.userId, userId))
          .limit(1)

        return subscription ? {
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
      }, 'Fetch user subscription')

      const features = this.getFeatures(subscriptionData)

      // Cache for 24 hours
      this.updateCache(userId, subscriptionData, features)

      return subscriptionData
    } catch (error) {
      // Enhanced error logging with categorization for monitoring
      const errorInfo = {
        userId: '[REDACTED]', // Always redact userId
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        isRetryable: error instanceof DatabaseError || error instanceof NetworkError,
        context: 'getUserSubscription',
        timestamp: new Date().toISOString(),
        severity: 'ERROR'
      }
      
      console.error('Error fetching subscription:', errorInfo)
      
      // In production, consider sending critical errors to monitoring service
      if (process.env.NODE_ENV === 'production' && 
          !(error instanceof NetworkError) && 
          !(error instanceof ValidationError)) {
        // This would be where you'd send to your monitoring service
        // e.g., Sentry, DataDog, etc.
        console.error('CRITICAL: Subscription fetch failed in production', {
          context: errorInfo.context,
          errorType: errorInfo.errorType,
          timestamp: errorInfo.timestamp
        })
      }
      
      return this.getDefaultSubscription()
    }
  }

  /**
   * Get subscription features
   */
  static async getSubscriptionFeatures(userId: string): Promise<SubscriptionFeatures> {
    const cached = subscriptionCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Update access tracking for LRU
      cached.accessCount++
      cached.lastAccessed = Date.now()
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
    // Input validation
    if (!userId || !stripeData?.id || !stripeData?.customer) {
      throw new ValidationError('Invalid input data: missing required fields')
    }

    try {
      await withRetry(async () => {
        const tier = this.getPriceIdToTier(stripeData.items.data[0]?.price?.id)
        
        // Handle invalid/undefined dates with fallbacks
        const now = new Date()
        const currentPeriodStart = this.createValidDate(stripeData.current_period_start, now)
        const currentPeriodEnd = this.createValidDate(stripeData.current_period_end, 
          tier.includes('yearly') ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) : 
          new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        )
        
        await db
          .insert(userSubscriptions)
          .values({
            userId,
            tier,
            status: this.mapStripeStatus(stripeData.status),
            stripeSubscriptionId: stripeData.id,
            stripeCustomerId: stripeData.customer,
            stripePriceId: stripeData.items.data[0]?.price?.id,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: stripeData.cancel_at_period_end,
            trialStart: stripeData.trial_start ? this.createValidDate(stripeData.trial_start) : null,
            trialEnd: stripeData.trial_end ? this.createValidDate(stripeData.trial_end) : null,
          })
          .onConflictDoUpdate({
            target: userSubscriptions.userId,
            set: {
              tier,
              status: this.mapStripeStatus(stripeData.status),
              stripeSubscriptionId: stripeData.id,
              stripeCustomerId: stripeData.customer,
              stripePriceId: stripeData.items.data[0]?.price?.id,
              currentPeriodStart,
              currentPeriodEnd,
              cancelAtPeriodEnd: stripeData.cancel_at_period_end,
              trialStart: stripeData.trial_start ? this.createValidDate(stripeData.trial_start) : null,
              trialEnd: stripeData.trial_end ? this.createValidDate(stripeData.trial_end) : null,
              updatedAt: new Date(),
            }
          })
      }, 'Update subscription from Stripe')

      // Invalidate cache for real-time updates
      this.invalidateCache(userId)
    } catch (error) {
      // Enhanced error logging for update operations
      const errorInfo = {
        userId: '[REDACTED]', // Always redact userId
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        isRetryable: error instanceof DatabaseError || error instanceof NetworkError,
        context: 'updateUserSubscription',
        timestamp: new Date().toISOString(),
        severity: 'ERROR'
      }
      
      console.error('Error updating subscription:', errorInfo)
      
      // Critical error monitoring for subscription updates
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: Subscription update failed in production', {
          context: errorInfo.context,
          errorType: errorInfo.errorType,
          timestamp: errorInfo.timestamp
        })
      }
      
      throw error
    }
  }

    /**
   * Handle subscription cancellation
   */
  static async cancelSubscription(userId: string): Promise<void> {
    if (!userId) {
      throw new ValidationError('User ID is required for subscription cancellation')
    }

    try {
      await withRetry(async () => {
        await db
          .update(userSubscriptions)
          .set({
            status: 'cancelled',
            tier: 'free',
            updatedAt: new Date()
          })
          .where(eq(userSubscriptions.userId, userId))
      }, 'Cancel subscription')

      // Invalidate cache for real-time updates
      this.invalidateCache(userId)
    } catch (error) {
      // Enhanced error logging for cancellation operations
      const errorInfo = {
        userId: '[REDACTED]', // Always redact userId
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        isRetryable: error instanceof DatabaseError || error instanceof NetworkError,
        context: 'cancelUserSubscription',
        timestamp: new Date().toISOString(),
        severity: 'ERROR'
      }
      
      console.error('Error canceling subscription:', errorInfo)
      
      // Critical error monitoring for subscription cancellations
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: Subscription cancellation failed in production', {
          context: errorInfo.context,
          errorType: errorInfo.errorType,
          timestamp: errorInfo.timestamp
        })
      }
      
      throw error
    }
  }

  /**
   * Manually invalidate cache for a user (useful for immediate updates)
   */
  static invalidateUserCache(userId: string): void {
    this.invalidateCache(userId)
  }

  /**
   * Get connection usage
   */
  static async getConnectionUsage(userId: string): Promise<{ current: number; limit: number }> {
    if (!userId) {
      throw new ValidationError('User ID is required for usage tracking')
    }

    try {
      const [usage, features] = await Promise.all([
        withRetry(async () => {
          const [result] = await db
            .select()
            .from(userUsageTracking)
            .where(eq(userUsageTracking.userId, userId))
            .limit(1)
          return result
        }, 'Fetch usage tracking'),
        this.getSubscriptionFeatures(userId)
      ])
      
      return {
        current: usage?.connectionsRequested || 0,
        limit: features.maxConnectionsPerMonth
      }
    } catch (error) {
      // Enhanced error logging for usage tracking
      const errorInfo = {
        userId: '[REDACTED]', // Always redact userId
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        isRetryable: error instanceof DatabaseError || error instanceof NetworkError,
        context: 'getUsageData',
        timestamp: new Date().toISOString(),
        severity: 'WARNING' // Usage errors are less critical than subscription errors
      }
      
      console.error('Error fetching usage data:', errorInfo)
      
      // Only alert on repeated usage failures in production
      if (process.env.NODE_ENV === 'production' && 
          !(error instanceof NetworkError)) {
        console.warn('Usage tracking failure in production', {
          context: errorInfo.context,
          errorType: errorInfo.errorType,
          timestamp: errorInfo.timestamp
        })
      }
      
      // Return safe fallback instead of throwing
      return { current: 0, limit: 5 }
    }
  }

  // Private helper methods

  private static createValidDate(timestamp: number | null | undefined, fallback?: Date): Date {
    if (timestamp == null || isNaN(timestamp)) {
      return fallback || new Date()
    }
    
    const date = new Date(timestamp * 1000)
    if (isNaN(date.getTime())) {
      return fallback || new Date()
    }
    
    return date
  }

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
    // Prevent cache from growing too large with intelligent LRU eviction
    if (subscriptionCache.size >= MAX_CACHE_SIZE) {
      this.evictLeastRecentlyUsed()
    }

    const now = Date.now()
    subscriptionCache.set(userId, {
      data,
      features,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    })
  }

  /**
   * LRU eviction strategy - remove least recently used entries
   */
  private static evictLeastRecentlyUsed(): void {
    // Convert to array and sort by access patterns
    const entries = Array.from(subscriptionCache.entries())
    
    // Sort by last accessed time (oldest first) and access count (least used first)
    entries.sort((a, b) => {
      const timeDiff = a[1].lastAccessed - b[1].lastAccessed
      if (Math.abs(timeDiff) < 10000) { // If accessed within 10 seconds, prefer less accessed
        return a[1].accessCount - b[1].accessCount
      }
      return timeDiff
    })

    // Remove the least recently used entries
    const toRemove = Math.min(LRU_EVICTION_BATCH_SIZE, Math.floor(subscriptionCache.size * 0.2))
    for (let i = 0; i < toRemove; i++) {
      subscriptionCache.delete(entries[i][0])
    }
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
    // Map your Stripe price IDs to tiers using environment variables
    const priceMap: Record<string, "free" | "pro_athlete_monthly" | "pro_athlete_yearly" | "pro_coach_monthly" | "pro_coach_yearly" | "pro_recruiter_monthly" | "pro_recruiter_yearly"> = {
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY || '']: 'pro_athlete_monthly',
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY || '']: 'pro_athlete_yearly',
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY || '']: 'pro_coach_monthly',
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY || '']: 'pro_coach_yearly',
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY || '']: 'pro_recruiter_monthly',
      [process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY || '']: 'pro_recruiter_yearly',
    }
    
    // Debug logging to help identify mapping issues
    // Removed console logs for production
    
    return priceMap[priceId] || 'free'
  }

  // Global cache cleanup for memory management with improved efficiency
  static startCacheCleanup(): void {
    if (typeof window === 'undefined') { // Server-side only
      // Clear any existing interval to prevent duplicates during hot reloads
      if (cleanupInterval) {
        clearInterval(cleanupInterval)
      }
      
      const cleanup = () => {
        const now = Date.now()
        let removedCount = 0
        
        // Remove expired entries
        for (const [key, value] of subscriptionCache.entries()) {
          if (now - value.timestamp > CACHE_DURATION) {
            subscriptionCache.delete(key)
            removedCount++
          }
        }
        
        // If cache is still too large, perform LRU eviction
        if (subscriptionCache.size > MAX_CACHE_SIZE * 0.8) {
          this.evictLeastRecentlyUsed()
        }
        
        // Log cleanup statistics (without sensitive data) only in development
        if (removedCount > 0 && process.env.NODE_ENV === 'development') {
          console.info(`Subscription cache cleanup: removed ${removedCount} expired entries, ${subscriptionCache.size} entries remaining`)
        }
      }
      
      cleanupInterval = setInterval(cleanup, CLEANUP_INTERVAL)
      
      // Run cleanup immediately on startup
      cleanup()
    }
  }

  // Add method to stop cleanup (useful for testing and hot reloads)
  static stopCacheCleanup(): void {
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
      cleanupInterval = null
    }
  }

  // Clear cache completely (useful for testing and memory management)
  static clearCache(): void {
    subscriptionCache.clear()
  }
}

// Start cleanup when module loads
SubscriptionManager.startCacheCleanup()