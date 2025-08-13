import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { connectionOperations } from '@/database/db-utils';
import { sanitizeText } from '@/utils/sanitization';
import { withRateLimit } from '@/utils/security';
import { getCachedWithType, setCachedWithType, createErrorResponse, createSuccessResponse } from '@/utils/security';

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

// Helper function to check if connection matches filters
function matchesFilters(
  connection: FilteredConnectionData,
  filters: {
    sports?: string[];
    divisions?: string[];
    countries?: string[];
    states?: string[];
    positions?: string[];
    graduatingClasses?: string[];
    conferences?: string[];
    requestTypes?: string[];
    minHeight?: number;
    minWeight?: number;
  }
): boolean {
  const { otherUser } = connection;

  // Sports filter
  if (filters.sports && filters.sports.length > 0) {
    if (!otherUser.sport || !filters.sports.includes(otherUser.sport)) {
      return false;
    }
  }

  // Divisions filter
  if (filters.divisions && filters.divisions.length > 0) {
    if (!otherUser.division || !filters.divisions.includes(otherUser.division)) {
      return false;
    }
  }

  // Countries filter
  if (filters.countries && filters.countries.length > 0) {
    // For connections, we assume most are US-based unless specified
    const userCountry = otherUser.country || 'United States';
    if (!filters.countries.includes(userCountry)) {
      return false;
    }
  }

  // States filter (only if US is selected in countries)
  if (filters.states && filters.states.length > 0) {
    const userCountry = otherUser.country || 'United States';
    if (userCountry === 'United States') {
      if (!otherUser.state || !filters.states.includes(otherUser.state)) {
        return false;
      }
    }
  }

  // Positions filter (only for athletes)
  if (filters.positions && filters.positions.length > 0 && otherUser.role === 'athlete') {
    if (!otherUser.positions || !otherUser.positions.some(pos => filters.positions!.includes(pos))) {
      return false;
    }
  }

  // Graduating classes filter (only for athletes)
  if (filters.graduatingClasses && filters.graduatingClasses.length > 0 && otherUser.role === 'athlete') {
    if (!otherUser.graduationYear || !filters.graduatingClasses.includes(otherUser.graduationYear.toString())) {
      return false;
    }
  }

  // Request types filter (filter by role)
  if (filters.requestTypes && filters.requestTypes.length > 0) {
    if (!filters.requestTypes.includes(otherUser.role)) {
      return false;
    }
  }

  // Height filter (only for athletes, admin only feature)
  if (filters.minHeight && otherUser.role === 'athlete' && otherUser.height) {
    // Parse height string like "6'2"" to inches
    const heightMatch = otherUser.height.match(/(\d+)'(\d+)"/);
    if (heightMatch) {
      const feet = parseInt(heightMatch[1]);
      const inches = parseInt(heightMatch[2]);
      const totalInches = feet * 12 + inches;
      if (totalInches < filters.minHeight) {
        return false;
      }
    }
  }

  // Weight filter (only for athletes, admin only feature)
  if (filters.minWeight && otherUser.role === 'athlete' && otherUser.weight) {
    // Parse weight string like "185 lbs" to number
    const weightMatch = otherUser.weight.match(/(\d+)/);
    if (weightMatch) {
      const weight = parseInt(weightMatch[1]);
      if (weight < filters.minWeight) {
        return false;
      }
    }
  }

  return true;
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

    // Parse filters from request body
    const body = await request.json();
    const {
      sports = [],
      divisions = [],
      countries = [],
      states = [],
      positions = [],
      graduatingClasses = [],
      conferences = [],
      requestTypes = [],
      minHeight,
      minWeight
    } = body;

    // Sanitize filter inputs
    const sanitizedFilters = {
      sports: sports.map((s: string) => sanitizeText(s)),
      divisions: divisions.map((d: string) => sanitizeText(d)),
      countries: countries.map((c: string) => sanitizeText(c)),
      states: states.map((s: string) => sanitizeText(s)),
      positions: positions.map((p: string) => sanitizeText(p)),
      graduatingClasses: graduatingClasses.map((gc: string) => sanitizeText(gc)),
      conferences: conferences.map((c: string) => sanitizeText(c)),
      requestTypes: requestTypes.map((rt: string) => sanitizeText(rt)),
      minHeight: typeof minHeight === 'number' ? minHeight : undefined,
      minWeight: typeof minWeight === 'number' ? minWeight : undefined
    };

    // Check cache first (only if no filters applied)
    const hasFilters = Object.values(sanitizedFilters).some(arr => arr.length > 0);
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

    // Get connections from database
    const allConnections = await connectionOperations.getUserConnections(currentUserId);

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

      // Apply filters
      if (!hasFilters || matchesFilters(formattedConnection, sanitizedFilters)) {
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
