import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';
import { notifications } from '@/database/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, desc, and } from 'drizzle-orm';
import { profileOperations, notificationOperations } from '@/database/db-utils';
import { withRateLimit } from '@/utils/security';
import { createErrorResponse } from '@/utils/security';
import { generateProfileUrl } from '@/lib/utils';
import { SubscriptionManager } from '@/lib/subscription';

type Operation = 'getNotifications' | 'markAsRead' | 'markAllAsRead' | 'getUnreadCount' | 'dismissAllNotifications';

interface BaseRequestBody {
  operation: Operation;
}

interface GetNotificationsRequestBody extends BaseRequestBody {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

interface MarkAsReadRequestBody extends BaseRequestBody {
  notificationId: number;
}

// Utility function for formatting time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = sessionClaims?.metadata?.role as string;
    
    // If user doesn't have a valid role (likely in onboarding), return empty state
    if (!userRole || !['admin', 'athlete', 'coach', 'recruiter'].includes(userRole)) {
      return NextResponse.json({ 
        success: true,
        unreadCount: 0
      });
    }

    const role = userRole as 'admin' | 'athlete' | 'coach' | 'recruiter';

    // Apply rate limiting
    const rateLimitCheck = await withRateLimit(request, 'general', userId, role);
    if (!rateLimitCheck.success) return rateLimitCheck.response;

    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation') || 'getNotifications';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (operation === 'getNotifications') {
      return await handleGetNotifications(userId, { operation: 'getNotifications', limit, offset, unreadOnly }, rateLimitCheck.headers);
    } else if (operation === 'getUnreadCount') {
      return await handleGetUnreadCount(userId, rateLimitCheck.headers);
    } else {
      return createErrorResponse('Invalid operation', 400);
    }
  } catch (error) {
    console.error('Notifications API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = sessionClaims?.metadata?.role as string;
    
    // If user doesn't have a valid role (likely in onboarding), return access forbidden
    if (!userRole || !['admin', 'athlete', 'coach', 'recruiter'].includes(userRole)) {
      return NextResponse.json({ 
        error: 'Access forbidden - Valid role required' 
      }, { status: 403 });
    }

    const role = userRole as 'admin' | 'athlete' | 'coach' | 'recruiter';
    
    // Apply rate limiting for notifications operations
    const rateLimitCheck = await withRateLimit(request, 'general', userId, role);
    if (!rateLimitCheck.success) return rateLimitCheck.response;
    
    // Parse request body and get operation type
    const body = await request.json();
    const { operation } = body as BaseRequestBody;
    
    if (!operation) {
      return NextResponse.json({
        success: false,
        error: 'Missing operation parameter'
      }, { status: 400 });
    }
    
    // Route to appropriate handler based on operation
    switch (operation) {
      case 'markAsRead':
        return await handleMarkAsRead(userId, body as MarkAsReadRequestBody);
      
      case 'markAllAsRead':
        return await handleMarkAllAsRead(userId);


      
      case 'dismissAllNotifications':
        return await handleDeleteAllNotifications(userId);
      

      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid operation'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in notifications API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Operation failed'
    }, { status: 500 });
  }
}



async function handleGetNotifications(userId: string, body: GetNotificationsRequestBody, rateLimitHeaders: Record<string, string>) {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = body;

    // Add timeout protection for the main query
    const queryTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 10000); // 10 second timeout
    });

    // First get the notifications with timeout protection
    const queryPromise = db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        metadata: notifications.metadata,
        createdAt: notifications.createdAt,
        readAt: notifications.readAt,
      })
      .from(notifications)
      .where(
        unreadOnly 
          ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
          : eq(notifications.userId, userId)
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const userNotifications = await Promise.race([queryPromise, queryTimeout]);

    // Check if user has premium access to profile view insights
    const hasProfileViewInsights = await SubscriptionManager.hasPremiumAccess(userId);
    
    // Keep all notifications (including profile views), but we'll modify the metadata later
    const filteredNotifications = userNotifications;

    // Get unique actor user IDs to batch fetch profile info
    // For profile view notifications, only fetch actor data if user has premium
    const actorUserIds = new Set<string>();
    filteredNotifications.forEach(notification => {
      if (notification.metadata) {
        const metadata = notification.metadata as Record<string, unknown>;
        if (metadata.actorUserId && typeof metadata.actorUserId === 'string') {
          // For profile view notifications, only add to fetch list if user has premium
          if (notification.type === 'profileView' && !hasProfileViewInsights) {
            // Skip fetching actor data for profile view notifications for non-premium users
            return;
          }
          actorUserIds.add(metadata.actorUserId);
        }
      }
    });

    // Batch fetch all actor profile info with individual error handling
    const actorProfilesMap = new Map<string, {
      fullName: string;
      profileImageUrl?: string | null;
      role: string;
    }>();
    
    if (actorUserIds.size > 0) {
      try {
        // Add timeout for profile fetching too
        const profileTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Profile fetch timeout')), 8000); // Increased to 8 second timeout
        });

        const profilePromises = Array.from(actorUserIds).map(async (actorUserId) => {
          try {
            const profile = await profileOperations.getUserProfileInfo(actorUserId);
            return { actorUserId, profile };
          } catch (error) {
            console.warn(`Error fetching profile for user ${actorUserId}:`, error);
            // Return fallback data instead of null
            return { 
              actorUserId, 
              profile: {
                fullName: 'Unknown User',
                profileImageUrl: null,
                role: 'user'
              }
            };
          }
        });
        
        const profileResults = await Promise.race([
          Promise.all(profilePromises),
          profileTimeout
        ]);
        
        profileResults.forEach(({ actorUserId, profile }) => {
          if (profile) {
            actorProfilesMap.set(actorUserId, profile);
          }
        });
      } catch (error) {
        console.warn('Error batch fetching actor profiles (using fallback data):', error);
        // Provide fallback profile data for all actors
        Array.from(actorUserIds).forEach(actorUserId => {
          actorProfilesMap.set(actorUserId, {
            fullName: 'Unknown User',
            profileImageUrl: null,
            role: 'user'
          });
        });
      }
    }

    // Enhance notifications with cached profile data
    const enhancedNotifications = filteredNotifications.map((notification) => {
      let enhancedData = {};

      // Handle profile view notifications for non-premium users
      if (notification.type === 'profileView' && !hasProfileViewInsights) {
        return {
          ...notification,
          // Override title and message for locked notifications
          title: 'Profile View',
          message: 'Someone viewed your profile. View insights to see your profile statistics',
          // Don't include any actor metadata
          actorName: undefined,
          actorImageUrl: undefined,
          actorRole: undefined,
          // Add a flag to indicate this is a locked notification
          isLocked: true,
          // Link to activity insights page instead of pricing
          link: '/activity',
          timestamp: formatTimeAgo(notification.createdAt),
          // Strip all metadata to prevent abuse
          metadata: undefined,
        };
      }

      if (notification.metadata) {
        const metadata = notification.metadata as Record<string, unknown>;

        // Use cached actor info
        if (metadata.actorUserId && typeof metadata.actorUserId === 'string') {
          const actorInfo = actorProfilesMap.get(metadata.actorUserId);
          if (actorInfo) {
            enhancedData = {
              actorName: actorInfo.fullName,
              actorImageUrl: actorInfo.profileImageUrl,
              actorRole: actorInfo.role,
            };
          } else {
            // Fallback data if profile wasn't found
            enhancedData = {
              actorName: 'Unknown User',
              actorImageUrl: null,
              actorRole: 'user',
            };
          }
        }

        // Add navigation links
        if (notification.type === 'newMessage') {
          if (metadata.conversationId) {
            enhancedData = {
              ...enhancedData,
              link: `/messages?conversation=${metadata.conversationId}`,
            };
          } else {
            enhancedData = {
              ...enhancedData,
              link: `/messages`,
            };
          }
        } else if (notification.type === 'newConnection') {
          enhancedData = {
            ...enhancedData,
            link: '/connections?tab=requests',
          };
        } else if (notification.type === 'profileView') {
          // For profile view notifications, link to the viewer's profile
          if (metadata.actorUserId && typeof metadata.actorUserId === 'string') {
            const actorInfo = actorProfilesMap.get(metadata.actorUserId);
            if (actorInfo?.fullName) {
              // Use the generateProfileUrl function to create the correct URL format
              enhancedData = {
                ...enhancedData,
                link: generateProfileUrl(actorInfo.fullName, metadata.actorUserId),
              };
            } else {
              // Fallback to old format if no fullName available
              enhancedData = {
                ...enhancedData,
                link: `/profile/${metadata.actorUserId}`,
              };
            }
          }
        }
      }

      return {
        ...notification,
        ...enhancedData,
        timestamp: formatTimeAgo(notification.createdAt),
      };
    });

    const response = NextResponse.json({
      success: true,
      notifications: enhancedNotifications,
    });
    
    // Add rate limit headers to response
    for (const [header, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(header, value);
    }
    return response;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error && error.message === 'Query timeout' 
      ? 'Request timed out - please try again'
      : 'Failed to fetch notifications';
      
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

async function handleMarkAsRead(userId: string, body: MarkAsReadRequestBody) {
  try {
    const { notificationId } = body;

    await notificationOperations.markNotificationAsRead(userId, notificationId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark notification as read'
    }, { status: 500 });
  }
}

async function handleMarkAllAsRead(userId: string) {
  try {
    await notificationOperations.markAllNotificationsAsRead(userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark all notifications as read'
    }, { status: 500 });
  }
}

async function handleGetUnreadCount(userId: string, rateLimitHeaders: Record<string, string>) {
  try {
    const unreadCount = await notificationOperations.getUnreadNotificationCount(userId);

    const response = NextResponse.json({
      success: true,
      unreadCount,
    });
    
    // Add rate limit headers to response
    for (const [header, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(header, value);
    }
    return response;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch unread count'
    }, { status: 500 });
  }
}

async function handleDeleteAllNotifications(userId: string) {
  try {
    // Actually delete all notifications for the user
    const deletedNotifications = await notificationOperations.deleteAllNotifications(userId);

    return NextResponse.json({
      success: true,
      deletedCount: deletedNotifications.length,
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete notifications'
    }, { status: 500 });
  }
}

 