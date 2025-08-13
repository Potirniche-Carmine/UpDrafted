import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { connectionOperations } from '@/database/db-utils';
import { sanitizeText } from '@/utils/sanitization';
import { withRateLimit } from '@/utils/security';
import { getCachedWithType, setCachedWithType, createErrorResponse, createSuccessResponse } from '@/utils/security';
import { validateAndSanitizeFilters, secureFilterConnection } from '@/database/secure-filters';

export const runtime = 'nodejs';

interface FilteredConnectionData {
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
    country?: string;
    graduationYear: number | null;
    educationLevel: string;
    division: string;
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

interface FilteredConnectionsResponse {
  connected: FilteredConnectionData[];
  incoming: FilteredConnectionData[];
  outgoing: FilteredConnectionData[];
  counts: { 
    connected: number; 
    incoming: number; 
    outgoing: number; 
  };
}

// Get filtered user's connections
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId: currentUserId, role } = authResult;

    // Apply rate limiting
    const rateLimitCheck = await withRateLimit(request, 'connections', currentUserId, role);
    if (!rateLimitCheck.success) return rateLimitCheck.response;

    // Parse filters from request body and validate/sanitize them
    const body = await request.json();
    const sanitizedFilters = validateAndSanitizeFilters(body);

    // Check cache first (only if no filters applied)
    const hasBasicFilters = sanitizedFilters.sports.length > 0 ||
                           sanitizedFilters.divisions.length > 0 ||
                           sanitizedFilters.states.length > 0 ||
                           sanitizedFilters.requestTypes.length > 0;
    const hasAdvancedFilters = sanitizedFilters.positions.length > 0 ||
                              sanitizedFilters.graduatingClasses.length > 0 ||
                              sanitizedFilters.conferences.length > 0 ||
                              sanitizedFilters.minHeight ||
                              sanitizedFilters.minWeight;
    const hasFilters = hasBasicFilters || hasAdvancedFilters;
    
    const cacheKey = hasFilters ? null : `connections:${currentUserId}:all`;
    
    if (cacheKey) {
      const cachedConnections = await getCachedWithType<FilteredConnectionsResponse>(cacheKey);
      if (cachedConnections) {
        return createSuccessResponse({
          success: true,
          ...cachedConnections
        }, rateLimitCheck.headers);
      }
    }

    // Get connections from database with optimized filtering for basic filters
    const allConnections = hasBasicFilters 
      ? await connectionOperations.getFilteredUserConnections(currentUserId, {
          sports: sanitizedFilters.sports,
          divisions: sanitizedFilters.divisions,
          states: sanitizedFilters.states,
          requestTypes: sanitizedFilters.requestTypes,
        })
      : await connectionOperations.getUserConnections(currentUserId);

    // Transform and filter connections
    const connectedConnections: FilteredConnectionData[] = [];
    const incomingPendingRequests: FilteredConnectionData[] = [];
    const outgoingPendingRequests: FilteredConnectionData[] = [];

    allConnections.forEach(connection => {
      // Determine which user is the "other" user
      const isFromUser = connection.fromUserId === currentUserId;
      const otherUser = isFromUser ? connection.toUser : connection.fromUser;
      
      const formattedConnection: FilteredConnectionData = {
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
          country: 'United States', // Default to US since types don't include country field yet
          graduationYear: otherUser.athleteProfile?.graduationYear || null,
          educationLevel: otherUser.athleteProfile?.educationLevel || '',
          division: otherUser.coachProfile?.division || 
                    otherUser.recruitingProfile?.division || '',
          isVerified: otherUser.athleteProfile?.isVerified || 
                     otherUser.coachProfile?.isVerified || 
                     otherUser.recruitingProfile?.isVerified || false,
          role: otherUser.role,
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

      // Apply advanced filters using secure filtering function (basic filters already applied at DB level)
      const needsAdvancedFiltering = hasAdvancedFilters || (!hasBasicFilters && hasFilters);
      if (!needsAdvancedFiltering || secureFilterConnection(formattedConnection, sanitizedFilters)) {
        if (connection.status === 'connected') {
          connectedConnections.push(formattedConnection);
        } else if (connection.status === 'pending') {
          if (isFromUser) {
            outgoingPendingRequests.push(formattedConnection);
          } else {
            incomingPendingRequests.push(formattedConnection);
          }
        }
      }
    });

    const result: FilteredConnectionsResponse = {
      connected: connectedConnections,
      incoming: incomingPendingRequests,
      outgoing: outgoingPendingRequests,
      counts: {
        connected: connectedConnections.length,
        incoming: incomingPendingRequests.length,
        outgoing: outgoingPendingRequests.length
      }
    };

    // Cache the result only if no filters applied
    if (cacheKey) {
      await setCachedWithType(cacheKey, result, 'userConnections');
    }

    return createSuccessResponse({
      success: true,
      ...result
    }, rateLimitCheck.headers);

  } catch (error) {
    console.error('Error fetching filtered connections:', error);
    return createErrorResponse('Failed to fetch filtered connections', 500);
  }
}
