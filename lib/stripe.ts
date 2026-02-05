import 'server-only'

import Stripe from 'stripe'

const isBuild = process.env.SKIP_ENV_VALIDATION === 'true';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || (isBuild ? 'sk_test_placeholder' : ''))