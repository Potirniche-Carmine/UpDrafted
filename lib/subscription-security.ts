import { SimpleSubscriptionService } from './simple-subscription'

/**
 * Simplified subscription security - no over-engineering
 * This replaces the complex multi-layer validation that was causing performance issues
 */
export class SubscriptionSecurityService {
  
  /**
   * Simple subscription validation - just check database
   * No paranoid Stripe API calls on every request
   */
  static async validateSubscriptionAccess(userId: string): Promise<{
    hasAccess: boolean;
    tier: string;
    features: {
      advancedSearch: boolean;
      profileViewInsights: boolean;
      analytics: boolean;
    };
    securityFlags: string[];
  }> {
    try {
      // Use simple cached lookup instead of complex validation
      const validation = await SimpleSubscriptionService.validateBasicAccess(userId)
      const features = await SimpleSubscriptionService.getUserFeatures(userId)
      
      const securityFlags: string[] = []
      
      if (!validation.valid && validation.reason) {
        securityFlags.push(validation.reason)
      }

      return {
        hasAccess: validation.valid,
        tier: validation.tier,
        features: features.features,
        securityFlags
      }
      
    } catch (error) {
      console.error(`Subscription validation error for user ${userId}:`, error)
      
      // On error, default to free tier access
      return {
        hasAccess: true,
        tier: 'free',
        features: { advancedSearch: false, profileViewInsights: false, analytics: false },
        securityFlags: ['validation_error']
      }
    }
  }

  /**
   * Simplified feature access check
   */
  static async hasFeatureAccess(userId: string): Promise<boolean> {
    try {
      return await SimpleSubscriptionService.hasPremiumAccess(userId)
    } catch (error) {
      console.error(`Feature access check error for user ${userId}:`, error)
      return false // Default to no access on error
    }
  }

  /**
   * No-op security event logging to maintain API compatibility
   */
  static async logSecurityEvent(): Promise<void> {
    // Do nothing - removed excessive logging that was causing noise
  }
}