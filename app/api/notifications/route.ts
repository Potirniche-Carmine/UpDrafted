import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';
import { notifications } from '@/database/schema';
import { validateClerkHeaders } from '@/utils/clerk-security';
import { requireAnyRole } from '@/utils/roles';
import { eq, desc, and, count, sql } from 'drizzle-orm';
import { profileOperations, messageOperations, connectionOperations, notificationOperations } from '@/database/db-utils';
import { withRateLimit } from '@/utils/rate-limiting';
import { createErrorResponse } from '@/utils/security-cache';
// Removed unused imports - getCachedWithType, setCachedWithType, createErrorResponse, createSuccessResponse

type Operation = 'getNotifications' | 'markAsRead' | 'markAllAsRead' | 'getUnreadCount' | 'createNotifications' | 'dismissAllNotifications' | 'cleanupOldNotifications';

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
  // Validate security headers
  const validation = validateClerkHeaders(request);  
  if (!validation.isValid) {
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid security headers'
    }, { status: 401 });
  }

  try {
    // Require authentication
    const auth = await requireAnyRole();
    if (auth instanceof NextResponse) return auth;

    const { userId, role } = auth;

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
  // Validate security headers
  const validation = validateClerkHeaders(request);  
  if (!validation.isValid) {
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid security headers'
    }, { status: 401 });
  }

  try {
    const authResult = await requireAnyRole();
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId, role } = authResult;
    
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

      case 'createNotifications':
        return await handleCreateNotifications(userId);
      
      case 'dismissAllNotifications':
        return await handleDismissAllNotifications(userId);
      
      case 'cleanupOldNotifications':
        return await handleCleanupOldNotifications(userId);
      
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

// Create notifications based on actual unread messages and pending connections
async function handleCreateNotifications(userId: string) {
  try {
    // Get existing notifications from the last 7 days to prevent duplicates
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const existingNotifications = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        metadata: notifications.metadata,
        createdAt: notifications.createdAt,
        dismissedAt: notifications.dismissedAt,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          sql`${notifications.createdAt} >= ${sevenDaysAgo}`
        )
      );

    const createdNotifications = [];

    // 1. Check for unread messages
    const unreadMessageCount = await messageOperations.getUnreadMessageCount(userId);
    if (unreadMessageCount > 0) {
      // Get conversations with unread messages
      const userConversations = await messageOperations.getUserConversations(userId);
      const conversationsWithUnread = userConversations.filter(conv => 
        (conv.user1Id === userId && conv.user1UnreadCount > 0) ||
        (conv.user2Id === userId && conv.user2UnreadCount > 0)
      );

      if (conversationsWithUnread.length > 0) {
        // Check if we have an active (non-dismissed) notification for any of these conversations
        const hasActiveMessageNotification = existingNotifications.some(notif => {
          if (notif.type === 'newMessage' && notif.dismissedAt === null) {
            // Check if this notification is for one of the current unread conversations
            const metadata = notif.metadata as Record<string, unknown>;
            if (metadata?.conversationId) {
              return conversationsWithUnread.some(conv => conv.id === metadata.conversationId);
            }
            // For general message notifications, consider them active if recent
            return new Date(notif.createdAt) > sevenDaysAgo;
          }
          return false;
        });

        if (!hasActiveMessageNotification) {
          // Group by sender to create meaningful messages
          const senderCounts = new Map();
          
          for (const conv of conversationsWithUnread) {
            const isUser1 = conv.user1Id === userId;
            const unreadCount = isUser1 ? conv.user1UnreadCount : conv.user2UnreadCount;
            const partnerId = isUser1 ? conv.user2Id : conv.user1Id;
            
            const partnerInfo = await profileOperations.getUserProfileInfo(partnerId);
            if (partnerInfo) {
              senderCounts.set(partnerId, {
                name: partnerInfo.fullName,
                count: unreadCount,
                conversationId: conv.id,
                imageUrl: partnerInfo.profileImageUrl
              });
            }
          }

          // Create notifications for unread messages
          if (senderCounts.size === 1) {
            // Single sender
            const [senderId, senderData] = Array.from(senderCounts.entries())[0];
            const message = senderData.count === 1 
              ? `sent you a new message.`
              : `sent you ${senderData.count} new messages.`;

            const [notification] = await db.insert(notifications).values({
              userId,
              type: 'newMessage',
              title: 'New Message',
              message,
              metadata: {
                senderId,
                conversationId: senderData.conversationId,
                actorUserId: senderId,
              },
            }).returning();
            createdNotifications.push(notification);
          } else if (senderCounts.size > 1) {
            // Multiple senders
            const totalMessages = Array.from(senderCounts.values()).reduce((sum, data) => sum + data.count, 0);
            const senderNames = Array.from(senderCounts.values()).slice(0, 2).map(data => data.name);
            const additionalCount = senderCounts.size - 2;
            
            let message = `You have ${totalMessages} unread messages from ${senderNames.join(', ')}`;
            if (additionalCount > 0) {
              message += ` and ${additionalCount} other${additionalCount > 1 ? 's' : ''}`;
            }
            message += '.';

            const [notification] = await db.insert(notifications).values({
              userId,
              type: 'newMessage',
              title: 'New Messages',
              message,
              metadata: {
                totalMessages,
                senderCount: senderCounts.size,
              },
            }).returning();
            createdNotifications.push(notification);
          }
        }
      }
    }

    // 2. Check for pending connection requests
    const userConnections = await connectionOperations.getUserConnections(userId);
    const pendingRequests = userConnections.filter(conn => 
      conn.status === 'pending' && conn.toUserId === userId
    );

    if (pendingRequests.length > 0) {
      // Check if we already have ANY notification (dismissed or not) for any of these specific pending requests recently
      const hasRecentConnectionNotification = existingNotifications.some(notif => {
        if (notif.type === 'newConnection') {
          const metadata = notif.metadata as Record<string, unknown>;
          if (metadata?.connectionId) {
            // If we have a notification for this specific connection request, don't create another
            return pendingRequests.some(req => req.id === metadata.connectionId);
          } else if (metadata?.actorUserId) {
            // If we have a notification from this specific user recently, don't create another
            return pendingRequests.some(req => req.fromUserId === metadata.actorUserId) && 
                   new Date(notif.createdAt) > sevenDaysAgo;
          }
          return false;
        }
        return false;
      });

      if (!hasRecentConnectionNotification) {
        if (pendingRequests.length === 1) {
          // Single pending request
          const request = pendingRequests[0];
          const senderInfo = await profileOperations.getUserProfileInfo(request.fromUserId);
          
          if (senderInfo) {
            const [notification] = await db.insert(notifications).values({
              userId,
              type: 'newConnection',
              title: 'New Connection Request',
              message: 'sent you a connection request.',
              metadata: {
                actorUserId: request.fromUserId,
                connectionId: request.id,
              },
            }).returning();
            createdNotifications.push(notification);
          }
        } else {
          // Multiple pending requests
          const senderNames = [];
          for (const request of pendingRequests.slice(0, 2)) {
            const senderInfo = await profileOperations.getUserProfileInfo(request.fromUserId);
            if (senderInfo) {
              senderNames.push(senderInfo.fullName);
            }
          }

          const additionalCount = pendingRequests.length - 2;
          let message = `You have ${pendingRequests.length} pending connection requests from ${senderNames.join(', ')}`;
          if (additionalCount > 0) {
            message += ` and ${additionalCount} other${additionalCount > 1 ? 's' : ''}`;
          }
          message += '.';

          const [notification] = await db.insert(notifications).values({
            userId,
            type: 'newConnection',
            title: 'New Connection Requests',
            message,
            metadata: {
              requestCount: pendingRequests.length,
            },
          }).returning();
          createdNotifications.push(notification);
        }
      }
    }

    return NextResponse.json({
      success: true,
      notifications: createdNotifications,
      count: createdNotifications.length,
    });
  } catch (error) {
    console.error('Error creating notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create notifications'
    }, { status: 500 });
  }
}

async function handleGetNotifications(userId: string, body: GetNotificationsRequestBody, rateLimitHeaders: Record<string, string>) {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = body;

    const query = db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        metadata: notifications.metadata,
        createdAt: notifications.createdAt,
        readAt: notifications.readAt,
        dismissedAt: notifications.dismissedAt,
      })
      .from(notifications)
      .where(
        unreadOnly 
          ? and(
              eq(notifications.userId, userId), 
              eq(notifications.isRead, false),
              sql`${notifications.dismissedAt} IS NULL`
            )
          : and(
              eq(notifications.userId, userId),
              sql`${notifications.dismissedAt} IS NULL`
            )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const userNotifications = await query;

    // Enhance notifications with additional data based on metadata
    const enhancedNotifications = await Promise.all(
      userNotifications.map(async (notification) => {
        let enhancedData = {};

        if (notification.metadata) {
          const metadata = notification.metadata as Record<string, unknown>;

          // For single message/connection notifications, get actor info
          if (metadata.actorUserId) {
            try {
              const actorInfo = await profileOperations.getUserProfileInfo(metadata.actorUserId as string);
              if (actorInfo) {
                enhancedData = {
                  actorName: actorInfo.fullName,
                  actorImageUrl: actorInfo.profileImageUrl,
                  actorRole: actorInfo.role,
                };
              }
            } catch (error) {
              console.error('Error fetching actor info:', error);
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
            if (metadata.actorUserId) {
              enhancedData = {
                ...enhancedData,
                link: `/profile/${metadata.actorUserId}`,
              };
            }
          }
        }

        return {
          ...notification,
          ...enhancedData,
          timestamp: formatTimeAgo(notification.createdAt),
        };
      })
    );

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
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications'
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
    // First, cleanup old dismissed notifications (runs periodically)
    await handleCleanupOldNotifications(userId);
    
    // Then create/update notifications based on current state
    await handleCreateNotifications(userId);

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

async function handleDismissAllNotifications(userId: string) {
  try {
    // First run cleanup of old dismissed notifications (7+ days old)
    await handleCleanupOldNotifications(userId);
    
    // Get count of active (non-dismissed) notifications before dismissing
    const countResult = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          sql`${notifications.dismissedAt} IS NULL`
        )
      );
    
    const notificationCount = countResult[0]?.count || 0;
    
    if (notificationCount === 0) {
      return NextResponse.json({
        success: true,
        dismissedCount: 0,
      });
    }
    
    // Mark notifications as dismissed and read when clearing all
    const dismissedNotifications = await db
      .update(notifications)
      .set({ 
        dismissedAt: new Date(),
        isRead: true,
        readAt: new Date()
      })
      .where(
        and(
          eq(notifications.userId, userId),
          sql`${notifications.dismissedAt} IS NULL`
        )
      )
      .returning({ id: notifications.id });

    return NextResponse.json({
      success: true,
      dismissedCount: dismissedNotifications.length,
    });
  } catch (error) {
    console.error('Error dismissing all notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to dismiss notifications'
    }, { status: 500 });
  }
}

async function handleCleanupOldNotifications(userId: string) {
  try {
    // Delete dismissed notifications that were dismissed more than 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const deletedNotifications = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          sql`${notifications.dismissedAt} IS NOT NULL`,
          sql`${notifications.dismissedAt} < ${sevenDaysAgo}`
        )
      )
      .returning({ id: notifications.id });

    return NextResponse.json({
      success: true,
      deletedCount: deletedNotifications.length,
    });
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup old notifications'
    }, { status: 500 });
  }
} 