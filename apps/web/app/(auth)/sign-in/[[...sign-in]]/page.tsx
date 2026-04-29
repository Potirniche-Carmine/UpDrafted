"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient, signIn } from "@/lib/auth-client";
import { isUserBanned, signOut, useUser } from "@/hooks/use-auth";
import {
  persistVerificationEmail,
  replaceUrlWithoutReload,
  sanitizeAuthSearchParams,
} from "@/lib/auth-flow";
import { getAccessPathForUser } from "@/lib/auth-routing";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";
import { MagicLinkDialog } from "@/components/magic-link-dialog";

const ALLOWED_SIGN_IN_PARAMS = ["verified", "reset", "error"] as const;

export default function SignInPage() {
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, user } = useUser();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

  useEffect(() => {
    const sanitizedQuery = sanitizeAuthSearchParams(searchParams, ALLOWED_SIGN_IN_PARAMS);
    replaceUrlWithoutReload("/sign-in", sanitizedQuery);

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
    if (verificationError === "verification-failed" || verificationError === "invalid_token") {
      setError("Email verification failed. The link may have expired. Please try signing up again.");
    } else if (verificationError === "magic-link-failed") {
      setError("Magic link verification failed. The link may have expired. Please request a new one.");
    }
  }, [searchParams]);

  // If a signed-in user lands here directly (proxy didn't catch them), bounce them
  // to the correct destination for their auth state.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (isUserBanned(user)) return;
    window.location.replace(getAccessPathForUser(user));
  }, [isLoaded, isSignedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email: emailOrUsername,
        password,
      });

      if (result.error) {
        // 403 means the email isn't verified yet — better-auth blocks the sign-in.
        if (result.error.status === 403) {
          persistVerificationEmail(emailOrUsername);
          window.location.replace("/verify-email");
          return;
        }
        setError(result.error.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      let destination = "/dashboard";

      try {
        const sessionResponse = await authClient.getSession({
          query: {
            disableCookieCache: true,
          },
        });

        if (isUserBanned(sessionResponse.data?.user)) {
          setError("Your account has been banned and cannot access UpDrafted.");
          setLoading(false);
          return;
        }

        destination = getAccessPathForUser(sessionResponse.data?.user);
      } catch {
        destination = "/dashboard";
      }

      // Hard-navigate so the new request carries the fresh session cookie and the
      // proxy sees consistent auth state on the next request.
      window.location.replace(destination);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (isLoaded && isSignedIn && isUserBanned(user)) {
    const expiresAt = user?.bannedUntil ? new Date(String(user.bannedUntil)) : null;
    const hasValidExpiry = expiresAt && !Number.isNaN(expiresAt.getTime());

    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-destructive/30 bg-card/90 p-8 text-center shadow-xl backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Account banned</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your UpDrafted account has been banned and cannot access the site.
          </p>
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-left text-sm">
            <p>
              <span className="font-medium">Expires: </span>
              {hasValidExpiry ? expiresAt.toLocaleString() : "Never"}
            </p>
            {user?.banReason ? (
              <p className="mt-2">
                <span className="font-medium">Reason: </span>
                {user.banReason}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="mt-5 w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (isLoaded && isSignedIn) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card/90 p-8 text-center shadow-xl backdrop-blur">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Redirecting you back in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your session is active, so we&apos;re sending you to the right place now.
          </p>
        </div>
      </div>
    );
  }

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
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="you@example.com"
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
