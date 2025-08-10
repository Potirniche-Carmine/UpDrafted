import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { activityOperations, profileOperations } from '@/database/db-utils';
import { withRateLimit } from '@/utils/security';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAnyRole();
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId, role } = authResult;
    
    // Apply rate limiting
    const rateLimitCheck = await withRateLimit(request, 'general', userId, role);
    if (!rateLimitCheck.success) {
      return rateLimitCheck.response;
    }

    // TODO: Check if user has "starter" plan - for now, allow all users
    // In a real implementation, you would check the user's subscription here
    // const hasStarterPlan = await checkUserSubscription(userId);
    // if (!hasStarterPlan) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Premium subscription required',
    //     requiresUpgrade: true
    //   }, { status: 403 });
    // }

    // Get activity data
    const activities = await activityOperations.getUserActivity(userId, 50);
    
    // Get profile info for each viewer
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const viewerProfile = await profileOperations.getUserProfileInfo(activity.viewerId);
        return {
          id: activity.id,
          action: activity.action,
          createdAt: activity.createdAt,
          metadata: activity.metadata,
          viewer: {
            id: activity.viewerId,
            name: viewerProfile?.fullName || 'Unknown User',
            profileImage: viewerProfile?.profileImageUrl || null,
            role: viewerProfile?.role || 'unknown'
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      activities: enrichedActivities
    });

  } catch (error) {
    console.error('Error fetching activity:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch activity data'
    }, { status: 500 });
  }
} 