import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { connectionOperations, userOperations } from '@/database/db-utils';
import { sanitizeText } from '@/utils/sanitization';
import { withRateLimit } from '@/utils/rate-limiting';
import { getCachedWithType, setCachedWithType, invalidateCachePattern, createErrorResponse, createSuccessResponse } from '@/utils/security-cache';

export const runtime = 'nodejs';

interface ConnectionData {
  id: number;
  status: string;
  initiatedBy: string;
  createdAt: Date;
  notes: string | null;
  isInitiator: boolean;
  otherUser: {
    userId: string;
    fullName: string;
    profileImage: string | null;
    organizationName: string;
    title: string;
    sport: string;
    city: string;
    state: string;
    graduationYear: number | null;
    educationLevel: string;
    division: string;
    isVerified: boolean;
    role: string;
  };
}

interface ConnectionsResponse {
  connected: ConnectionData[];
  incoming: ConnectionData[];
  outgoing: ConnectionData[];
  counts: { 
    connected: number; 
    incoming: number; 
    outgoing: number; 
  };
}

// Create a new connection request
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId: currentUserId, role } = authResult;
    
    // Apply rate limiting for connection operations
    const rateLimitCheck = await withRateLimit(request, 'connections', currentUserId, role);
    if (!rateLimitCheck.success) return rateLimitCheck.response;

    // Parse request body with size limits
    const body = await request.json();
    const { targetUserId, note } = body;

    // Validate required fields
    if (!targetUserId) {
      return createErrorResponse('Target user ID is required', 400);
    }

    // SECURITY: Prevent self-connections
    if (currentUserId === targetUserId) {
      return createErrorResponse('Cannot connect to yourself', 400);
    }

    // Sanitize the note to prevent XSS
    const sanitizedNote = note ? sanitizeText(note) : undefined;
    
    // Validate note length
    if (sanitizedNote && sanitizedNote.length > 500) {
      return createErrorResponse('Note must be 500 characters or less', 400);
    }

    // Get both users' profiles to determine types and validate connection rules
    const [currentUser, targetUser] = await Promise.all([
      userOperations.getUserWithProfile(currentUserId),
      userOperations.getUserWithProfile(targetUserId)
    ]);

    if (!currentUser || !targetUser) {
      return createErrorResponse('One or both users not found', 404);
    }

    // SECURITY: Only prevent athlete-to-athlete connections
    if (currentUser.role === 'athlete' && targetUser.role === 'athlete') {
      return createErrorResponse('Athletes cannot connect to other athletes', 400);
    }

    // Create the connection using user IDs
    const connection = await connectionOperations.createConnection(
      currentUserId,
      targetUserId,
      currentUser.role === 'athlete' ? 'athlete' : 'coach',
      sanitizedNote
    );

    // Invalidate connections cache for both users
    await Promise.all([
      invalidateCachePattern(`connections:${currentUserId}*`),
      invalidateCachePattern(`connections:${targetUserId}*`)
    ]);

    const response = createSuccessResponse({
      success: true,
      connection: {
        id: connection.id,
        status: connection.status,
        initiatedBy: connection.initiatedBy,
        createdAt: connection.createdAt,
        notes: connection.notes
      }
    }, rateLimitCheck.headers);
    
    return response;

  } catch (error) {
    console.error('Error creating connection:', error);
    
    // Handle database constraint violations (e.g., duplicate connection)
    if (error instanceof Error && error.message.includes('unique')) {
      return createErrorResponse('Connection already exists between these users', 409);
    }
    
    return createErrorResponse('Failed to create connection', 500);
  }
}

// Get user's connections
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId: currentUserId, role } = authResult;

    // Apply rate limiting
    const rateLimitCheck = await withRateLimit(request, 'connections', currentUserId, role);
    if (!rateLimitCheck.success) return rateLimitCheck.response;

    // Try cache first
    const cacheKey = `connections:${currentUserId}:all`;
    const cachedConnections = await getCachedWithType<ConnectionsResponse>(cacheKey);
    
    if (cachedConnections) {
      return createSuccessResponse(cachedConnections, rateLimitCheck.headers);
    }

    // Get connections based on user type - now using the new user-based approach
    const allConnections = await connectionOperations.getUserConnections(currentUserId);

    // Separate connected vs pending, and incoming vs outgoing pending
    const connectedConnections: ConnectionData[] = [];
    const incomingPendingRequests: ConnectionData[] = [];
    const outgoingPendingRequests: ConnectionData[] = [];

    allConnections.forEach(connection => {
      // Determine which user is the "other" user
      const isFromUser = connection.fromUserId === currentUserId;
      const otherUser = isFromUser ? connection.toUser : connection.fromUser;
      
      const formattedConnection: ConnectionData = {
        id: connection.id,
        status: connection.status,
        initiatedBy: connection.initiatedBy,
        createdAt: connection.createdAt,
        notes: connection.notes ? sanitizeText(connection.notes) : null,
        isInitiator: isFromUser,
        // Include other user's safe profile data
        otherUser: {
          userId: otherUser.id,
          fullName: otherUser.athleteProfile?.fullName || 
                    otherUser.coachProfile?.fullName || 
                    otherUser.recruitingProfile?.fullName || '',
          profileImage: otherUser.athleteProfile?.profileImageR3Key || 
                        otherUser.coachProfile?.profileImageR3Key || 
                        otherUser.recruitingProfile?.profileImageR3Key || null,
          organizationName: otherUser.athleteProfile?.organizationName || 
                            otherUser.coachProfile?.organizationName || 
                            otherUser.recruitingProfile?.organizationName || '',
          title: otherUser.coachProfile?.title || 
                 otherUser.recruitingProfile?.title || '',
          sport: otherUser.athleteProfile?.sport || '',
          city: otherUser.athleteProfile?.city || 
                otherUser.coachProfile?.city || 
                otherUser.recruitingProfile?.city || '',
          state: otherUser.athleteProfile?.state || 
                 otherUser.coachProfile?.state || 
                 otherUser.recruitingProfile?.state || '',
          graduationYear: otherUser.athleteProfile?.graduationYear || null,
          educationLevel: otherUser.athleteProfile?.educationLevel || '',
          division: otherUser.coachProfile?.division || 
                    otherUser.recruitingProfile?.division || '',
          isVerified: otherUser.athleteProfile?.isVerified || 
                     otherUser.coachProfile?.isVerified || 
                     otherUser.recruitingProfile?.isVerified || false,
          role: otherUser.role
        }
      };

      if (connection.status === 'connected') {
        connectedConnections.push(formattedConnection);
      } else if (connection.status === 'pending') {
        if (isFromUser) {
          outgoingPendingRequests.push(formattedConnection);
        } else {
          incomingPendingRequests.push(formattedConnection);
        }
      }
    });

    const result: ConnectionsResponse = {
      connected: connectedConnections,
      incoming: incomingPendingRequests,
      outgoing: outgoingPendingRequests,
      counts: {
        connected: connectedConnections.length,
        incoming: incomingPendingRequests.length,
        outgoing: outgoingPendingRequests.length
      }
    };

    // Cache the result
    await setCachedWithType(cacheKey, result, 'userConnections');

    return createSuccessResponse(result, rateLimitCheck.headers);

  } catch (error) {
    console.error('Error fetching connections:', error);
    return createErrorResponse('Failed to fetch connections', 500);
  }
}

// Delete/reject a connection
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId: currentUserId, role } = authResult;
    
    // Apply rate limiting for connection operations
    const rateLimitCheck = await withRateLimit(request, 'connections', currentUserId, role);
    if (!rateLimitCheck.success) return rateLimitCheck.response;

    // Try to get connectionId from query params first, then from body
    const { searchParams } = new URL(request.url);
    let connectionId = searchParams.get('connectionId');
    let targetUserId = null;

    // If no connectionId in query params, try to get from request body
    if (!connectionId) {
      try {
        const body = await request.json();
        connectionId = body.connectionId;
        targetUserId = body.targetUserId;
      } catch {
        // Body might not be JSON
      }
    }

    if (!connectionId && !targetUserId) {
      return createErrorResponse('Connection ID or Target User ID is required', 400);
    }

    // Delete the connection
    const deleted = await connectionOperations.deleteConnection(currentUserId, targetUserId || '');

    if (!deleted) {
      return createErrorResponse('Connection not found or unauthorized', 404);
    }

    // Invalidate connections cache
    await invalidateCachePattern(`connections:${currentUserId}*`);

    return createSuccessResponse({
      success: true,
      message: 'Connection deleted successfully'
    }, rateLimitCheck.headers);

  } catch (error) {
    console.error('Error deleting connection:', error);
    return createErrorResponse('Failed to delete connection', 500);
  }
}

// Accept a connection request
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId: currentUserId, role } = authResult;
    
    // Apply rate limiting for connection operations
    const rateLimitCheck = await withRateLimit(request, 'connections', currentUserId, role);
    if (!rateLimitCheck.success) return rateLimitCheck.response;

    const body = await request.json();
    const { connectionId } = body;

    if (!connectionId) {
      return createErrorResponse('Connection ID is required', 400);
    }

    // Update the connection status from pending to connected
    const connection = await connectionOperations.updateConnectionStatusById(
      parseInt(connectionId),
      currentUserId,
      'connected'
    );

    if (!connection) {
      return createErrorResponse('Connection not found or unauthorized', 404);
    }

    // Invalidate connections cache for both users
    await Promise.all([
      invalidateCachePattern(`connections:${currentUserId}*`),
      invalidateCachePattern(`connections:*`)
    ]);

    return createSuccessResponse({
      success: true,
      connection: {
        id: connection.id,
        status: connection.status,
        createdAt: connection.createdAt
      }
    }, rateLimitCheck.headers);

  } catch (error) {
    console.error('Error accepting connection:', error);
    return createErrorResponse('Failed to accept connection', 500);
  }
} 