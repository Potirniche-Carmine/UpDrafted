"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [emailInput, setEmailInput] = useState(searchParams.get("email") || "");
  const [cooldownSeconds, setCooldownSeconds] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const sessionEmail = session?.user?.email || "";
  const targetEmail = useMemo(() => sessionEmail || emailInput.trim(), [emailInput, sessionEmail]);

  useEffect(() => {
    if (sessionEmail) {
      setEmailInput(sessionEmail);
    }
  }, [sessionEmail]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCooldownSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleResend = async () => {
    if (!targetEmail || cooldownSeconds > 0) return;

    setIsSending(true);
    setError("");
    setSuccessMessage("");

    try {
      const { error: resendError } = await authClient.sendVerificationEmail({
        email: targetEmail,
        callbackURL: "/sign-in?verified=true",
      });

      if (resendError) {
        setError(resendError.message || "Could not resend verification email.");
        return;
      }

      setSuccessMessage("Verification email sent. Please check your inbox.");
      setCooldownSeconds(60);
    } catch {
      setError("Could not resend verification email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#01ae79]/10">
            <svg className="h-8 w-8 text-[#01ae79]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Verify your email</h1>
          <p className="mt-2 text-muted-foreground">
            Open the verification link from any device, then sign in.
          </p>
        </div>

        <div className="rounded-lg border border-input bg-muted/40 p-4 space-y-3">
          <label htmlFor="verification-email" className="block text-sm font-medium">
            Email address
          </label>
          <input
            id="verification-email"
            type="email"
            autoComplete="email"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            placeholder="you@example.com"
            className="block w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={handleResend}
            disabled={isSending || cooldownSeconds > 0 || !targetEmail}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-center font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {isSending
              ? "Resending..."
              : cooldownSeconds > 0
                ? `Resend verification email in ${cooldownSeconds}s`
                : "Resend verification email"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="rounded-lg bg-green-100 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/sign-in"
            className="block w-full rounded-lg bg-primary px-4 py-3 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Sign In
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            Need a different account?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Create a new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
