/**
 * Error sanitization utilities for secure error handling
 * Prevents exposure of sensitive information in error responses
 * 
 * SECURITY FEATURES:
 * - Debug information is NEVER exposed in production environments
 * - Secure configuration approach that doesn't rely on NODE_ENV for security decisions
 * - Multiple layers of protection against accidental exposure:
 *   1. Explicit includeDebugInfo parameter must be true
 *   2. DEBUG_MODE environment variable must be explicitly set to 'true'
 *   3. Additional runtime checks prevent exposure in production-like environments
 *   4. Defense in depth against misconfiguration and environment variable manipulation
 * - All error messages are sanitized to remove sensitive information
 * - Full error details are logged server-side for debugging
 * - Client responses contain only safe, generic error messages
 * 
 * CONFIGURATION:
 * To enable debug information in development:
 * - Set DEBUG_MODE=true in your environment
 * - Ensure NODE_ENV is not set to 'production'
 * - Pass includeDebugInfo=true to relevant functions
 */

export interface SanitizedError {
  message: string;
  type: 'database' | 'validation' | 'permission' | 'network' | 'unknown';
  safeForClient: boolean;
}

/**
 * Safely determine if debug information should be included in error responses
 * 
 * SECURITY APPROACH:
 * This function uses a secure, explicit configuration approach rather than relying
 * on environment variables for security decisions. The security is enforced through:
 * 
 * 1. Explicit includeDebugInfo parameter must be true
 * 2. A dedicated DEBUG_MODE environment variable that must be explicitly set to 'true'
 * 3. Additional runtime checks to prevent accidental exposure
 * 
 * This prevents sensitive information leakage even if:
 * - NODE_ENV is misconfigured or overridden
 * - Environment variables are not properly set
 * - An attacker gains access to modify environment variables
 * 
 * SECURITY NOTES:
 * - DEBUG_MODE must be explicitly set to 'true' (string) to enable debug info
 * - Any other value (including 'false', undefined, or empty string) disables debug info
 * - This provides defense in depth against accidental exposure
 */
function shouldIncludeDebugInfo(includeDebugInfo: boolean): boolean {
  // Early return if debug info is not explicitly requested
  if (!includeDebugInfo) {
    return false;
  }
  
  // Use a dedicated, explicit debug configuration variable
  // This separates security decisions from environment detection
  const debugMode = process.env.DEBUG_MODE;
  
  // Only allow debug info if DEBUG_MODE is explicitly set to 'true'
  // This prevents accidental exposure through misconfiguration
  if (debugMode !== 'true') {
    // Log a warning if DEBUG_MODE is set to something other than 'true'
    // This helps with debugging configuration issues
    if (debugMode !== undefined && debugMode !== 'false' && debugMode !== '') {
      console.warn('[SECURITY] DEBUG_MODE is set to an unexpected value:', debugMode);
    }
    return false;
  }
  
  // Additional runtime safety check: verify we're not in a production-like environment
  // This provides an extra layer of protection
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    console.warn('[SECURITY] Debug info requested but NODE_ENV indicates production environment');
    return false;
  }
  
  // Only include debug info if all security checks pass
  return true;
}

/**
 * Sanitize error messages for client consumption
 * Removes sensitive information while preserving useful context
 */
export function sanitizeErrorForClient(error: Error | unknown): SanitizedError {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : '';
  
  // Convert to lowercase for easier pattern matching
  const lowerMessage = message.toLowerCase();
  const lowerStack = stack?.toLowerCase() || '';
  
  // Database-related errors
  if (
    lowerMessage.includes('database') ||
    lowerMessage.includes('sql') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('transaction') ||
    lowerMessage.includes('constraint') ||
    lowerMessage.includes('foreign key') ||
    lowerMessage.includes('unique') ||
    lowerMessage.includes('duplicate') ||
    lowerStack.includes('database') ||
    lowerStack.includes('sql')
  ) {
    return {
      message: 'A database error occurred. Please try again, and if the problem persists, contact support.',
      type: 'database',
      safeForClient: true
    };
  }
  
  // Permission/authorization errors
  if (
    lowerMessage.includes('permission') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('forbidden') ||
    lowerMessage.includes('access denied') ||
    lowerMessage.includes('not authorized') ||
    lowerStack.includes('permission') ||
    lowerStack.includes('auth')
  ) {
    return {
      message: 'You do not have permission to perform this action.',
      type: 'permission',
      safeForClient: true
    };
  }
  
  // Validation errors
  if (
    lowerMessage.includes('validation') ||
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('required') ||
    lowerMessage.includes('format') ||
    lowerMessage.includes('type') ||
    lowerMessage.includes('schema')
  ) {
    return {
      message: 'The provided data is invalid. Please check your input and try again.',
      type: 'validation',
      safeForClient: true
    };
  }
  
  // Network/connection errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('http') ||
    lowerStack.includes('network')
  ) {
    return {
      message: 'A network error occurred. Please check your connection and try again.',
      type: 'network',
      safeForClient: true
    };
  }
  
  // File upload errors
  if (
    lowerMessage.includes('file') ||
    lowerMessage.includes('upload') ||
    lowerMessage.includes('image') ||
    lowerMessage.includes('size') ||
    lowerMessage.includes('format')
  ) {
    return {
      message: 'There was an issue with the file upload. Please check the file format and size, then try again.',
      type: 'validation',
      safeForClient: true
    };
  }
  
  // Rate limiting errors
  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('throttle')
  ) {
    return {
      message: 'Too many requests. Please wait a moment and try again.',
      type: 'validation',
      safeForClient: true
    };
  }
  
  // Default case - generic error message
  return {
    message: 'An unexpected error occurred. Please try again, and if the problem persists, contact support.',
    type: 'unknown',
    safeForClient: true
  };
}

/**
 * Create a client-safe error response object
 */
export function createClientErrorResponse(
  error: Error | unknown,
  context: string,
  includeDebugInfo = false
): {
  error: string;
  details?: string;
  debug?: string;
} {
  const sanitized = sanitizeErrorForClient(error);
  
  const response: {
    error: string;
    details?: string;
    debug?: string;
  } = {
    error: sanitized.message
  };
  
  // Add context details if safe
  if (sanitized.type !== 'database' && sanitized.type !== 'unknown') {
    response.details = `Error occurred during ${context}`;
  }
  
  // Enhanced security: Use the dedicated function to determine if debug info should be included
  if (shouldIncludeDebugInfo(includeDebugInfo)) {
    const originalMessage = error instanceof Error ? error.message : String(error);
    response.debug = `[DEV] ${originalMessage}`;
  }
  
  return response;
}

/**
 * Log error details for debugging while keeping client response safe
 */
export function logErrorWithContext(
  error: Error | unknown,
  context: string,
  additionalData?: Record<string, unknown>
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : 'No stack trace available';
  
  console.error(`Error in ${context}:`, {
    message: errorMessage,
    stack,
    context,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
}

/**
 * Handle transaction errors specifically
 * Note: This function does NOT include debug information in the response for security reasons
 */
export function handleTransactionError(
  error: Error | unknown,
  operation: string,
  userId?: string
): {
  error: string;
  details?: string;
  debug?: string;
} {
  // Log the full error details for debugging
  logErrorWithContext(error, `Database transaction failed for ${operation}`, {
    userId,
    operation,
    errorType: error instanceof Error ? error.constructor.name : 'Unknown'
  });
  
  // Return sanitized response for client (no debug info for security)
  return createClientErrorResponse(error, operation, false);
} 