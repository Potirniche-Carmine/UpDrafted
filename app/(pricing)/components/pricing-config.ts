// Stripe pricing configuration
// Price IDs are loaded from environment variables for security

// Simple direct access to environment variables for better reliability
const STRIPE_PRICE_IDS = {
  ATHLETE_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY || 'price_athlete_monthly_placeholder',
  ATHLETE_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY || 'price_athlete_yearly_placeholder',
  COACH_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY || 'price_coach_monthly_placeholder',
  COACH_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY || 'price_coach_yearly_placeholder',
  RECRUITER_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY || 'price_recruiter_monthly_placeholder',
  RECRUITER_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY || 'price_recruiter_yearly_placeholder',
};

// Debug logging for missing price IDs in development
if (process.env.NODE_ENV === 'development') {
  const missingPriceIds = Object.entries(STRIPE_PRICE_IDS)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  
  if (missingPriceIds.length > 0) {
    console.warn('Missing Stripe price IDs:', missingPriceIds);
  }
}

// Validation function to check if price ID is configured
function validatePriceId(priceId: string, planName: string): string {
  if (!priceId) {
    console.error(`Missing price ID for plan: ${planName}. Check environment variables.`);
    return 'MISSING_PRICE_ID'; // Return a clear indicator instead of empty string
  }
  return priceId;
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  priceId: string // Stripe Price ID from environment variables
  price: {
    monthly: number
    yearly?: number
  }
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
  role: 'athlete' | 'coach' | 'recruiter' | 'all'
  isFree?: boolean
}

export const pricingPlans: PricingPlan[] = [
  // Free tier - available to all roles
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic recruiting features',
    priceId: '', // No Stripe price ID for free tier
    price: {
      monthly: 0
    },
    interval: 'month',
    features: [
      '5 Connection Requests Per Month',
      '1 Embedded YouTube Video',
      'Basic Profile Creation',
      'Basic Search Functionality',
      'Standard Support'
    ],
    role: 'all',
    isFree: true
  },
  
    // Pro Athlete plans
  {
    id: 'pro-athlete-monthly',
    name: 'Pro Athlete',
    description: 'Get serious about recruiting - connect with more coaches and stand out',
    priceId: validatePriceId(STRIPE_PRICE_IDS.ATHLETE_MONTHLY, 'Pro Athlete Monthly'),
    price: {
      monthly: 15
    },
    interval: 'month',
    features: [
      '25 Connection Requests Per Month',
      'Embed Up to 3 YouTube Highlight Videos',
      'Advanced Search Filters to Find Your Perfect Coach',
      'Read Receipts - Know When Coaches See Your Messages',
      'See Who Has Viewed Your Profile',
      'Priority Profile Ranking - Higher Chance to Be Seen'
    ],
    popular: true,
    role: 'athlete'
  },
  {
    id: 'pro-athlete-yearly',
    name: 'Pro Athlete',
    description: 'Get serious about recruiting - connect with more coaches and stand out. Save $36/year!',
    priceId: validatePriceId(STRIPE_PRICE_IDS.ATHLETE_YEARLY, 'Pro Athlete Yearly'),
    price: {
      monthly: 15,
      yearly: 144 // $12/month * 12 = $144/year (save $36)
    },
    interval: 'year',
    features: [
      '25 Connection Requests Per Month',
      'Embed Up to 3 YouTube Highlight Videos',
      'Advanced Search Filters to Find Your Perfect Coach',
      'Read Receipts - Know When Coaches See Your Messages',
      'See Who Has Viewed Your Profile',
      'Priority Profile Ranking - Higher Chance to Be Seen',
      'Save $36 per year'
    ],
    role: 'athlete'
  },
  
  // Pro Coach plans
  {
    id: 'pro-coach-monthly',
    name: 'Pro Coach',
    description: 'Serious about recruiting? Get unlimited athlete connections and advanced tools',
    priceId: validatePriceId(STRIPE_PRICE_IDS.COACH_MONTHLY, 'Pro Coach Monthly'),
    price: {
      monthly: 150
    },
    interval: 'month',
    features: [
      'Unlimited Connection Requests to Athletes',
      'Embed Up to 3 YouTube Program Videos',
      'Advanced Search Filters to Find Perfect Athletes',
      'Read Receipts - Know When Athletes See Your Messages',
      'See Who Has Viewed Your Profile',
      'Advanced Analytics Dashboard',
      'Priority Profile Ranking - Higher Chance to Be Seen'
    ],
    popular: true,
    role: 'coach'
  },
  {
    id: 'pro-coach-yearly',
    name: 'Pro Coach',
    description: 'Serious about recruiting? Get unlimited athlete connections and advanced tools. Save $300/year!',
    priceId: validatePriceId(STRIPE_PRICE_IDS.COACH_YEARLY, 'Pro Coach Yearly'),
    price: {
      monthly: 150,
      yearly: 1500 // Save $300/year ($125/month equivalent)
    },
    interval: 'year',
    features: [
      'Unlimited Connection Requests to Athletes',
      'Embed Up to 3 YouTube Program Videos',
      'Advanced Search Filters to Find Perfect Athletes',
      'Read Receipts - Know When Athletes See Your Messages',
      'See Who Has Viewed Your Profile',
      'Advanced Analytics Dashboard',
      'Priority Profile Ranking - Higher Chance to Be Seen',
      'Save $300 per year'
    ],
    role: 'coach'
  },
  
  // Pro Recruiter plans
  {
    id: 'pro-recruiter-monthly',
    name: 'Pro Recruiter',
    description: 'Serious about talent acquisition? Get unlimited athlete connections and professional tools',
    priceId: validatePriceId(STRIPE_PRICE_IDS.RECRUITER_MONTHLY, 'Pro Recruiter Monthly'),
    price: {
      monthly: 150
    },
    interval: 'month',
    features: [
      'Unlimited Connection Requests to Athletes',
      'Embed Up to 3 YouTube Program Videos',
      'Advanced Search & Filtering for Talent Discovery',
      'Read Receipts - Know When Athletes See Your Messages',
      'See Who Has Viewed Your Profile',
      'Advanced Analytics & Reporting Dashboard',
      'Priority Profile Ranking - Higher Chance to Be Seen'
    ],
    popular: true,
    role: 'recruiter'
  },
  {
    id: 'pro-recruiter-yearly',
    name: 'Pro Recruiter',
    description: 'Serious about talent acquisition? Get unlimited athlete connections and professional tools. Save $300/year!',
    priceId: validatePriceId(STRIPE_PRICE_IDS.RECRUITER_YEARLY, 'Pro Recruiter Yearly'),
    price: {
      monthly: 150,
      yearly: 1500 // Save $300/year ($125/month equivalent)
    },
    interval: 'year',
    features: [
      'Unlimited Connection Requests to Athletes',
      'Embed Up to 3 YouTube Program Videos',
      'Advanced Search & Filtering for Talent Discovery',
      'Read Receipts - Know When Athletes See Your Messages',
      'See Who Has Viewed Your Profile',
      'Advanced Analytics & Reporting Dashboard',
      'Priority Profile Ranking - Higher Chance to Be Seen',
      'Save $300 per year'
    ],
    role: 'recruiter'
  }
]

// Helper function to get plan by ID
export function getPlanById(planId: string): PricingPlan | undefined {
  return pricingPlans.find(plan => plan.id === planId)
}

// Helper function to get plans by role (includes free tier + role-specific plans)
export function getPlansByRole(role: 'athlete' | 'coach' | 'recruiter'): PricingPlan[] {
  return pricingPlans.filter(plan => plan.role === role || plan.role === 'all')
}

// Helper function to get all role-specific plans (excluding free)
export function getRoleSpecificPlans(role: 'athlete' | 'coach' | 'recruiter'): PricingPlan[] {
  return pricingPlans.filter(plan => plan.role === role)
}

// Helper function to format price
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

// Helper function to calculate yearly savings
export function getYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  return (monthlyPrice * 12) - yearlyPrice
}