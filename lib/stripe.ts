import 'server-only'

import Stripe from 'stripe'

// Initialize Stripe with fallback for build/test environments
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')