import { NextRequest } from 'next/server';

// Security event types
export type SecurityEventType = 
  | 'rate_limit_exceeded'
  | 'invalid_token'
  | 'csrf_attempt'
  | 'unauthorized_access'
  | 'file_upload_blocked'
  | 'request_too_large'
  | 'suspicious_activity'
  | 'validation_failed'
  | 'origin_mismatch';

// Security event details interface
export interface SecurityEventDetails {
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

// Security event log entry
interface SecurityLogEntry {
  timestamp: string;
  event: SecurityEventType;
  level: 'info' | 'warning' | 'error' | 'critical';
  details: SecurityEventDetails;
  requestId?: string;
}

// Extract client information from request
function extractClientInfo(request: NextRequest): Pick<SecurityEventDetails, 'ip' | 'userAgent'> {
  return {
    ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 
        request.headers.get('x-real-ip') || 
        'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

// Log security event
export function logSecurityEvent(
  event: SecurityEventType,
  details: SecurityEventDetails,
  level: SecurityLogEntry['level'] = 'warning'
): void {
  const logEntry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    level,
    details,
    requestId: generateRequestId(),
  };

  // In production, you might want to send this to a logging service
  // For now, we'll use console with structured logging
  const logMessage = JSON.stringify(logEntry, null, 2);
  
  switch (level) {
    case 'critical':
    case 'error':
      console.error(`🚨 SECURITY EVENT: ${event}`, logMessage);
      break;
    case 'warning':
      console.warn(`⚠️  SECURITY EVENT: ${event}`, logMessage);
      break;
    case 'info':
      console.info(`ℹ️  SECURITY EVENT: ${event}`, logMessage);
      break;
  }

  // In production, you could also:
  // - Send to external monitoring service (DataDog, New Relic, etc.)
  // - Store in database for analysis
  // - Trigger alerts for critical events
  // - Send to SIEM system
}

// Log security event with request context
export function logSecurityEventWithRequest(
  event: SecurityEventType,
  request: NextRequest,
  additionalDetails: Partial<SecurityEventDetails> = {},
  level: SecurityLogEntry['level'] = 'warning'
): void {
  const clientInfo = extractClientInfo(request);
  
  const details: SecurityEventDetails = {
    ...clientInfo,
    endpoint: request.nextUrl.pathname,
    method: request.method,
    ...additionalDetails,
  };

  logSecurityEvent(event, details, level);
}

// Generate a simple request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper functions for common security events
export const SecurityEvents = {
  rateLimitExceeded: (request: NextRequest, userId?: string, limit?: number) => {
    logSecurityEventWithRequest('rate_limit_exceeded', request, {
      userId,
      reason: `Rate limit exceeded: ${limit} requests`,
    }, 'warning');
  },

  invalidToken: (request: NextRequest, reason: string) => {
    logSecurityEventWithRequest('invalid_token', request, {
      reason,
    }, 'error');
  },

  csrfAttempt: (request: NextRequest, origin?: string, host?: string) => {
    logSecurityEventWithRequest('csrf_attempt', request, {
      reason: 'CSRF protection triggered',
      metadata: { origin, host },
    }, 'error');
  },

  unauthorizedAccess: (request: NextRequest, userId?: string, requiredRole?: string) => {
    logSecurityEventWithRequest('unauthorized_access', request, {
      userId,
      reason: `Access denied - required role: ${requiredRole}`,
    }, 'warning');
  },

  fileUploadBlocked: (request: NextRequest, reason: string, userId?: string) => {
    logSecurityEventWithRequest('file_upload_blocked', request, {
      userId,
      reason,
    }, 'warning');
  },

  requestTooLarge: (request: NextRequest, size: number, limit: number) => {
    logSecurityEventWithRequest('request_too_large', request, {
      reason: `Request size ${size} bytes exceeds limit ${limit} bytes`,
    }, 'warning');
  },

  validationFailed: (request: NextRequest, field: string, error: string) => {
    logSecurityEventWithRequest('validation_failed', request, {
      reason: `Validation failed for ${field}: ${error}`,
    }, 'info');
  },

  suspiciousActivity: (request: NextRequest, description: string, metadata: Record<string, unknown> = {}) => {
    logSecurityEventWithRequest('suspicious_activity', request, {
      reason: description,
      metadata,
    }, 'error');
  },
};

// Security metrics tracking (in-memory for demo, use Redis/database in production)
class SecurityMetrics {
  private static instance: SecurityMetrics;
  private events = new Map<string, number>();
  private resetTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): SecurityMetrics {
    if (!SecurityMetrics.instance) {
      SecurityMetrics.instance = new SecurityMetrics();
    }
    return SecurityMetrics.instance;
  }

  incrementEvent(event: SecurityEventType, ip: string): void {
    const key = `${event}:${ip}`;
    const current = this.events.get(key) || 0;
    this.events.set(key, current + 1);

    // Reset if it's been 24 hours
    if (Date.now() > this.resetTime) {
      this.events.clear();
      this.resetTime = Date.now() + 24 * 60 * 60 * 1000;
    }
  }

  getEventCount(event: SecurityEventType, ip: string): number {
    const key = `${event}:${ip}`;
    return this.events.get(key) || 0;
  }

  // Check if an IP has suspicious activity patterns
  isSuspicious(ip: string): boolean {
    const rateLimitEvents = this.getEventCount('rate_limit_exceeded', ip);
    const invalidTokenEvents = this.getEventCount('invalid_token', ip);
    const csrfEvents = this.getEventCount('csrf_attempt', ip);

    // Define thresholds for suspicious activity
    return rateLimitEvents > 10 || invalidTokenEvents > 5 || csrfEvents > 1;
  }
}

export const securityMetrics = SecurityMetrics.getInstance(); 