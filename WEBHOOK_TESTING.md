# Stripe Webhook Testing Guide

This guide will help you test your Stripe webhooks locally to ensure subscription updates work correctly in your database.

## Prerequisites

1. Stripe CLI installed
2. Local development server running
3. Environment variables configured

## Setup

### 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://github.com/stripe/stripe-cli/releases
```

### 2. Login to Stripe CLI

```bash
stripe login
```

### 3. Set up local webhook forwarding

```bash
# Forward events to your local webhook endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# You'll get a webhook signing secret like: whsec_1234...
# Copy this secret to your .env.local file
```

### 4. Update your .env.local

```bash
# Add the webhook secret from step 3
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Make sure you have these other variables
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Price IDs for testing
NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY=price_your_athlete_monthly_price
NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY=price_your_athlete_yearly_price
NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY=price_your_coach_monthly_price
NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY=price_your_coach_yearly_price
NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY=price_your_recruiter_monthly_price
NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY=price_your_recruiter_yearly_price
```

## Testing Scenarios

### 1. Test Manual Subscription Creation

Use the test script we created:

```typescript
// In scripts/test-subscription.ts
// 1. Replace USER_ID with your actual Clerk user ID
// 2. Run the script to create a test subscription
```

### 2. Test Real Stripe Checkout Flow

1. Start your development server: `npm run dev`
2. Start webhook forwarding: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Go to your pricing page: `http://localhost:3000/pricing`
4. Try to subscribe to a plan
5. Use Stripe test card numbers:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`

### 3. Test Webhook Events

You can trigger specific webhook events using Stripe CLI:

```bash
# Test successful subscription creation
stripe trigger customer.subscription.created

# Test subscription updated
stripe trigger customer.subscription.updated

# Test subscription deleted
stripe trigger customer.subscription.deleted

# Test successful payment
stripe trigger invoice.payment_succeeded

# Test failed payment
stripe trigger invoice.payment_failed
```

### 4. Test Subscription Updates

```bash
# Update a subscription (change price, cancel, etc.)
stripe subscriptions update sub_1234567890 --metadata userId=your_user_id

# Cancel a subscription
stripe subscriptions cancel sub_1234567890
```

## Monitoring and Debugging

### 1. Check Webhook Events

```bash
# View recent webhook events
stripe events list --limit 10

# View specific event details
stripe events retrieve evt_1234567890
```

### 2. Check Database

After webhook events, verify your database:

```sql
-- Check user subscriptions
SELECT * FROM user_subscriptions WHERE user_id = 'your_user_id';

-- Check billing events
SELECT * FROM billing_events WHERE user_id = 'your_user_id' ORDER BY created_at DESC;

-- Check usage tracking
SELECT * FROM user_usage_tracking WHERE user_id = 'your_user_id';
```

### 3. Application Logs

Monitor your application logs for webhook processing:

```bash
# In your Next.js app, webhook events will log to console
tail -f .next/trace
```

## Testing Double Subscription Prevention

1. Create a subscription through normal checkout flow
2. Try to create another subscription for the same user
3. Verify the API returns an error and prevents double subscription
4. Check that the UI shows "Current Plan" for the active subscription

## Troubleshooting

### Webhook Not Receiving Events

1. Check if Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Verify your webhook endpoint is accessible: `curl http://localhost:3000/api/webhooks/stripe`
3. Check webhook signing secret in .env.local

### Database Not Updating

1. Check webhook logs in your application
2. Verify database connection
3. Check if SubscriptionService methods are working properly
4. Ensure user exists in your users table

### Subscription Status Not Showing

1. Check API endpoint: `http://localhost:3000/api/subscription/status`
2. Verify user authentication (Clerk)
3. Check if subscription data exists in database

## Manual Testing Checklist

- [ ] Webhook endpoint receives events
- [ ] Subscription creation updates database
- [ ] Subscription updates sync with database
- [ ] Subscription cancellation updates status
- [ ] Double subscription attempts are blocked
- [ ] Current plan displays correctly in UI
- [ ] Pricing cards show correct status
- [ ] API returns proper subscription status

## Test Data Cleanup

After testing, clean up test data:

```sql
-- Remove test subscriptions
DELETE FROM user_subscriptions WHERE stripe_subscription_id LIKE 'sub_test%';

-- Remove test billing events
DELETE FROM billing_events WHERE stripe_event_id LIKE 'evt_test%';
```

Or use the test script:

```typescript
// In scripts/test-subscription.ts
removeTestSubscription()
```