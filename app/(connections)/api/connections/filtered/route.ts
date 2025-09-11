import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { connectionOperations } from '@/database/db-utils';
import { sanitizeText } from '@/utils/sanitization';
import { withRateLimit } from '@/utils/security';
import { getCachedWithType, setCachedWithType, createErrorResponse, createSuccessResponse } from '@/utils/security';
import { parseHeightToInches, parseWeightToPounds } from '@/lib/parsing-utils';
import { SubscriptionService } from '@/lib/subscription-service';

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
  verified?: unknown;
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
  verified: boolean | null;
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
    // Handle string inputs that can be converted to numbers
    let numValue: number;
    
    if (typeof num === 'number') {
      numValue = num;
    } else if (typeof num === 'string') {
      const parsed = parseFloat(num);
      if (isNaN(parsed)) return undefined;
      numValue = parsed;
    } else {
      return undefined;
    }
    
    // Validate range
    if (numValue < min || numValue > max || !isFinite(numValue)) return undefined;
    return Math.floor(numValue);
  };

  const validateBoolean = (value: unknown): boolean | null => {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
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
    minHeight: validateNumber(filters.minHeight, 48, 96),
    minWeight: validateNumber(filters.minWeight, 50, 500),
    verified: validateBoolean(filters.verified),
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
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate that body is an object
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    const sanitizedFilters = validateAndSanitizeFilters(body);

    // Check subscription features for premium filters
    const hasPhysicalRequirements = sanitizedFilters.minHeight || sanitizedFilters.minWeight;
    const hasVerifiedFilter = sanitizedFilters.verified !== null;
    
    if (hasPhysicalRequirements || hasVerifiedFilter) {
      const hasAdvancedSearchAccess = await SubscriptionService.hasFeatureAccess(
        currentUserId,
        'advancedSearch'
      );
      
      if (!hasAdvancedSearchAccess) {
        return NextResponse.json(
          {
            success: false,
            error: 'Premium subscription required for advanced search features',
            premium: {
              required: true,
              feature: 'advancedSearch',
              message: 'Upgrade to filter by physical requirements and verified status',
              availableFeatures: [
                'Physical requirement filters (height/weight)',
                'Verified athlete status filtering',
                'Advanced search capabilities'
              ]
            }
          },
          { status: 403, headers: rateLimitCheck.headers }
        );
      }
    }

    // Check cache first (only if no filters applied)
    const hasBasicFilters = sanitizedFilters.sports.length > 0 ||
                           sanitizedFilters.divisions.length > 0 ||
                           sanitizedFilters.states.length > 0 ||
                           sanitizedFilters.requestTypes.length > 0;
    const hasAdvancedFilters = sanitizedFilters.positions.length > 0 ||
                              sanitizedFilters.graduatingClasses.length > 0 ||
                              sanitizedFilters.conferences.length > 0 ||
                              sanitizedFilters.minHeight ||
                              sanitizedFilters.minWeight ||
                              sanitizedFilters.verified !== null;
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

    // Early exit if no connections
    if (allConnections.length === 0) {
      const emptyResponse = {
        connected: [],
        incoming: [],
        outgoing: [],
        counts: { connected: 0, incoming: 0, outgoing: 0 }
      };
      
      if (cacheKey) {
        await setCachedWithType(cacheKey, emptyResponse, 'userConnections');
      }
      
      return createSuccessResponse({
        success: true,
        ...emptyResponse
      }, rateLimitCheck.headers);
    }

    // Transform and filter connections efficiently
    const connectedConnections: FilteredConnectionData[] = [];
    const incomingPendingRequests: FilteredConnectionData[] = [];
    const outgoingPendingRequests: FilteredConnectionData[] = [];

    allConnections.forEach(connection => {
      // Determine which user is the "other" user
      const isFromUser = connection.fromUserId === currentUserId;
      const otherUser = isFromUser ? connection.toUser : connection.fromUser;
      
      // Early filtering for advanced filters to avoid unnecessary object creation
      if (hasAdvancedFilters) {
        // Quick rejection based on advanced filters
        if (sanitizedFilters.positions.length > 0 && otherUser.role === 'athlete') {
          const userPositions = otherUser.athleteProfile?.positions || [];
          if (!userPositions.some((pos: string) => sanitizedFilters.positions.includes(pos))) {
            return; // Skip this connection
          }
        }
        
        if (sanitizedFilters.graduatingClasses.length > 0 && otherUser.role === 'athlete') {
          const userGradYear = otherUser.athleteProfile?.graduationYear?.toString();
          if (!userGradYear || !sanitizedFilters.graduatingClasses.includes(userGradYear)) {
            return; // Skip this connection
          }
        }
        
        if (sanitizedFilters.conferences.length > 0 && 
            (otherUser.role === 'coach' || otherUser.role === 'recruiter')) {
          // Conference filtering is not yet available in the current schema
          // Skip this filter for now
        }
        
        if (sanitizedFilters.minHeight && otherUser.role === 'athlete') {
          const userHeightInches = parseHeightToInches(otherUser.athleteProfile?.height);
          if (userHeightInches === null || userHeightInches < sanitizedFilters.minHeight) {
            return; // Skip this connection
          }
        }
        
        if (sanitizedFilters.minWeight && otherUser.role === 'athlete') {
          const userWeightPounds = parseWeightToPounds(otherUser.athleteProfile?.weight);
          if (userWeightPounds === null || userWeightPounds < sanitizedFilters.minWeight) {
            return; // Skip this connection
          }
        }
        
        if (sanitizedFilters.verified !== null && otherUser.role === 'athlete') {
          const isVerified = Boolean(otherUser.athleteProfile?.isVerified);
          if (sanitizedFilters.verified !== isVerified) {
            return; // Skip this connection
          }
        }
      }
      
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

      // Advanced filters already applied above, so add to appropriate array
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

    // Get user's subscription features for response
    const [hasAdvancedSearchAccess] = await Promise.all([
      SubscriptionService.hasFeatureAccess(currentUserId, 'advancedSearch')
    ]);

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
      ...result,
      premium: {
        hasAdvancedSearch: hasAdvancedSearchAccess,
        availableFeatures: hasAdvancedSearchAccess ? [
          'Physical requirement filters (height/weight)',
          'Verified athlete status filtering',
          'Advanced search capabilities'
        ] : ['Upgrade to unlock advanced search features']
      }
    }, rateLimitCheck.headers);

  } catch (error) {
    console.error('Error fetching filtered connections:', error);
    return createErrorResponse('Failed to fetch filtered connections', 500);
  }
}
