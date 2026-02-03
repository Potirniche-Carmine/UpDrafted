"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Username validation
    if (username.length > 10) {
      setError("Username must be 10 characters or less");
      return;
    }

    if (!/^[a-zA-Z0-9]*$/.test(username)) {
      setError("Username can only contain letters and numbers");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name: username, // Use username as display name
        username,
        callbackURL: "/sign-in", // Redirect to sign-in after email verification
      });

      if (result.error) {
        setError(result.error.message || "Failed to create account");
        setLoading(false);
        return;
      }

      // Show success message - verification email has been sent
      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Show success state after signup
  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#01ae79]/10">
              <svg className="h-8 w-8 text-[#01ae79]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
            <p className="mt-2 text-muted-foreground">
              We've sent a verification link to <strong>{email}</strong>
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Didn't receive the email?</strong><br />
              Check your spam folder. The email should arrive within a few minutes.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              After verifying your email, you can sign in to your account.
            </p>
            <Link
              href="/sign-in"
              className="block w-full rounded-lg bg-primary px-4 py-3 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="mt-2 text-muted-foreground">
            Join UpDrafted to connect with athletes and coaches
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={10}
                pattern="[a-zA-Z0-9]*"
                className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="johndoe123"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Max 10 letters/numbers only
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
