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
    
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup activity logs'
    }, { status: 500 });
  }
}

// Optional: Allow GET requests for manual testing (with same auth)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (!expectedToken || !authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Just return info without actually cleaning up
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14);
    
    return NextResponse.json({
      success: true,
      message: 'Cleanup endpoint is ready',
      info: {
        defaultDaysToKeep: 14,
        exampleCutoffDate: cutoffDate.toISOString(),
        usage: 'POST to this endpoint to perform cleanup'
      }
    });

  } catch (error) {
    console.error('Error in cleanup info endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get cleanup info'
    }, { status: 500 });
  }
}
