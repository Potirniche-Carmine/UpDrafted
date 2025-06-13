import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { connectionOperations, userOperations } from '@/database/db-utils';
import { sanitizeText } from '@/utils/sanitization';
import { rateLimitMiddleware, addRateLimitHeaders } from '@/utils/rate-limiting';

export const runtime = 'nodejs';

// Create a new connection request
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId: currentUserId, role } = authResult;
    
    // Apply rate limiting for connection operations
    const rateLimitCheck = await rateLimitMiddleware('connections')(request, currentUserId, role);
    if (rateLimitCheck) return rateLimitCheck;

    // Parse request body with size limits
    const body = await request.json();
    const { targetUserId, note } = body;

    // Validate required fields
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }

    // SECURITY: Prevent self-connections
    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot connect to yourself' },
        { status: 400 }
      );
    }

    // Sanitize the note to prevent XSS
    const sanitizedNote = note ? sanitizeText(note) : undefined;
    
    // Validate note length
    if (sanitizedNote && sanitizedNote.length > 500) {
      return NextResponse.json(
        { error: 'Note must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Get both users' profiles to determine types and validate connection rules
    const [currentUser, targetUser] = await Promise.all([
      userOperations.getUserWithProfile(currentUserId),
      userOperations.getUserWithProfile(targetUserId)
    ]);

    if (!currentUser || !targetUser) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }

    // SECURITY: Only prevent athlete-to-athlete connections
    if (currentUser.role === 'athlete' && targetUser.role === 'athlete') {
      return NextResponse.json(
        { error: 'Athletes cannot connect to other athletes' },
        { status: 400 }
      );
    }

    // Create the connection using user IDs
    const connection = await connectionOperations.createConnection(
      currentUserId,
      targetUserId,
      currentUser.role === 'athlete' ? 'athlete' : 'coach',
      sanitizedNote
    );

    const response = NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        status: connection.status,
        initiatedBy: connection.initiatedBy,
        createdAt: connection.createdAt,
        notes: connection.notes
      }
    });
    
    // Add rate limit headers to response
    return addRateLimitHeaders(response, currentUserId, role, 'connections');

  } catch (error) {
    console.error('Error creating connection:', error);
    
    // Handle database constraint violations (e.g., duplicate connection)
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'Connection already exists between these users' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}

// Get user's connections
export async function GET() {
  try {
    // Verify authentication
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId: currentUserId } = authResult;

    // Get connections based on user type - now using the new user-based approach
    const allConnections = await connectionOperations.getUserConnections(currentUserId);

    // Separate connected vs pending, and incoming vs outgoing pending
    const connectedConnections: {
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
    }[] = [];
    const incomingPendingRequests: typeof connectedConnections = [];
    const outgoingPendingRequests: typeof connectedConnections = [];

    allConnections.forEach(connection => {
      // Determine which user is the "other" user
      const isFromUser = connection.fromUserId === currentUserId;
      const otherUser = isFromUser ? connection.toUser : connection.fromUser;
      
      const formattedConnection = {
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
          // This user initiated the request (outgoing)
          outgoingPendingRequests.push(formattedConnection);
        } else {
          // The other user initiated the request (incoming)
          incomingPendingRequests.push(formattedConnection);
        }
      }
    });

    return NextResponse.json({
      success: true,
      connections: connectedConnections,
      pendingRequests: incomingPendingRequests,
      sentRequests: outgoingPendingRequests
    });

  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

// Delete a connection
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId: currentUserId } = authResult;

    // Parse request body
    const body = await request.json();
    const { targetUserId } = body;

    // Validate required fields
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }

    // Delete the connection using user IDs
    const deletedConnection = await connectionOperations.deleteConnection(
      currentUserId, 
      targetUserId
    );

    if (!deletedConnection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Connection removed successfully'
    });

  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}

// Accept a pending connection request
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId: currentUserId } = authResult;

    // Parse request body
    const body = await request.json();
    const { fromUserId } = body;

    // Validate required fields
    if (!fromUserId) {
      return NextResponse.json(
        { error: 'From user ID is required' },
        { status: 400 }
      );
    }

    // Update the connection status from pending to connected
    const updatedConnection = await connectionOperations.updateConnectionStatus(
      fromUserId, 
      currentUserId,
      'connected'
    );

    if (!updatedConnection) {
      return NextResponse.json(
        { error: 'Pending connection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Connection request accepted successfully',
      connection: {
        id: updatedConnection.id,
        status: updatedConnection.status,
        initiatedBy: updatedConnection.initiatedBy,
        createdAt: updatedConnection.createdAt
      }
    });

  } catch (error) {
    console.error('Error accepting connection:', error);
    return NextResponse.json(
      { error: 'Failed to accept connection' },
      { status: 500 }
    );
  }
} 