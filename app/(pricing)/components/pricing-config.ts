// Stripe pricing configuration
// Replace these with your actual Stripe Price IDs from your dashboard

export interface PricingPlan {
  id: string
  name: string
  description: string
  priceId: string // Stripe Price ID
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
    priceId: 'price_athlete_monthly_example', // Replace with your actual Price ID
    price: {
      monthly: 15
    },
    interval: 'month',
    features: [
      '25 Connection Requests Per Month',
      'Advanced Search Filters to Find Your Perfect Coach',
      'Read Receipts - Know When Coaches See Your Messages',
      'See Who Has Viewed Your Profile',
      'Priority in Coach Search Results'
    ],
    popular: true,
    role: 'athlete'
  },
  {
    id: 'pro-athlete-yearly',
    name: 'Pro Athlete',
    description: 'Get serious about recruiting - connect with more coaches and stand out. Save $36/year!',
    priceId: 'price_athlete_yearly_example', // Replace with your actual Price ID
    price: {
      monthly: 15,
      yearly: 144 // $12/month * 12 = $144/year (save $36)
    },
    interval: 'year',
    features: [
      '25 Connection Requests Per Month',
      'Advanced Search Filters to Find Your Perfect Coach',
      'Read Receipts - Know When Coaches See Your Messages',
      'See Who Has Viewed Your Profile',
      'Priority in Coach Search Results',
      'Save $36 per year'
    ],
    role: 'athlete'
  },
  
  // Pro Coach plans
  {
    id: 'pro-coach-monthly',
    name: 'Pro Coach',
    description: 'Serious about recruiting? Get unlimited athlete connections and advanced tools',
    priceId: 'price_coach_monthly_example', // Replace with your actual Price ID
    price: {
      monthly: 150
    },
    interval: 'month',
    features: [
      'Unlimited Connection Requests to Athletes',
      'Advanced Search Filters to Find Perfect Athletes',
      'Read Receipts - Know When Athletes See Your Messages',
      'See Who Has Viewed Your Profile',
      'Priority Support for Recruiting Questions',
      'Advanced Analytics Dashboard'
    ],
    popular: true,
    role: 'coach'
  },
  {
    id: 'pro-coach-yearly',
    name: 'Pro Coach',
    description: 'Serious about recruiting? Get unlimited athlete connections and advanced tools. Save $300/year!',
    priceId: 'price_coach_yearly_example', // Replace with your actual Price ID
    price: {
      monthly: 150,
      yearly: 1500 // Save $300/year ($125/month equivalent)
    },
    interval: 'year',
    features: [
      'Unlimited Connection Requests to Athletes',
      'Advanced Search Filters to Find Perfect Athletes',
      'Read Receipts - Know When Athletes See Your Messages',
      'See Who Has Viewed Your Profile',
      'Priority Support for Recruiting Questions',
      'Advanced Analytics Dashboard',
      'Save $300 per year'
    ],
    role: 'coach'
  },
  
  // Pro Recruiter plans
  {
    id: 'pro-recruiter-monthly',
    name: 'Pro Recruiter',
    description: 'Serious about talent acquisition? Get unlimited athlete connections and professional tools',
    priceId: 'price_recruiter_monthly_example', // Replace with your actual Price ID
    price: {
      monthly: 150
    },
    interval: 'month',
    features: [
      'Unlimited Connection Requests to Athletes',
      'Advanced Search & Filtering for Talent Discovery',
      'Read Receipts - Know When Athletes See Your Messages',
      'See Who Has Viewed Your Profile',
      'Priority Support for Recruiting Questions',
      'Advanced Analytics & Reporting Dashboard'
    ],
    popular: true,
    role: 'recruiter'
  },
  {
    id: 'pro-recruiter-yearly',
    name: 'Pro Recruiter',
    description: 'Serious about talent acquisition? Get unlimited athlete connections and professional tools. Save $300/year!',
    priceId: 'price_recruiter_yearly_example', // Replace with your actual Price ID
    price: {
      monthly: 150,
      yearly: 1500 // Save $300/year ($125/month equivalent)
    },
    interval: 'year',
    features: [
      'Unlimited Connection Requests to Athletes',
      'Advanced Search & Filtering for Talent Discovery',
      'Read Receipts - Know When Athletes See Your Messages',
      'See Who Has Viewed Your Profile',
      'Priority Support for Recruiting Questions',
      'Advanced Analytics & Reporting Dashboard',
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