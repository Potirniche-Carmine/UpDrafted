import 'server-only'

import Stripe from 'stripe'

function isNextBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY
  if (key) return key

  if (process.env.NODE_ENV === 'production' && !isNextBuildPhase()) {
    throw new Error('Missing STRIPE_SECRET_KEY in production environment')
  }

  return 'sk_test_placeholder'
}

export const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: '2026-02-25.clover',
})