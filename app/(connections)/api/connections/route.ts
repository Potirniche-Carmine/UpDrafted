import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { connectionOperations, userOperations, messageOperations, notificationOperations } from '@/database/db-utils';
import { sanitizeText } from '@/utils/sanitization';
import { withRateLimit } from '@/utils/security';
import { getCachedWithType, setCachedWithType, invalidateCachePattern, createErrorResponse, createSuccessResponse } from '@/utils/security';
import { getPartnerUserId, getOriginalRequesterId } from '@/utils/connection-utils';

export const runtime = 'nodejs';

// Extended profile types to include conference field
interface AthleteProfileWithConference {
  fullName: string;
  profileImageR3Key: string | null;
  sport: string;
  graduationYear: number;
  educationLevel: string;
  city: string;
  state: string;
  isVerified: boolean;
  height?: string;
  weight?: string;
  positions?: string[];
  conference?: string;
  school?: {
    id: number;
    name: string;
  };
}

interface CoachProfileWithConference {
  fullName: string;
  profileImageR3Key: string | null;
  title: string;
  sportCoaching: string;
  city: string;
  state: string;
  division: string;
  isVerified: boolean;
  conference?: string;
  school?: {
    id: number;
    name: string;
  };
}

interface RecruitingProfileWithConference {
  fullName: string;
  profileImageR3Key: string | null;
  title: string;
  sportRecruiting: string;
  city: string;
  state: string;
  division: string;
  isVerified: boolean;
  conference?: string;
  school?: {
    id: number;
    name: string;
  };
}

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
    conference?: string;
    isVerified: boolean;
    role: string;
    height?: string;
    weight?: string;
    positions?: string[];
    recruitingNeeds?: {
      studentClassifications: string[];
      positions: string[];
      scholarshipsAvailable: number | null;
    };
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
    // Verify authentication (middleware already handled auth.protect())
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

    // TRANSFER PORTAL VERIFICATION: Check if target athlete requires transfer portal verification
    if (targetUser.role === 'athlete' && targetUser.athleteProfile) {
      const educationLevel = targetUser.athleteProfile.educationLevel;
      const division = targetUser.athleteProfile.division;

      // Only D1, D2, and D3 college athletes need transfer portal verification
      if ((educationLevel === 'undergraduate' || educationLevel === 'graduate') &&
        division &&
        ['division_1', 'division_2', 'division_3'].includes(division)) {
        if (!targetUser.athleteProfile.isOnTransferPortal) {
          return createErrorResponse(
            'This athlete must be verified for NCAA Transfer Portal before connections can be made. They need to complete transfer portal verification first.',
            403
          );
        }
      }
    }

    // Check if user can send connection request (7-day cooldown after withdrawal)
    const cooldownCheck = await connectionOperations.canSendConnectionRequest(currentUserId, targetUserId);
    if (!cooldownCheck.canSend) {
      if (cooldownCheck.hoursRemaining) {
        const days = Math.floor(cooldownCheck.hoursRemaining / 24);
        const hours = cooldownCheck.hoursRemaining % 24;
        const timeRemaining = days > 0 ? `${days} day(s) and ${hours} hour(s)` : `${hours} hour(s)`;
        return createErrorResponse(
          `You must wait ${timeRemaining} before sending another connection request to this person. This prevents spam and allows time for meaningful connections.`,
          429
        );
      }
      return createErrorResponse('Connection request already exists', 409);
    }

    // Create the connection using user IDs
    const connection = await connectionOperations.createConnection(
      currentUserId,
      targetUserId,
      currentUser.role === 'athlete' ? 'athlete' : 'coach',
      sanitizedNote
    );

    // Create notification for the recipient of the connection request
    try {
      await notificationOperations.createConnectionNotification(
        targetUserId,
        currentUserId,
        'newConnection',
        connection.id
      );
    } catch (notificationError) {
      console.error('Error creating connection notification:', notificationError);
      // Don't fail the connection creation if notification fails
    }

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

    // Parse filters from query parameters
    const { searchParams } = new URL(request.url);
    const sports = searchParams.getAll('sports');
    const divisions = searchParams.getAll('divisions');
    const states = searchParams.getAll('states');
    const countries = searchParams.getAll('countries');
    const positions = searchParams.getAll('positions');
    const graduatingClasses = searchParams.getAll('graduatingClasses');
    const conferences = searchParams.getAll('conferences');
    const requestTypes = searchParams.getAll('requestTypes');
    const minHeight = searchParams.get('minHeight') ? parseInt(searchParams.get('minHeight')!, 10) : undefined;
    const minWeight = searchParams.get('minWeight') ? parseInt(searchParams.get('minWeight')!, 10) : undefined;

    const filters = {
      sports: sports.length > 0 ? sports : undefined,
      divisions: divisions.length > 0 ? divisions : undefined,
      states: states.length > 0 ? states : undefined,
      countries: countries.length > 0 ? countries : undefined,
      positions: positions.length > 0 ? positions : undefined,
      graduatingClasses: graduatingClasses.length > 0 ? graduatingClasses : undefined,
      conferences: conferences.length > 0 ? conferences : undefined,
      requestTypes: requestTypes.length > 0 ? requestTypes : undefined,
      minHeight,
      minWeight,
    };

    const hasFilters = Object.values(filters).some(v => v !== undefined && (!Array.isArray(v) || v.length > 0));

    // Generate a more specific cache key if filters are applied
    const cacheKey = hasFilters
      ? `connections:${currentUserId}:${JSON.stringify(filters)}`
      : `connections:${currentUserId}:all`;

    if (hasFilters) {
      // When filters are applied, we bypass the main cache for now
      // to ensure fresh, filtered data is always served.
      // Caching for filtered results can be complex and might be added later.
    } else {
      const cachedConnections = await getCachedWithType<ConnectionsResponse>(cacheKey);
      if (cachedConnections) {
        return createSuccessResponse({
          success: true,
          ...cachedConnections
        }, rateLimitCheck.headers);
      }
    }

    // Get connections using the appropriate db-util function
    const allConnections = await connectionOperations.getFilteredUserConnections(currentUserId, filters);

    // Process connections (same logic as before)
    const connectedConnections: ConnectionData[] = [];
    const incomingPendingRequests: ConnectionData[] = [];
    const outgoingPendingRequests: ConnectionData[] = [];

    allConnections.forEach(connection => {
      const isFromUser = connection.fromUserId === currentUserId;
      const otherUser = isFromUser ? connection.toUser : connection.fromUser;

      const formattedConnection: ConnectionData = {
        id: connection.id,
        status: connection.status,
        initiatedBy: connection.initiatedBy,
        createdAt: connection.createdAt,
        notes: connection.notes ? sanitizeText(connection.notes) : null,
        isInitiator: isFromUser,
        otherUser: {
          userId: otherUser.id,
          fullName: otherUser.athleteProfile?.fullName ||
            otherUser.coachProfile?.fullName ||
            otherUser.recruitingProfile?.fullName || '',
          profileImage: otherUser.athleteProfile?.profileImageR3Key ||
            otherUser.coachProfile?.profileImageR3Key ||
            otherUser.recruitingProfile?.profileImageR3Key || null,
          organizationName: otherUser.athleteProfile?.school?.name ||
            otherUser.coachProfile?.school?.name ||
            otherUser.recruitingProfile?.school?.name || '',
          title: otherUser.coachProfile?.title ||
            otherUser.recruitingProfile?.title || '',
          sport: otherUser.athleteProfile?.sport ||
            otherUser.coachProfile?.sportCoaching ||
            otherUser.recruitingProfile?.sportRecruiting || '',
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
          conference: (otherUser.athleteProfile && (otherUser.athleteProfile as AthleteProfileWithConference).conference) ||
            (otherUser.coachProfile && (otherUser.coachProfile as CoachProfileWithConference).conference) ||
            (otherUser.recruitingProfile && (otherUser.recruitingProfile as RecruitingProfileWithConference).conference) || undefined,
          isVerified: otherUser.athleteProfile?.isVerified ||
            otherUser.coachProfile?.isVerified ||
            otherUser.recruitingProfile?.isVerified || false,
          role: otherUser.role || 'athlete',
          height: otherUser.athleteProfile?.height || undefined,
          weight: otherUser.athleteProfile?.weight || undefined,
          positions: otherUser.athleteProfile?.positions || undefined,
          recruitingNeeds: (() => {
            if (otherUser.role === 'coach' && otherUser.coachProfile?.recruitingNeeds) {
              return {
                studentClassifications: otherUser.coachProfile.recruitingNeeds.studentClassifications || [],
                positions: otherUser.coachProfile.recruitingNeeds.positions || [],
                scholarshipsAvailable: otherUser.coachProfile.recruitingNeeds.scholarshipsAvailable || null,
              };
            } else if (otherUser.role === 'recruiter' && otherUser.recruitingProfile?.recruitingNeeds) {
              const mainSportNeeds = otherUser.recruitingProfile.recruitingNeeds.find(
                need => need.sport === otherUser.recruitingProfile?.sportRecruiting
              );
              if (mainSportNeeds) {
                return {
                  studentClassifications: mainSportNeeds.studentClassifications || [],
                  positions: mainSportNeeds.positions || [],
                  scholarshipsAvailable: mainSportNeeds.scholarshipsAvailable || null,
                };
              }
            }
            return undefined;
          })(),
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

    // Cache the result only if no filters were applied
    if (!hasFilters) {
      await setCachedWithType(cacheKey, result, 'userConnections');
    }

    return createSuccessResponse({
      success: true,
      ...result
    }, rateLimitCheck.headers);

  } catch (error) {
    console.error('Error fetching connections:', error);
    return createErrorResponse('Failed to fetch connections', 500);
  }
}

// Delete/reject a connection
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication (middleware already handled auth.protect())
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

    // Delete the connection and log withdrawal for cooldown tracking
    const deleted = await connectionOperations.withdrawConnection(currentUserId, targetUserId || '');

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
    // Verify authentication (middleware already handled auth.protect())
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

    // Create notification for the original requester that their connection was accepted
    const originalRequesterId = getOriginalRequesterId(currentUserId, connection);
    try {
      await notificationOperations.createConnectionNotification(
        originalRequesterId,
        currentUserId,
        'connectionAccepted',
        connection.id
      );
    } catch (notificationError) {
      console.error('Error creating connection accepted notification:', notificationError);
      // Don't fail the connection acceptance if notification fails
    }

    // Invalidate connections cache for both users
    await Promise.all([
      invalidateCachePattern(`connections:${currentUserId}*`),
      invalidateCachePattern(`connections:*`)
    ]);

    // Create a conversation when the status is updated to 'connected'
    // Determine the other participant to avoid creating a self-conversation
    const partnerUserId = getPartnerUserId(currentUserId, connection);

    // Check if a conversation already exists between these users
    const existingConversation = await messageOperations.getConversationByUsers(
      currentUserId,
      partnerUserId
    );

    if (!existingConversation) {
      await messageOperations.createConversation(currentUserId, partnerUserId);
    }

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