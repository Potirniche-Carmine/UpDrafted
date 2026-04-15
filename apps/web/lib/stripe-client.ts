import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe.js with your publishable key
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// Helper function to format Stripe amounts (cents to dollars)
export function formatStripeAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100)
}

// Helper function to convert dollars to Stripe cents
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}