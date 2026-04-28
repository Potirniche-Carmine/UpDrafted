"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import {
  clearPersistedVerificationEmail,
  getPersistedVerificationEmail,
  persistVerificationEmail,
  replaceUrlWithoutReload,
} from "@/lib/auth-flow";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [emailInput, setEmailInput] = useState(
    searchParams.get("email") || getPersistedVerificationEmail() || "",
  );
  const [code, setCode] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(searchParams.get("sent") === "true" ? 60 : 0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const sessionEmail = session?.user?.email || "";
  const targetEmail = useMemo(() => sessionEmail || emailInput.trim(), [emailInput, sessionEmail]);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");

    if (emailFromQuery) {
      persistVerificationEmail(emailFromQuery);
    }

    replaceUrlWithoutReload("/verify-email");
  }, [searchParams]);

  useEffect(() => {
    if (sessionEmail) {
      setEmailInput(sessionEmail);
      persistVerificationEmail(sessionEmail);
    }
  }, [sessionEmail]);

  useEffect(() => {
    persistVerificationEmail(emailInput);
  }, [emailInput]);

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
      const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
        email: targetEmail,
        type: "email-verification",
      });

      if (resendError) {
        setError(resendError.message || "Could not resend verification code.");
        return;
      }

      setSuccessMessage("New verification code sent. Please check your inbox.");
      setCooldownSeconds(60);
    } catch {
      setError("Could not resend verification code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!targetEmail || code.trim().length < 6) return;

    setIsVerifying(true);
    setError("");
    setSuccessMessage("");

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email: targetEmail,
        otp: code.replace(/\D/g, ""),
      });

      if (verifyError) {
        setError(verifyError.message || "That code did not work. Please check it and try again.");
        return;
      }

      clearPersistedVerificationEmail();
      window.location.replace("/sign-in?verified=true");
    } catch {
      setError("Could not verify your email. Please try again.");
    } finally {
      setIsVerifying(false);
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
            Enter the 6-digit code we sent to your inbox.
          </p>
        </div>

        <form onSubmit={handleVerify} className="rounded-2xl border border-[#01ae79]/20 bg-white p-4 space-y-4 shadow-sm dark:bg-black dark:border-[#01ae79]/25">
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
          <div className="space-y-2">
            <label htmlFor="verification-code" className="block text-sm font-medium">
              Verification code
            </label>
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="block w-full rounded-lg border border-input bg-background px-4 py-3 text-center text-2xl font-bold tracking-[0.35em] text-foreground placeholder:tracking-normal placeholder:text-muted-foreground focus:border-[#01ae79] focus:outline-none focus:ring-2 focus:ring-[#01ae79]/20"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying || !targetEmail || code.trim().length < 6}
            className="w-full rounded-lg bg-[#01ae79] px-4 py-3 text-center font-medium text-white transition-colors hover:bg-[#018a60] disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Verify email"}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isSending || cooldownSeconds > 0 || !targetEmail}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-center font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {isSending
              ? "Resending..."
              : cooldownSeconds > 0
                ? `Resend code in ${cooldownSeconds}s`
                : "Resend code"}
          </button>
        </form>

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
            onClick={() => clearPersistedVerificationEmail()}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
