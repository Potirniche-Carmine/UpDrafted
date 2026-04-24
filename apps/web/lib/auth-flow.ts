"use client";

const VERIFY_EMAIL_STORAGE_KEY = "updrafted.verify-email";
const RESET_TOKEN_STORAGE_KEY = "updrafted.reset-token";

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

export function persistVerificationEmail(email: string) {
  const storage = getSessionStorage();
  const normalizedEmail = email.trim();

  if (!storage) {
    return;
  }

  if (!normalizedEmail) {
    storage.removeItem(VERIFY_EMAIL_STORAGE_KEY);
    return;
  }

  storage.setItem(VERIFY_EMAIL_STORAGE_KEY, normalizedEmail);
}

export function getPersistedVerificationEmail() {
  return getSessionStorage()?.getItem(VERIFY_EMAIL_STORAGE_KEY) ?? "";
}

export function clearPersistedVerificationEmail() {
  getSessionStorage()?.removeItem(VERIFY_EMAIL_STORAGE_KEY);
}

export function persistResetToken(token: string) {
  const storage = getSessionStorage();
  const normalizedToken = token.trim();

  if (!storage) {
    return;
  }

  if (!normalizedToken) {
    storage.removeItem(RESET_TOKEN_STORAGE_KEY);
    return;
  }

  storage.setItem(RESET_TOKEN_STORAGE_KEY, normalizedToken);
}

export function getPersistedResetToken() {
  return getSessionStorage()?.getItem(RESET_TOKEN_STORAGE_KEY) ?? "";
}

export function clearPersistedResetToken() {
  getSessionStorage()?.removeItem(RESET_TOKEN_STORAGE_KEY);
}

interface SearchParamsLike {
  getAll(name: string): string[];
}

export function sanitizeAuthSearchParams(
  searchParams: SearchParamsLike,
  allowedParams: readonly string[],
) {
  const sanitized = new URLSearchParams();

  allowedParams.forEach((key) => {
    const values = searchParams.getAll(key);

    values.forEach((value) => {
      sanitized.append(key, value);
    });
  });

  return sanitized.toString();
}

export function replaceUrlWithoutReload(pathname: string, queryString = "") {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (currentUrl !== nextUrl) {
    window.history.replaceState(window.history.state, "", nextUrl);
  }
}
