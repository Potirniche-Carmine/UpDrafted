import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { activityOperations, profileOperations } from '@/database/db-utils';
import { withRateLimit } from '@/utils/security';
import { SubscriptionManager } from '@/lib/subscription';
import { flushBufferedProfileViews } from '@/lib/activity-buffer';

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

    // Check if user has premium access to profile view insights
    const hasProfileViewInsights = await SubscriptionManager.hasPremiumAccess(userId);

    // Keep activity feed relatively fresh without waiting for scheduled flush.
    await flushBufferedProfileViews(100);
    
    // Get activity data
    const activities = await activityOperations.getUserActivity(userId, 50);
    
    // Filter to only profile view activities
    const profileViewActivities = activities.filter(activity => activity.action === 'profile_view');
    
    if (!hasProfileViewInsights) {
      // For free users, return just counts and time ranges without revealing who viewed
      const totalViews = profileViewActivities.length;
      
      // Count views in different time periods
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const viewsToday = profileViewActivities.filter(a => a.createdAt >= oneDayAgo).length;
      const viewsThisWeek = profileViewActivities.filter(a => a.createdAt >= oneWeekAgo).length;
      const viewsThisMonth = profileViewActivities.filter(a => a.createdAt >= oneMonthAgo).length;
      
      return NextResponse.json({
        success: true,
        isPremium: false,
        insights: {
          totalViews,
          viewsToday,
          viewsThisWeek,
          viewsThisMonth,
          message: 'Upgrade to premium to see who viewed your profile'
        }
      });
    }

    // For premium users, return detailed information
    const enrichedActivities = await Promise.all(
      profileViewActivities.map(async (activity) => {
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
      isPremium: true,
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