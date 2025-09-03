import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL-friendly slug from a full name
 * @param fullName - The full name to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateProfileSlug(fullName: string): string {
  return fullName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Generates a profile URL with slug and ID
 * @param fullName - The full name to convert to a slug
 * @param userId - The user ID
 * @returns A profile URL in the format /profile/[slug]/[id]
 */
export function generateProfileUrl(fullName: string, userId: string): string {
  const slug = generateProfileSlug(fullName);
  return `/profile/${slug}/${userId}`;
}

/**
 * Generates a profile URL with slug and ID for external sharing
 * @param fullName - The full name to convert to a slug
 * @param userId - The user ID
 * @param origin - The origin URL (e.g., window.location.origin)
 * @returns A full profile URL for external sharing
 */
export function generateExternalProfileUrl(fullName: string, userId: string, origin: string): string {
  const slug = generateProfileSlug(fullName);
  return `${origin}/profile/${slug}/${userId}`;
}
