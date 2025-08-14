import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { connectionOperations } from '@/database/db-utils';
import { sanitizeText } from '@/utils/sanitization';
import { withRateLimit } from '@/utils/security';
import { getCachedWithType, setCachedWithType, createErrorResponse, createSuccessResponse } from '@/utils/security';
import { parseHeightToInches, parseWeightToPounds } from '@/lib/parsing-utils';

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

interface RawFilterInput {
  sports?: unknown;
  divisions?: unknown;
  countries?: unknown;
  states?: unknown;
  positions?: unknown;
  graduatingClasses?: unknown;
  conferences?: unknown;
  requestTypes?: unknown;
  minHeight?: unknown;
  minWeight?: unknown;
}

interface ValidatedFilters {
  sports: string[];
  divisions: string[];
  countries: string[];
  states: string[];
  positions: string[];
  graduatingClasses: string[];
  conferences: string[];
  requestTypes: string[];
  minHeight: number | undefined;
  minWeight: number | undefined;
}

// Validate and sanitize filter input
function validateAndSanitizeFilters(filters: RawFilterInput): ValidatedFilters {
  const validateArray = (arr: unknown, maxLength = 50): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .slice(0, maxLength)
      .map((item: unknown) => {
        if (typeof item !== 'string') return '';
        return sanitizeText(item);
      })
      .filter(Boolean);
  };

  const validateNumber = (num: unknown, min: number, max: number): number | undefined => {
    if (typeof num !== 'number') return undefined;
    if (num < min || num > max) return undefined;
    return Math.floor(num);
  };

  return {
    sports: validateArray(filters.sports),
    divisions: validateArray(filters.divisions),
    countries: validateArray(filters.countries),
    states: validateArray(filters.states),
    positions: validateArray(filters.positions),
    graduatingClasses: validateArray(filters.graduatingClasses),
    conferences: validateArray(filters.conferences),
    requestTypes: validateArray(filters.requestTypes),
    minHeight: validateNumber(filters.minHeight, 60, 96),
    minWeight: validateNumber(filters.minWeight, 100, 500),
  };
}

// Secure connection filtering function
function secureFilterConnection(connection: FilteredConnectionData, filters: ValidatedFilters): boolean {
  const { otherUser } = connection;

  // Sports filter
  if (filters.sports.length > 0) {
    const userSport = sanitizeText(otherUser.sport || '');
    if (!userSport || !filters.sports.includes(userSport)) {
      return false;
    }
  }

  // Divisions filter
  if (filters.divisions.length > 0) {
    const userDivision = sanitizeText(otherUser.division || '');
    if (!userDivision || !filters.divisions.includes(userDivision)) {
      return false;
    }
  }

  // Countries filter
  if (filters.countries.length > 0) {
    const userCountry = sanitizeText(otherUser.country || 'United States');
    if (!filters.countries.includes(userCountry)) {
      return false;
    }
  }

  // States filter
  if (filters.states.length > 0) {
    const userCountry = sanitizeText(otherUser.country || 'United States');
    if (userCountry === 'United States') {
      const userState = sanitizeText(otherUser.state || '');
      if (!userState || !filters.states.includes(userState)) {
        return false;
      }
    }
  }

  // Positions filter
  if (filters.positions.length > 0 && otherUser.role === 'athlete') {
    if (!Array.isArray(otherUser.positions)) {
      return false;
    }
    const userPositions = otherUser.positions
      .filter((pos: unknown) => typeof pos === 'string' && pos)
      .map((pos: string) => sanitizeText(pos))
      .filter(Boolean);
    
    if (!userPositions.some((pos: string) => filters.positions.includes(pos))) {
      return false;
    }
  }

  // Graduating classes filter
  if (filters.graduatingClasses.length > 0 && otherUser.role === 'athlete') {
    const graduationYear = otherUser.graduationYear;
    if (typeof graduationYear !== 'number' || graduationYear === null || graduationYear === undefined ||
        !filters.graduatingClasses.includes(graduationYear.toString())) {
      return false;
    }
  }

  // Request types filter
  if (filters.requestTypes.length > 0) {
    const userRole = sanitizeText(otherUser.role || '');
    if (!userRole || !filters.requestTypes.includes(userRole)) {
      return false;
    }
  }

  // Height filter
  if (filters.minHeight && otherUser.role === 'athlete') {
    const userHeightInches = parseHeightToInches(otherUser.height);
    if (userHeightInches === null || userHeightInches < filters.minHeight) {
      return false;
    }
  }

  // Weight filter
  if (filters.minWeight && otherUser.role === 'athlete') {
    const userWeightPounds = parseWeightToPounds(otherUser.weight);
    if (userWeightPounds === null || userWeightPounds < filters.minWeight) {
      return false;
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
