import { NextRequest, NextResponse } from 'next/server';
import { activityOperations } from '@/database/db-utils';
import { validateTimestamp } from '@/utils/security';

/**
 * POST /api/activity/cleanup
 * 
 * Cleanup endpoint for old activity logs. Protected by:
 * 1. CRON_SECRET_TOKEN - Must match environment variable
 * 2. Timestamp validation - Request must be within ±5 minutes of current time
 * 
 * Required headers:
 * - x-cron-secret: The cron secret token
 * - x-timestamp: Current timestamp in milliseconds
 * 
 * Query parameters:
 * - days: Number of days to keep (1-365, default: 14)
 */

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-cron-secret');
    const timestampHeader = request.headers.get('x-timestamp');
    
    // Validate cron secret
    if (authHeader !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Validate timestamp to prevent replay attacks
    const timestampValidation = validateTimestamp(timestampHeader);
    if (!timestampValidation.valid) {
      return NextResponse.json(
        { error: timestampValidation.error }, 
        { status: 401 }
      );
    }

    // Get the days to keep from query params (default: 14 days)
    const url = new URL(request.url);
    const daysToKeep = parseInt(url.searchParams.get('days') || '14');
    
    if (daysToKeep < 1 || daysToKeep > 365) {
      return NextResponse.json({
        success: false,
        error: 'Days to keep must be between 1 and 365'
      }, { status: 400 });
    }

    // Perform the cleanup
    const result = await activityOperations.cleanupOldActivityLogs(daysToKeep);
    
    return NextResponse.json({
      success: true,
      message: 'Activity log cleanup completed successfully',
      ...result
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const response: {
      success: false;
      error: string;
      details: string;
      debug?: unknown;
    } = {
      success: false,
      error: 'Failed to cleanup activity logs',
      details: errorMessage
    };
    
    // Include debug info only in development
    if (isDevelopment && error) {
      response.debug = error;
    }
    
    return NextResponse.json(response, { status: 500 });
  }
}