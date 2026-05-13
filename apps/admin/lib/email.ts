import { Resend } from "resend";
import { MAIN_APP_URL, getEnvValue } from "./env";

const resend = new Resend(getEnvValue("RESEND_API_KEY", "re_placeholder"));

const EMAIL_FROM = "UpDrafted <support@updrafted.us>";
const EMAIL_REPLY_TO = "support@updrafted.us";

type SendArgs = { to: string; subject: string; html: string };

async function send({ to, subject, html }: SendArgs): Promise<void> {
  // In dev with a placeholder key, Resend will throw — swallow so
  // local development doesn't fail the moderator action.
  try {
    await resend.emails.send({ from: EMAIL_FROM, replyTo: EMAIL_REPLY_TO, to, subject, html });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[admin] Resend failed (dev fallback):", error);
      return;
    }
    throw error;
  }
}

function shell(body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
      <div style="text-align:center; padding: 24px 0;">
        <h1 style="color:#01ae79; margin:0;">UpDrafted</h1>
      </div>
      ${body}
      <hr style="border:none; border-top:1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color:#64748b; font-size: 12px; text-align:center;">
        UpDrafted &middot; <a href="${MAIN_APP_URL}" style="color:#01ae79;">updrafted.us</a>
      </p>
    </div>
  `;
}

export async function sendVerificationApprovedEmail(args: {
  to: string;
  name: string;
}): Promise<void> {
  await send({
    to: args.to,
    subject: "Your UpDrafted profile has been verified",
    html: shell(`
      <h2 style="color:#01ae79;">You're verified! ✅</h2>
      <p>Hi ${args.name || "there"},</p>
      <p>Great news — our moderators have reviewed your profile and you're now verified on UpDrafted. The verification badge is live on your profile.</p>
      <div style="text-align:center; margin: 24px 0;">
        <a href="${MAIN_APP_URL}/dashboard" style="background:#01ae79; color:white; text-decoration:none; padding:12px 24px; border-radius:8px; display:inline-block;">Go to your dashboard</a>
      </div>
    `),
  });
}

export async function sendVerificationDeniedEmail(args: {
  to: string;
  name: string;
  reason: string;
}): Promise<void> {
  await send({
    to: args.to,
    subject: "Your verification request was not approved",
    html: shell(`
      <h2 style="color:#dc2626;">Verification not approved</h2>
      <p>Hi ${args.name || "there"},</p>
      <p>We weren't able to approve this verification request. The moderator provided the following reason:</p>
      <blockquote style="border-left: 4px solid #dc2626; padding: 8px 16px; background:#fef2f2; margin: 16px 0;">
        ${args.reason.replace(/\n/g, "<br/>")}
      </blockquote>
      <p>You may submit a new request with updated information at any time.</p>
    `),
  });
}

export async function sendReportBanEmail(args: {
  to: string;
  name: string;
  reason: string;
  bannedUntil: Date | null;
}): Promise<void> {
  const scope = args.bannedUntil
    ? `until ${args.bannedUntil.toLocaleString(undefined, { year: "numeric", month: "long", day: "numeric" })}`
    : "permanently";
  await send({
    to: args.to,
    subject: `Your UpDrafted account has been suspended ${scope}`,
    html: shell(`
      <h2 style="color:#dc2626;">Account suspended</h2>
      <p>Hi ${args.name || "there"},</p>
      <p>Your account has been suspended <strong>${scope}</strong> following a moderation review. The moderator provided the following reason:</p>
      <blockquote style="border-left: 4px solid #dc2626; padding: 8px 16px; background:#fef2f2; margin: 16px 0;">
        ${args.reason.replace(/\n/g, "<br/>")}
      </blockquote>
      <p>If you believe this was a mistake you can reply to this email and our team will take a second look.</p>
    `),
  });
}
