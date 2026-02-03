import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { stripe } from "@better-auth/stripe";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/database/db";
import Stripe from "stripe";
import { Resend } from "resend";

// Initialize Stripe client
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
});

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY!);

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || "UpDrafted <onboarding@resend.dev>";

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    baseURL: process.env.BETTER_AUTH_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

    // Enable email/password authentication
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true, // Require email verification before login
        autoSignIn: false, // Disable auto sign-in to redirect to onboarding
        sendResetPassword: async ({ user, url }) => {
            await resend.emails.send({
                from: EMAIL_FROM,
                to: user.email,
                subject: "Reset Your Password - UpDrafted",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #01ae79;">Reset Your Password</h2>
                        <p>Hi ${user.name || 'there'},</p>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${url}" style="background-color: #01ae79; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="color: #666; word-break: break-all;">${url}</p>
                        <p>If you didn't request this, you can safely ignore this email.</p>
                        <p>Best regards,<br>The UpDrafted Team</p>
                    </div>
                `,
            });
        },
    },

    // Email verification configuration
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await resend.emails.send({
                from: EMAIL_FROM,
                to: user.email,
                subject: "Verify Your Email - UpDrafted",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #01ae79;">Welcome to UpDrafted!</h2>
                        <p>Hi ${user.name || 'there'},</p>
                        <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${url}" style="background-color: #01ae79; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="color: #666; word-break: break-all;">${url}</p>
                        <p>If you didn't create this account, you can safely ignore this email.</p>
                        <p>Best regards,<br>The UpDrafted Team</p>
                    </div>
                `,
            });
        },
    },

    // Magic Link
    magicLink: {
        enabled: true,
        sendOnSignUp: false,
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
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async ({ newEmail, url, user }) => {
                // Send email to new address for verification
                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: newEmail,
                    subject: "Verify Your New Email - UpDrafted",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #01ae79;">Verify Your New Email</h2>
                            <p>Hi ${user.name || 'there'},</p>
                            <p>We received a request to change your email address. Click the button below to verify your new email:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${url}" style="background-color: #01ae79; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify New Email</a>
                            </div>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="color: #666; word-break: break-all;">${url}</p>
                            <p>If you didn't request this change, please contact support immediately.</p>
                            <p>Best regards,<br>The UpDrafted Team</p>
                        </div>
                    `,
                });
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
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                const subject = type === "forget-password" 
                    ? "Password Reset Code - UpDrafted" 
                    : "Verification Code - UpDrafted";
                
                const title = type === "forget-password" 
                    ? "Reset Your Password" 
                    : "Verify Your Email";
                
                const message = type === "forget-password"
                    ? "Enter this code to reset your password:"
                    : "Enter this code to verify your email:";

                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: email,
                    subject,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #01ae79;">${title}</h2>
                            <p>${message}</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; display: inline-block;">
                                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #01ae79;">${otp}</span>
                                </div>
                            </div>
                            <p>This code will expire in 10 minutes.</p>
                            <p>If you didn't request this, you can safely ignore this email.</p>
                            <p>Best regards,<br>The UpDrafted Team</p>
                        </div>
                    `,
                });
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
