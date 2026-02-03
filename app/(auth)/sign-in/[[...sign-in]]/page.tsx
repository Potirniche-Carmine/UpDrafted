"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";
import { MagicLinkDialog } from "@/components/magic-link-dialog";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

  useEffect(() => {
    // Show success message if redirected from email verification
    if (searchParams.get("verified") === "true") {
      setSuccessMessage("Email verified successfully! You can now sign in.");
    }

    // Show success message if redirected from password reset
    if (searchParams.get("reset") === "success") {
      setSuccessMessage("Password reset successfully! You can now sign in with your new password.");
    }

    // Show error if email verification failed
    const verificationError = searchParams.get("error");
    if (verificationError === "verification-failed") {
      setError("Email verification failed. The link may have expired. Please try signing up again.");
    } else if (verificationError === "magic-link-failed") {
      setError("Magic link verification failed. The link may have expired. Please request a new one.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage(""); // Clear success message on submit
    setLoading(true);

    try {
      // Detect if input is email or username (simple check: contains @)
      const isEmail = emailOrUsername.includes("@");

      let result;
      if (isEmail) {
        result = await signIn.email({
          email: emailOrUsername,
          password,
        });
      } else {
        result = await signIn.username({
          username: emailOrUsername,
          password,
        });
      }

      if (result.error) {
        // Check if error is due to unverified email
        if (result.error.status === 403) {
          setError("Please verify your email address before signing in. Check your inbox for the verification link.");
        } else {
          setError(result.error.message || "Invalid credentials");
        }
        setLoading(false);
        return;
      }

      // Redirect to dashboard or onboarding
      router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };



  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your UpDrafted account
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {successMessage && (
            <div className="rounded-lg bg-green-100 p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="emailOrUsername" className="block text-sm font-medium">
                  Email or Username
                </label>
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  autoComplete="username email"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="you@example.com or username"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMagicLink(true)}
            disabled={loading}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            Sign in with Magic Link
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>

        <ForgotPasswordDialog
          open={showForgotPassword}
          onOpenChange={setShowForgotPassword}
          defaultEmail={emailOrUsername.includes("@") ? emailOrUsername : ""}
        />

        <MagicLinkDialog
          open={showMagicLink}
          onOpenChange={setShowMagicLink}
          defaultEmail={emailOrUsername.includes("@") ? emailOrUsername : ""}
        />
      </div>
    </div>
  );
}