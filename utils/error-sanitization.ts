/**
 * Error sanitization utilities for secure error handling
 * Prevents exposure of sensitive information in error responses
 */

export interface SanitizedError {
  message: string;
  type: 'database' | 'validation' | 'permission' | 'network' | 'unknown';
  safeForClient: boolean;
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
  
  // Only include debug info in development or if explicitly requested
  if (includeDebugInfo && process.env.NODE_ENV === 'development') {
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
  
  // Return sanitized response for client
  return createClientErrorResponse(error, operation);
} 