import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SubscriptionService } from '@/lib/subscription-service';
import { SubscriptionSecurityService } from '@/lib/subscription-security';
import { withRateLimit, createErrorResponse, createSuccessResponse } from '@/utils/security';

/**
 * GET /api/subscription/features
 * Returns the current user's subscription features and access levels
 * Includes comprehensive security validation to prevent spoofing
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting with stricter limits for subscription endpoints
    const rateLimitCheck = await withRateLimit(request, 'general', undefined, 'athlete');
    if (!rateLimitCheck.success) {
      return rateLimitCheck.response!;
    }

    // Authentication
    const { userId } = await auth();
    if (!userId) {
      await SubscriptionSecurityService.logSecurityEvent();
      return createErrorResponse('Authentication required', 401);
    }

    // Comprehensive subscription validation with security checks
    const validationResult = await SubscriptionSecurityService.validateSubscriptionAccess(userId);
    
    // Log security events if there are any flags
    if (validationResult.securityFlags.length > 0) {
      await SubscriptionSecurityService.logSecurityEvent();
      
      // If security flags indicate serious violations, deny access
      const seriousViolations = validationResult.securityFlags.filter(flag => 
        flag.includes('integrity_violation') || 
        flag.includes('no_valid_payment_history') ||
        flag.includes('inactive_status')
      );
      
      if (seriousViolations.length > 0) {
        return createErrorResponse(
          'Subscription verification failed', 
          403,
          { 'X-Security-Flags': validationResult.securityFlags.join(',') }
        );
      }
    }

    // Get additional subscription details for the response
    const subscription = await SubscriptionService.getUserSubscription(userId);
    const limits = await SubscriptionService.getFeatureLimits(validationResult.tier as 'free' | 'pro_athlete_monthly' | 'pro_athlete_yearly' | 'pro_coach_monthly' | 'pro_coach_yearly' | 'pro_recruiter_monthly' | 'pro_recruiter_yearly');

    // Prepare response data
    const responseData = {
      subscription: {
        tier: validationResult.tier,
        status: subscription?.status || 'active',
        currentPeriodEnd: subscription?.currentPeriodEnd || null,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
        verified: validationResult.hasAccess, // Indicates if subscription passed security checks
      },
      features: validationResult.features,
      limits: limits ? {
        maxConnectionsPerMonth: limits.maxConnectionsPerMonth,
        advancedSearchEnabled: limits.advancedSearchEnabled,
        profileViewInsights: limits.profileViewInsights,
        analyticsEnabled: limits.analyticsEnabled,
      } : {
        maxConnectionsPerMonth: 5,
        advancedSearchEnabled: false,
        profileViewInsights: false,
        analyticsEnabled: false,
      },
      // Include security info for debugging (remove in production)
      security: process.env.NODE_ENV === 'development' ? {
        flags: validationResult.securityFlags,
        hasAccess: validationResult.hasAccess
      } : undefined
    };

    // Log successful access
    await SubscriptionSecurityService.logSecurityEvent();

    return createSuccessResponse(responseData, rateLimitCheck.headers);

  } catch (error) {
    console.error('Error fetching subscription features:', error);
    
    // Log the error as a security event
    if (error) {
      await SubscriptionSecurityService.logSecurityEvent();
    }
    
    return createErrorResponse(
      'Failed to fetch subscription features', 
      500
    );
  }
}