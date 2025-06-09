import { NextRequest, NextResponse } from 'next/server';
import { messageOperations, connectionOperations, profileOperations } from '@/database/db-utils';
import { validateClerkHeaders } from '@/utils/clerk-security';
import { requireAnyRole } from '@/utils/roles';
import { decryptMessage } from '@/utils/encryption';
import { sanitizeText } from '@/utils/sanitization';
import { User } from '@/database/schema';

interface ConversationData {
  id: number;
  user1Id: string;
  user2Id: string;
  lastMessageAt: Date | null;
  user1UnreadCount: number;
  user2UnreadCount: number;
  connectionActive: boolean;
  createdAt: Date;
  messages?: Array<{
    encryptedContent: string;
    contentIV: string;
  }>;
  user1?: User;
  user2?: User;
}

type Operation = 'getConversations' | 'getMessages' | 'sendMessage' | 'markRead' | 'getUnreadCount';

interface BaseRequestBody {
  operation: Operation;
}

interface GetMessagesRequestBody extends BaseRequestBody {
  conversationId: string | number;
  limit?: number;
  offset?: number;
}

interface SendMessageRequestBody extends BaseRequestBody {
  conversationId: string | number;
  message: string;
}

interface MarkReadRequestBody extends BaseRequestBody {
  conversationId: string | number;
}

/**
 * Unified messaging API that handles all operations
 * Uses a single endpoint to reduce function invocations
 * 
 * Operations:
 * - getConversations: Get all user conversations
 * - getMessages: Get messages for a specific conversation
 * - sendMessage: Send a new message
 * - markRead: Mark messages in a conversation as read
 * - getUnreadCount: Get total unread message count
 */
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

    const { userId } = authResult;
    
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
      case 'getConversations':
        return await handleGetConversations(userId);
      
      case 'getMessages':
        return await handleGetMessages(userId, body as GetMessagesRequestBody);
      
      case 'sendMessage':
        return await handleSendMessage(userId, body as SendMessageRequestBody);
      
      case 'markRead':
        return await handleMarkRead(userId, body as MarkReadRequestBody);
      
      case 'getUnreadCount':
        return await handleGetUnreadCount(userId);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid operation'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in messages API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Operation failed'
    }, { status: 500 });
  }
}

/**
 * Get all conversations for the current user
 */
async function handleGetConversations(userId: string) {
  try {
    // Get conversations
    const conversations = await messageOperations.getUserConversations(userId);
    
    // Get unread message count
    const unreadCount = await messageOperations.getUnreadMessageCount(userId);
    
    // Format the conversations to avoid sending sensitive data
    const formattedConversations = await Promise.all(conversations.map(async (conversation: ConversationData) => {
      // Determine if user is user1 or user2
      const isUser1 = conversation.user1Id === userId;
      
      // Get partner user ID
      const partnerId = isUser1 ? conversation.user2Id : conversation.user1Id;
      
      if (!partnerId) {
        return null;
      }

      // Get partner profile info
      const partnerInfo = await profileOperations.getUserProfileInfo(partnerId);
      
      if (!partnerInfo) {
        return null;
      }
      
      // Get the latest message if available
      const latestMessage = conversation.messages?.[0];
      
      // Format decrypted content if a message exists
      let messagePreview = '';
      if (latestMessage) {
        try {
          const decrypted = decryptMessage(
            latestMessage.encryptedContent,
            latestMessage.contentIV
          );
          messagePreview = decrypted.length > 100 
            ? `${decrypted.substring(0, 97)}...` 
            : decrypted;
        } catch {
          messagePreview = '[Message unavailable]';
        }
      }

      return {
        id: conversation.id,
        partnerId: partnerId,
        partnerName: partnerInfo.fullName,
        partnerRole: partnerInfo.role,
        partnerImageUrl: partnerInfo.profileImageUrl,
        lastMessagePreview: messagePreview,
        lastMessageTime: conversation.lastMessageAt,
        unreadCount: isUser1 
          ? conversation.user1UnreadCount 
          : conversation.user2UnreadCount,
        connectionActive: conversation.connectionActive,
        createdAt: conversation.createdAt,
      };
    }));

    return NextResponse.json({
      success: true,
      conversations: formattedConversations.filter(Boolean),
      totalUnreadCount: unreadCount
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch conversations'
    }, { status: 500 });
  }
}

/**
 * Get messages for a specific conversation
 */
async function handleGetMessages(userId: string, body: GetMessagesRequestBody) {
  try {
    const { conversationId, limit = 50, offset = 0 } = body;
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing conversation ID'
      }, { status: 400 });
    }
    
    // Convert conversationId to number
    const conversationIdNum = typeof conversationId === 'string' 
      ? parseInt(conversationId, 10) 
      : conversationId;
    
    // Get conversation details
    const conversation = await messageOperations.getConversationById(conversationIdNum);
    
    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversation not found'
      }, { status: 404 });
    }
    
    // Security check: ensure user is part of this conversation
    const isParticipant = 
      (conversation.user1Id === userId) || 
      (conversation.user2Id === userId);
    
    if (!isParticipant) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to conversation'
      }, { status: 403 });
    }
    
    // Check if connection is still active
    if (!conversation.connectionActive) {
      // Get connection status to see if they're still connected
      const partnerId = conversation.user1Id === userId 
        ? conversation.user2Id
        : conversation.user1Id;
      
      // Get connection status
      const connection = await connectionOperations.getConnectionBetweenUsers(userId, partnerId);
      const reverseConnection = await connectionOperations.getConnectionBetweenUsers(partnerId, userId);
      
      // If there's no active connection in either direction
      if (
        (!connection || connection.status !== 'connected') && 
        (!reverseConnection || reverseConnection.status !== 'connected')
      ) {
        // Return messages but with a flag that connection is inactive
        return NextResponse.json({
          success: true,
          messages: [],
          conversation: {
            id: conversation.id,
            connectionActive: false
          },
          connectionStatus: 'inactive',
          otherUserId: partnerId
        });
      } else {
        // There's an active connection but conversation flag is wrong - fix it
        await messageOperations.updateConversationConnectionStatus(
          conversation.id,
          true
        );
      }
    }
    
    // Get messages
    const messages = await messageOperations.getMessages(
      conversationIdNum,
      limit,
      offset
    );
    
    // Mark messages as read
    await messageOperations.markMessagesAsRead(conversationIdNum, userId);
    
    // Decrypt messages for client
    const decryptedMessages = messages.map(message => {
      try {
        const decryptedContent = decryptMessage(
          message.encryptedContent,
          message.contentIV
        );
        
        return {
          id: message.id,
          senderId: message.senderId,
          content: decryptedContent,
          isFromCurrentUser: message.senderId === userId,
          isRead: message.isRead,
          readAt: message.readAt,
          createdAt: message.createdAt,
          messageType: message.messageType,
        };
      } catch {
        return {
          id: message.id,
          senderId: message.senderId,
          content: '[Message could not be decrypted]',
          isFromCurrentUser: message.senderId === userId,
          isRead: message.isRead,
          readAt: message.readAt,
          createdAt: message.createdAt,
          messageType: 'error',
        };
      }
    });
    
    // Get partner user details
    const partnerId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
    const partnerInfo = await profileOperations.getUserProfileInfo(partnerId);
    
    if (!partnerInfo) {
      return NextResponse.json({
        success: false,
        error: 'Partner information not found'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      messages: decryptedMessages,
      conversation: {
        id: conversation.id,
        partner: {
          id: partnerId,
          name: partnerInfo.fullName,
          role: partnerInfo.role,
          profileImageUrl: partnerInfo.profileImageUrl
        },
        connectionActive: conversation.connectionActive
      },
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch conversation messages'
    }, { status: 500 });
  }
}

/**
 * Send a new message
 */
async function handleSendMessage(userId: string, body: SendMessageRequestBody) {
  try {
    const { conversationId, message } = body;
    
    if (!conversationId || !message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Missing conversationId or message'
      }, { status: 400 });
    }
    
    // Convert conversationId to number
    const conversationIdNum = typeof conversationId === 'string' 
      ? parseInt(conversationId, 10) 
      : conversationId;
    
    // Sanitize message content
    const sanitizedMessage = sanitizeText(message);
    
    if (!sanitizedMessage) {
      return NextResponse.json({
        success: false,
        error: 'Message cannot be empty'
      }, { status: 400 });
    }
    
    // Get conversation to verify access permission
    const conversation = await messageOperations.getConversationById(conversationIdNum);
    
    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversation not found'
      }, { status: 404 });
    }
    
    // Security check: ensure user is part of this conversation
    const isParticipant = 
      (conversation.user1Id === userId) || 
      (conversation.user2Id === userId);
    
    if (!isParticipant) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to conversation'
      }, { status: 403 });
    }
    
    // Check if connection is still active
    if (!conversation.connectionActive) {
      // Get connection status to see if they're still connected
      const partnerId = conversation.user1Id === userId 
        ? conversation.user2Id
        : conversation.user1Id;
      
      const connection = await connectionOperations.getConnectionBetweenUsers(userId, partnerId);
      const reverseConnection = await connectionOperations.getConnectionBetweenUsers(partnerId, userId);
      
      // If there's no active connection in either direction
      if (
        (!connection || connection.status !== 'connected') && 
        (!reverseConnection || reverseConnection.status !== 'connected')
      ) {
        return NextResponse.json({
          success: false,
          error: 'Cannot send message: You are no longer connected with this user',
          connectionStatus: 'inactive',
          otherUserId: partnerId
        }, { status: 403 });
      } else {
        // There's an active connection but conversation flag is wrong - fix it
        await messageOperations.updateConversationConnectionStatus(
          conversation.id,
          true
        );
      }
    }
    
    // Send the message
    await messageOperations.sendMessage(
      conversationIdNum,
      userId,
      sanitizedMessage
    );
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send message'
    }, { status: 500 });
  }
}

/**
 * Mark messages as read
 */
async function handleMarkRead(userId: string, body: MarkReadRequestBody) {
  try {
    const { conversationId } = body;
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing conversationId'
      }, { status: 400 });
    }
    
    // Convert conversationId to number
    const conversationIdNum = typeof conversationId === 'string' 
      ? parseInt(conversationId, 10) 
      : conversationId;
    
    // Get conversation to verify access permission
    const conversation = await messageOperations.getConversationById(conversationIdNum);
    
    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversation not found'
      }, { status: 404 });
    }
    
    // Security check: ensure user is part of this conversation
    const isParticipant = 
      (conversation.user1Id === userId) || 
      (conversation.user2Id === userId);
    
    if (!isParticipant) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to conversation'
      }, { status: 403 });
    }
    
    // Mark messages as read
    await messageOperations.markMessagesAsRead(conversationIdNum, userId);
    
    // Get updated unread count
    const unreadCount = await messageOperations.getUnreadMessageCount(userId);
    
    return NextResponse.json({
      success: true,
      totalUnreadCount: unreadCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark messages as read'
    }, { status: 500 });
  }
}

/**
 * Get total unread message count
 */
async function handleGetUnreadCount(userId: string) {
  try {
    const unreadCount = await messageOperations.getUnreadMessageCount(userId);
    
    return NextResponse.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch unread message count'
    }, { status: 500 });
  }
}

/**
 * GET handler for backward compatibility
 * Simply redirects to the POST handler with getConversations operation
 */
export async function GET(request: NextRequest) {
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

    const { userId } = authResult;
    
    // Handle as getConversations
    return await handleGetConversations(userId);
  } catch (error) {
    console.error('Error in GET handler:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Operation failed'
    }, { status: 500 });
  }
} 