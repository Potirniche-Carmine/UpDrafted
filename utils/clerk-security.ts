/**
 * Creates secure headers for client-side requests to your API
 * @param token - The Clerk session token
 * @returns Headers object with required security headers
 * 
 * This utility is used by React components for API calls to ensure
 * proper authentication and security headers are included.
 */
export function createSecureHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'X-Requested-With': 'XMLHttpRequest'
  }
} 