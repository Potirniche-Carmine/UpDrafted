function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function getEnvValue(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value && !value.includes("PLACEHOLDER")) {
    return value;
  }

  if (process.env.NODE_ENV === "production" && !isBuildPhase()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (!fallback) {
    throw new Error(`Missing required environment variable in development: ${name}`);
  }

  return fallback;
}

export const ADMIN_APP_URL =
  process.env.ADMIN_APP_URL && !process.env.ADMIN_APP_URL.includes("PLACEHOLDER")
    ? process.env.ADMIN_APP_URL
    : "http://localhost:3100";

export const MAIN_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("PLACEHOLDER")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";
