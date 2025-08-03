/**
 * Error sanitization utilities for secure error handling
 * Prevents exposure of sensitive information in error responses
 * 
 * SECURITY FEATURES:
 * - Debug information is NEVER exposed in production environments
 * - Multiple layers of protection against accidental exposure:
 *   1. Explicit includeDebugInfo parameter must be true
 *   2. NODE_ENV must be 'development'
 *   3. NODE_ENV must NOT be 'production' (double-check)
 *   4. NODE_ENV must be set (assumes production if undefined)
 * - All error messages are sanitized to remove sensitive information
 * - Full error details are logged server-side for debugging
 * - Client responses contain only safe, generic error messages
 */

export interface SanitizedError {
  message: string;
  type: 'database' | 'validation' | 'permission' | 'network' | 'unknown';
  safeForClient: boolean;
}

/**
 * Safely determine if debug information should be included in error responses
 * This function implements multiple layers of protection against accidental exposure
 * 
 * SECURITY MEASURES:
 * 1. Early return if debug info is not explicitly requested
 * 2. If NODE_ENV is undefined, assume production (fail-safe)
 * 3. Explicit check for production environment (double-check)
 * 4. Only allow debug info in confirmed development environment
 * 
 * This prevents sensitive information leakage even if:
 * - NODE_ENV is misconfigured
 * - includeDebugInfo is accidentally set to true
 * - Environment variables are not properly set
 */
function shouldIncludeDebugInfo(includeDebugInfo: boolean): boolean {
  // Early return if debug info is not requested
  if (!includeDebugInfo) {
    return false;
  }
  
  const nodeEnv = process.env.NODE_ENV;
  
  // If NODE_ENV is not set, assume production for safety
  if (!nodeEnv) {
    console.warn('[SECURITY] NODE_ENV not set, assuming production environment for debug info safety');
    return false;
  }
  
  // Only allow debug info in development mode
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  
  // Additional safety check: if we detect production indicators, never include debug info
  if (isProduction) {
    return false;
  }
  
  // Only include debug info if we're confident we're in development
  return isDevelopment;
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