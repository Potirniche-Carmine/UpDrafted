import { NextRequest } from 'next/server'

export interface ClerkSecurityHeaders {
  authorization?: string | null
  accept?: string | null
  host?: string | null
  origin?: string | null
  referer?: string | null
  secFetchDest?: string | null
  userAgent?: string | null
  xForwardedHost?: string | null
  xForwardedProto?: string | null
}

/**
 * Validates that all required Clerk security headers are present
 * @param request - The incoming NextRequest object
 * @returns Object containing validation results and missing headers
 */
export function validateClerkHeaders(request: NextRequest): {
  isValid: boolean
  headers: ClerkSecurityHeaders
  missingHeaders: string[]
  warnings: string[]
} {
  const headers: ClerkSecurityHeaders = {
    authorization: request.headers.get('authorization'),
    accept: request.headers.get('accept'),
    host: request.headers.get('host'),
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
    secFetchDest: request.headers.get('sec-fetch-dest'),
    userAgent: request.headers.get('user-agent'),
    xForwardedHost: request.headers.get('x-forwarded-host'),
    xForwardedProto: request.headers.get('x-forwarded-proto') || request.headers.get('cloudfront-forwarded-proto'),
  }

  const criticalHeaders = ['authorization', 'accept', 'host', 'origin', 'userAgent']
  const optionalHeaders = ['referer', 'secFetchDest', 'xForwardedHost', 'xForwardedProto']

  const missingCritical = criticalHeaders.filter(key => 
    !headers[key as keyof ClerkSecurityHeaders]
  )

  const missingOptional = optionalHeaders.filter(key => 
    !headers[key as keyof ClerkSecurityHeaders]
  )

  const warnings: string[] = []
  
  // Check for Bearer token format
  if (headers.authorization && !headers.authorization.startsWith('Bearer ')) {
    warnings.push('Authorization header should use Bearer token format')
  }

  // Check for HTTPS in production
  if (process.env.NODE_ENV === 'production' && headers.xForwardedProto !== 'https') {
    warnings.push('HTTPS should be used in production')
  }

  if (missingOptional.length > 0) {
    warnings.push(`Optional headers missing: ${missingOptional.join(', ')}`)
  }

  return {
    isValid: missingCritical.length === 0,
    headers,
    missingHeaders: missingCritical,
    warnings
  }
}

/**
 * Creates secure headers for client-side requests to your API
 * @param token - The Clerk session token
 * @returns Headers object with required security headers
 */
export function createSecureHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  }
}

/**
 * Logs security validation results for monitoring
 * @param validation - The validation results from validateClerkHeaders
 * @param endpoint - The API endpoint being accessed
 */
export function logSecurityValidation(
  validation: ReturnType<typeof validateClerkHeaders>,
  endpoint: string
): void {
  if (!validation.isValid) {
    console.error(`Security validation failed for ${endpoint}:`, {
      missingHeaders: validation.missingHeaders,
      warnings: validation.warnings
    })
  } else if (validation.warnings.length > 0) {
    console.warn(`Security warnings for ${endpoint}:`, validation.warnings)
  } else {
    console.log(`Security validation passed for ${endpoint}`)
  }
} 