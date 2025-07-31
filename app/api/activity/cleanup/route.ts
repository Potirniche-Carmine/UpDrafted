import { NextRequest, NextResponse } from 'next/server';
import { activityOperations } from '@/database/db-utils';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request by checking for a secret token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (!expectedToken) {
      console.error('CRON_SECRET_TOKEN environment variable not set');
      return NextResponse.json({
        success: false,
        error: 'Server configuration error'
      }, { status: 500 });
    }
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.error('Unauthorized cleanup attempt');
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
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

    console.log(`Starting activity log cleanup - keeping last ${daysToKeep} days`);
    
    // Perform the cleanup
    const result = await activityOperations.cleanupOldActivityLogs(daysToKeep);
    
    console.log(`Activity log cleanup completed:`, result);
    
    return NextResponse.json({
      success: true,
      message: 'Activity log cleanup completed successfully',
      ...result
    });

  } catch (error) {
    console.error('Error during activity log cleanup:', error);
    
    // Provide more detailed error information for debugging
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