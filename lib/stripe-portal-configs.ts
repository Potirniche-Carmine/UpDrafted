import 'server-only'
import { stripe } from './stripe'
import { Roles } from '@/types/globals'

export interface PortalConfigCache {
  athlete: string | null;
  coach: string | null;
  recruiter: string | null;
}

// Cache for portal configuration IDs
let portalConfigCache: PortalConfigCache = {
  athlete: null,
  coach: null,
  recruiter: null
}

/**
 * Get or create a portal configuration for a specific role
 * Each role has different subscription update restrictions
 */
export async function getPortalConfigForRole(role: Roles): Promise<string> {
  // Admin users don't have their own subscriptions, handle separately if needed
  if (role === 'admin') {
    throw new Error('Admin users cannot access customer portal')
  }

  // Check cache first
  if (portalConfigCache[role]) {
    return portalConfigCache[role]!
  }

  // Create new configuration for this role
  const config = await createPortalConfig(role)
  portalConfigCache[role] = config.id
  
  return config.id
}

/**
 * Create a Stripe portal configuration for a specific role
 */
async function createPortalConfig(role: 'athlete' | 'coach' | 'recruiter') {
  return await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: `Manage your ${role} subscription`,
      privacy_policy_url: `${process.env.NEXT_PUBLIC_APP_URL}/privacy-policy`,
      terms_of_service_url: `${process.env.NEXT_PUBLIC_APP_URL}/terms-of-service`,
    },
    default_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ['name', 'address'],
      },
      invoice_history: {
        enabled: true,
      },
      payment_method_update: {
        enabled: true,
      },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: [
            'too_expensive',
            'missing_features', 
            'switched_service',
            'unused',
            'other'
          ],
        },
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price'],
        products: getProductsForRole(role),
        proration_behavior: 'create_prorations',
      },
    },
    name: `${role.charAt(0).toUpperCase() + role.slice(1)} Portal Configuration`,
  })
}

/**
 * Get the allowed products and price IDs for each role
 * This restricts users to only upgrade/downgrade within their role type
 */
function getProductsForRole(role: 'athlete' | 'coach' | 'recruiter') {
  const roleMapping = {
    athlete: {
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY,
      yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY,
      productId: process.env.STRIPE_PRODUCT_ATHLETE_ID,
    },
    coach: {
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY,
      yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY,
      productId: process.env.STRIPE_PRODUCT_COACH_ID,
    },
    recruiter: {
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY,
      yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY,
      productId: process.env.STRIPE_PRODUCT_RECRUITER_ID,
    },
  }

  const roleConfig = roleMapping[role]
  
  if (!roleConfig.productId || !roleConfig.monthlyPriceId || !roleConfig.yearlyPriceId) {
    return []
  }

  return [
    {
      product: roleConfig.productId,
      prices: [roleConfig.monthlyPriceId, roleConfig.yearlyPriceId],
    },
  ]
}

/**
 * Clear the portal config cache (useful for development/testing)
 */
export function clearPortalConfigCache() {
  portalConfigCache = {
    athlete: null,
    coach: null,
    recruiter: null
  }
}

/**
 * Create a portal session for a user
 */
export async function createPortalSession(
  customerId: string,
  role: Roles,
  returnUrl?: string
) {
  const configurationId = await getPortalConfigForRole(role)
  
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    configuration: configurationId,
    return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
}