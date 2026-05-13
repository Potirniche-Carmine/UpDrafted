import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@updrafted/db";
import { Resend } from "resend";
import { ADMIN_APP_URL, getEnvValue } from "./env";

const resend = new Resend(getEnvValue("RESEND_API_KEY", "re_placeholder"));

const EMAIL_FROM = "UpDrafted Admin <support@updrafted.us>";
const EMAIL_REPLY_TO = "support@updrafted.us";

/**
 * Admin-dashboard better-auth instance.
 *
 * This intentionally does NOT expose any signup or role-mutation surface:
 * admin role assignment is a deliberate database-only operation.
 * Users authenticate here with the same credentials as the main app
 * (shared `user`, `session`, `account` tables).
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL: ADMIN_APP_URL,
  secret: getEnvValue("BETTER_AUTH_SECRET", "better_auth_secret_placeholder_for_build"),

  emailAndPassword: {
    enabled: true,
    // Sign-up is strictly disallowed from the admin dashboard; the admin role
    // is only ever granted by a direct DB update.
    disableSignUp: true,
    // No self-service password reset from admin dashboard — use main site.
    requireEmailVerification: true,
    autoSignIn: false,
  },

  // Expose the role field read-only so guards can inspect it.
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      banned: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: EMAIL_FROM,
        replyTo: EMAIL_REPLY_TO,
        to: user.email,
        subject: "Verify your admin login - UpDrafted",
        html: `<p>Click <a href="${url}">here</a> to verify your email for the UpDrafted admin dashboard.</p>`,
      });
    },
  },

  session: {
    expiresIn: 60 * 60 * 8, // 8 hours — shorter than main app for safety.
    updateAge: 60 * 30,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  trustedOrigins: [ADMIN_APP_URL].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
