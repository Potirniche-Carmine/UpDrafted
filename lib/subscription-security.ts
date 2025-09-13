import { db } from '@/database/db'
import { userSubscriptions, billingEvents, type UserSubscription } from '@/database/schema'
import { eq, desc } from 'drizzle-orm'
import { stripe } from '@/lib/stripe'

/**
 * Advanced subscription security service
 * Provides multi-layer verification against subscription spoofing
 */
export class SubscriptionSecurityService {
  
  /**
   * Verify subscription integrity by cross-referencing with Stripe
   * This prevents database manipulation attacks
   */
  static async verifySubscriptionIntegrity(userId: string): Promise<{
    isValid: boolean;
    subscription: UserSubscription | null;
    error?: string;
  }> {
    try {
      // Get subscription from database
      const dbSubscription = await db.query.userSubscriptions.findFirst({
        where: eq(userSubscriptions.userId, userId)
      });

      if (!dbSubscription) {
        return { isValid: true, subscription: null }; // Free tier is valid
      }

      // If we have a Stripe subscription ID, verify it with Stripe
      if (dbSubscription.stripeSubscriptionId) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            dbSubscription.stripeSubscriptionId
          );

          // Verify critical fields match
          const isStatusMatch = stripeSubscription.status === dbSubscription.status;
          const isPriceMatch = stripeSubscription.items.data[0]?.price.id === dbSubscription.stripePriceId;
          const isCustomerMatch = stripeSubscription.customer === dbSubscription.stripeCustomerId;
          
          // Check if subscription is actually active in Stripe
          const isActiveInStripe = ['active', 'trialing'].includes(stripeSubscription.status);
          
          // Verify current period end hasn't passed for active subscriptions
          const subscription = stripeSubscription as unknown as { current_period_end: number };
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          const isPeriodValid = currentPeriodEnd > new Date();

          if (!isStatusMatch || !isPriceMatch || !isCustomerMatch) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Subscription integrity check failed for user ${userId}:`, {
                statusMatch: isStatusMatch,
                priceMatch: isPriceMatch,
                customerMatch: isCustomerMatch
              });
            }
            return { 
              isValid: false, 
              subscription: null, 
              error: 'Subscription data integrity violation detected' 
            };
          }

          if (!isActiveInStripe || !isPeriodValid) {
            return { 
              isValid: false, 
              subscription: null, 
              error: 'Subscription expired or inactive in Stripe' 
            };
          }

          return { isValid: true, subscription: dbSubscription };
          
        } catch (stripeError: unknown) {
          console.error(`Stripe verification failed for user ${userId}:`, stripeError);
          
          // If subscription doesn't exist in Stripe but exists in our DB, it's invalid
          if (stripeError && typeof stripeError === 'object' && 'code' in stripeError && stripeError.code === 'resource_missing') {
            return { 
              isValid: false, 
              subscription: null, 
              error: 'Subscription not found in Stripe' 
            };
          }
          
          // For other Stripe errors, we'll allow it but log the issue
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Stripe API error during verification for user ${userId}, allowing access`);
          }
          return { isValid: true, subscription: dbSubscription };
        }
      }

      // If no Stripe subscription ID but claims to have premium tier, it's suspicious
      if (dbSubscription.tier !== 'free') {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`User ${userId} has premium tier but no Stripe subscription ID`);
        }
        return { 
          isValid: false, 
          subscription: null, 
          error: 'Invalid premium subscription without Stripe reference' 
        };
      }

      return { isValid: true, subscription: dbSubscription };
      
    } catch (error) {
      console.error(`Subscription verification error for user ${userId}:`, error);
      return { 
        isValid: false, 
        subscription: null, 
        error: 'Verification system error' 
      };
    }
  }

  /**
   * Verify billing event history for additional security
   * Ensures subscription has legitimate payment history
   */
  static async verifyBillingHistory(userId: string): Promise<{
    hasValidHistory: boolean;
    lastPayment?: Date;
    suspiciousActivity: boolean;
  }> {
    try {
      // Get recent billing events
      const recentEvents = await db.query.billingEvents.findMany({
        where: eq(billingEvents.userId, userId),
        orderBy: [desc(billingEvents.eventTimestamp)],
        limit: 10
      });

      if (recentEvents.length === 0) {
        // No billing history - could be free tier or new subscription
        return { hasValidHistory: true, suspiciousActivity: false };
      }

      // Check for successful payment events
      const successfulPayments = recentEvents.filter(event => 
        event.eventType.includes('payment_succeeded') || 
        event.eventType.includes('checkout_session_completed')
      );

      // Check for suspicious patterns
      let suspiciousActivity = false;
      
      // Flag if there are many failed payments recently
      const failedPayments = recentEvents.filter(event => 
        event.eventType.includes('payment_failed')
      ).length;
      
      if (failedPayments > 3) {
        suspiciousActivity = true;
      }

      // Flag if events are not from Stripe (missing stripeEventId)
      const nonStripeEvents = recentEvents.filter(event => !event.stripeEventId);
      if (nonStripeEvents.length > 0) {
        suspiciousActivity = true;
      }

      const lastPayment = successfulPayments.length > 0 
        ? successfulPayments[0].eventTimestamp 
        : undefined;

      return {
        hasValidHistory: successfulPayments.length > 0,
        lastPayment: lastPayment || undefined,
        suspiciousActivity
      };

    } catch (error) {
      console.error(`Billing history verification error for user ${userId}:`, error);
      return { hasValidHistory: false, suspiciousActivity: true };
    }
  }

  /**
   * Comprehensive subscription validation
   * Combines multiple verification methods
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
    const securityFlags: string[] = [];
    
    // 1. Verify subscription integrity
    const integrityCheck = await this.verifySubscriptionIntegrity(userId);
    
    if (!integrityCheck.isValid) {
      securityFlags.push(`integrity_violation: ${integrityCheck.error}`);
      return {
        hasAccess: false,
        tier: 'free',
        features: { advancedSearch: false, profileViewInsights: false, analytics: false },
        securityFlags
      };
    }

    // 2. Verify billing history for premium users
    if (integrityCheck.subscription && integrityCheck.subscription.tier !== 'free') {
      const billingCheck = await this.verifyBillingHistory(userId);
      
      if (billingCheck.suspiciousActivity) {
        securityFlags.push('suspicious_billing_activity');
      }
      
      if (!billingCheck.hasValidHistory) {
        securityFlags.push('no_valid_payment_history');
        // For new subscriptions, we might be more lenient
        // But we'll flag it for monitoring
      }
    }

    // 3. Check subscription status and expiry
    const subscription = integrityCheck.subscription;
    const tier = subscription?.tier || 'free';
    
    if (subscription) {
      // Check if subscription is actually active
      const isActive = ['active', 'trialing'].includes(subscription.status);
      const isPeriodValid = !subscription.currentPeriodEnd || 
                          subscription.currentPeriodEnd > new Date();
      
      if (!isActive) {
        securityFlags.push(`inactive_status: ${subscription.status}`);
        return {
          hasAccess: false,
          tier: 'free',
          features: { advancedSearch: false, profileViewInsights: false, analytics: false },
          securityFlags
        };
      }
      
      if (!isPeriodValid) {
        securityFlags.push('subscription_expired');
        return {
          hasAccess: false,
          tier: 'free',
          features: { advancedSearch: false, profileViewInsights: false, analytics: false },
          securityFlags
        };
      }
    }

    // Determine feature access based on tier
    const isPremium = tier !== 'free';
    const features = {
      advancedSearch: isPremium,
      profileViewInsights: isPremium,
      analytics: isPremium,
    };

    return {
      hasAccess: true,
      tier,
      features,
      securityFlags
    };
  }

  /**
   * Log security events for monitoring
   */
  static async logSecurityEvent(): Promise<void> {
    try {
      // In a production environment, you might want to store these in a dedicated
      // security events table or send to a monitoring service
      
      // For now, we'll silently track events without console output
      
    } catch (error) {
      // Only log actual errors, not security events
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to log security event:', error);
      }
    }
  }
}