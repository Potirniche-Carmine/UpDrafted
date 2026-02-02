import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { stripe } from "@better-auth/stripe";
import { db } from "@/database/db";
import Stripe from "stripe";

// Initialize Stripe client
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
});

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),

    // Enable email/password authentication
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true in production if needed
    },

    // Extend the user model with role field
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false, // null = needs onboarding
                defaultValue: null,
                input: false, // Don't allow setting via signup
            },
        },
    },

    // Session configuration
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update session every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        },
    },

    // Stripe plugin for subscriptions
    plugins: [
        stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: true,
            subscription: {
                enabled: true,
                plans: [
                    { name: "free", priceId: "price_free" },
                    { name: "pro_athlete_monthly", priceId: process.env.STRIPE_ATHLETE_MONTHLY_PRICE_ID! },
                    { name: "pro_athlete_yearly", priceId: process.env.STRIPE_ATHLETE_YEARLY_PRICE_ID! },
                    { name: "pro_coach_monthly", priceId: process.env.STRIPE_COACH_MONTHLY_PRICE_ID! },
                    { name: "pro_coach_yearly", priceId: process.env.STRIPE_COACH_YEARLY_PRICE_ID! },
                    { name: "pro_recruiter_monthly", priceId: process.env.STRIPE_RECRUITER_MONTHLY_PRICE_ID! },
                    { name: "pro_recruiter_yearly", priceId: process.env.STRIPE_RECRUITER_YEARLY_PRICE_ID! },
                ],
            },
        }),
    ],

    // Trust proxy for production environments
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL!,
        "https://updrafted.us",
    ].filter(Boolean),
});

// Export types for use in other files
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
