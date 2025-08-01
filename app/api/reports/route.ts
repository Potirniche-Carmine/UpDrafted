import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { reportOperations, userOperations } from '@/database/db-utils';
import { clerkClient } from '@clerk/nextjs/server';
import { withRateLimit } from '@/utils/security';
import { getCachedWithType, setCachedWithType, createErrorResponse, createSuccessResponse } from '@/utils/security';

interface ReportData {
  id: number;
  reporterId: string;
  reportedUserId: string;
  reportReason: string;
  additionalDetails: string | null;
  createdAt: Date;
  status: string;
}

interface ReportsResponse {
  reports: ReportData[];
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and get user info
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId: reporterId, role } = authResult;

    // Apply rate limiting for reports
    const rateLimitCheck = await withRateLimit(request, 'reports', reporterId, role);
    if (!rateLimitCheck.success) return rateLimitCheck.response;

    // Parse the request body
    const body = await request.json();
    const { reportedUserId, reportReason, additionalDetails } = body;

    // Validate required fields
    if (!reportedUserId || !reportReason) {
      return createErrorResponse('Missing required fields: reportedUserId and reportReason are required', 400);
    }

    // Validate that user is not reporting themselves
    if (reporterId === reportedUserId) {
      return createErrorResponse('Cannot report yourself', 400);
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
        return createErrorResponse('Unable to verify reporter account', 500);
      }
    }

    // Ensure the reported user exists in our database
    const reportedUser = await userOperations.getUserWithProfile(reportedUserId);
    if (!reportedUser) {
      return createErrorResponse('Reported user not found', 404);
    }

    // Check if user has already reported this user
    const hasAlreadyReported = await reportOperations.hasUserReportedUser(reporterId, reportedUserId);
    if (hasAlreadyReported) {
      return createErrorResponse('You have already reported this user', 400);
    }

    // Create the report
    const reportData = {
      reporterId,
      reportedUserId,
      reportReason,
      additionalDetails: additionalDetails || null,
    };

    const report = await reportOperations.createReport(reportData);

    return createSuccessResponse({
      message: 'Report submitted successfully',
      reportId: report.id
    }, rateLimitCheck.headers);

  } catch (error) {
    console.error('Error creating report:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and get user info
    const auth = await requireAnyRole();
    if (auth instanceof NextResponse) return auth;

    const { userId, role } = auth;

    // Apply rate limiting
    const rateLimitCheck = await withRateLimit(request, 'reports', userId, role);
    if (!rateLimitCheck.success) return rateLimitCheck.response;

    const { searchParams } = new URL(request.url);
    const reportedUserId = searchParams.get('reportedUserId');

    if (role === 'admin') {
      // Admins can see all reports
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
      
      // Try cache first for admin reports
      const cacheKey = `reports:admin:${limit}:${offset}`;
      const cachedReports = await getCachedWithType<ReportsResponse>(cacheKey);
      
      if (cachedReports) {
        return createSuccessResponse(cachedReports, rateLimitCheck.headers);
      }

      const reports = await reportOperations.getAllReports(limit, offset);
      const result = { reports };
      
      // Cache admin reports for a short time
      await setCachedWithType(cacheKey, result, 'searchResults');
      
      return createSuccessResponse(result, rateLimitCheck.headers);
    } else if (reportedUserId) {
      // Users can only see reports they've made for a specific user (to check if already reported)
      const hasReported = await reportOperations.hasUserReportedUser(userId, reportedUserId);
      return createSuccessResponse({ hasReported }, rateLimitCheck.headers);
    } else {
      // Users can see reports they've made
      const cacheKey = `reports:user:${userId}`;
      const cachedUserReports = await getCachedWithType<ReportsResponse>(cacheKey);
      
      if (cachedUserReports) {
        return createSuccessResponse(cachedUserReports, rateLimitCheck.headers);
      }

      const reports = await reportOperations.getReportsByReporter(userId);
      const result = { reports };
      
      // Cache user reports
      await setCachedWithType(cacheKey, result, 'profileInfo');
      
      return createSuccessResponse(result, rateLimitCheck.headers);
    }

  } catch (error) {
    console.error('Error fetching reports:', error);
    return createErrorResponse('Internal server error', 500);
  }
} 