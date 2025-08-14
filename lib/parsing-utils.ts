/**
 * This file contains utility functions for parsing and validating data.
 * These functions are designed to be secure and robust, suitable for handling user input.
 */

/**
 * Parses a height string (e.g., "6'2\"") into total inches.
 * 
 * This function is designed for server-side validation and client-side display.
 * It uses a safe regex to prevent ReDoS attacks.
 *
 * @param heightStr - The height string to parse.
 * @returns The height in total inches, or null if the format is invalid or out of a reasonable range.
 */
export function parseHeightToInches(heightStr: string | null | undefined): number | null {
  if (!heightStr || typeof heightStr !== 'string') return null;

  const trimmed = heightStr.trim();

  // Regex to match "feet'inches\"" or "feet'"
  // Ensures no leading/trailing characters and limits digit counts to prevent ReDoS.
  const heightMatch = trimmed.match(/^(\d{1,2})'(?:(\d{1,2})")?$/);
  if (!heightMatch) return null;

  const feet = parseInt(heightMatch[1], 10);
  const heightMatch = trimmed.match(/^(\d{1,2})'(\d{0,2})"?$/);
  if (!heightMatch) return null;

  const feet = parseInt(heightMatch[1], 10);
  const inches = heightMatch[2] && heightMatch[2].length > 0 ? parseInt(heightMatch[2], 10) : 0;

  // Validate reasonable ranges
  if (feet < 3 || feet > 8 || inches < 0 || inches > 11) return null;

  return feet * 12 + inches;
}

/**
 * Parses a weight string (e.g., "180 lbs") into pounds.
 * 
 * This function is designed for server-side validation and client-side display.
 * It uses a simplified, safe regex to prevent ReDoS attacks.
 *
 * @param weightStr - The weight string to parse.
 * @returns The weight in pounds, or null if the format is invalid or out of a reasonable range.
 */
export function parseWeightToPounds(weightStr: string | null | undefined): number | null {
  if (!weightStr || typeof weightStr !== 'string') return null;

  const trimmed = weightStr.trim();

  // Simplified regex: matches 1-3 digits, optionally followed by "lbs" or "pounds".
  // This is safe against ReDoS as it avoids complex quantifiers.
  const weightMatch = trimmed.match(/^(\d{1,3})(?:\s*(?:lbs?|pounds?))?$/i);
  if (!weightMatch) return null;

  const weight = parseInt(weightMatch[1], 10);

  // Validate reasonable ranges (e.g., 50 to 500 pounds)
  if (weight < 50 || weight > 500) return null;

  return weight;
}
