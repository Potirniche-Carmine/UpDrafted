import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { reportOperations, userOperations } from '@/database/db-utils';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and get user info
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId: reporterId } = authResult;

    // Parse the request body
    const body = await request.json();
    const { reportedUserId, reportReason, additionalDetails } = body;

    // Validate required fields
    if (!reportedUserId || !reportReason) {
      return NextResponse.json(
        { error: 'Missing required fields: reportedUserId and reportReason are required' },
        { status: 400 }
      );
    }

    // Validate that user is not reporting themselves
    if (reporterId === reportedUserId) {
      return NextResponse.json(
        { error: 'Cannot report yourself' },
        { status: 400 }
      );
    }

    // Ensure the reporter exists in our database
    const reporterUser = await userOperations.getUserWithProfile(reporterId);
    if (!reporterUser) {
      // Get user info from Clerk to create the database record
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(reporterId);
        const email = clerkUser.primaryEmailAddress?.emailAddress || 
                     clerkUser.emailAddresses?.[0]?.emailAddress || 
                     `${reporterId}@placeholder.com`;
        
        // Create the user if they don't exist (they're authenticated in Clerk but not in our DB)
        await userOperations.createUser({
          id: reporterId,
          email: email,
          role: 'athlete' // Default role, this should be determined by their actual role
        });
      } catch (error) {
        console.error('Error creating reporter user:', error);
        return NextResponse.json(
          { error: 'Unable to verify reporter account' },
          { status: 500 }
        );
      }
    }

    // Ensure the reported user exists in our database
    const reportedUser = await userOperations.getUserWithProfile(reportedUserId);
    if (!reportedUser) {
      return NextResponse.json(
        { error: 'Reported user not found' },
        { status: 404 }
      );
    }

    // Check if user has already reported this user
    const hasAlreadyReported = await reportOperations.hasUserReportedUser(reporterId, reportedUserId);
    if (hasAlreadyReported) {
      return NextResponse.json(
        { error: 'You have already reported this user' },
        { status: 400 }
      );
    }

    // Create the report
    const reportData = {
      reporterId,
      reportedUserId,
      reportReason,
      additionalDetails: additionalDetails || null,
    };

    const report = await reportOperations.createReport(reportData);

    return NextResponse.json(
      { 
        message: 'Report submitted successfully',
        reportId: report.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and get user info
    const auth = await requireAnyRole();
    if (auth instanceof NextResponse) return auth;

    const { userId, role } = auth;
    const { searchParams } = new URL(request.url);
    const reportedUserId = searchParams.get('reportedUserId');

    if (role === 'admin') {
      // Admins can see all reports
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
      const reports = await reportOperations.getAllReports(limit, offset);
      return NextResponse.json({ reports });
    } else if (reportedUserId) {
      // Users can only see reports they've made for a specific user (to check if already reported)
      const hasReported = await reportOperations.hasUserReportedUser(userId, reportedUserId);
      return NextResponse.json({ hasReported });
    } else {
      // Users can see reports they've made
      const reports = await reportOperations.getReportsByReporter(userId);
      return NextResponse.json({ reports });
    }

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 