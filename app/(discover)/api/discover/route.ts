import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { db } from '@/database/db';
import { users, athleteProfiles, coachProfiles, recruitingProfiles, connections, recruitingProfileNeeds, recruitingNeeds, schools } from '@/database/schema';
import { and, eq, or, not, ilike, isNull, exists, ne, arrayOverlaps, sql } from 'drizzle-orm';
import { sanitizeText, sanitizeNumber } from '@/utils/sanitization';
import { withRateLimit } from '@/utils/security';
import { createHeightFilter, createWeightFilter } from '@/database/db-utils';

// Force Node.js runtime
export const runtime = 'nodejs';

// Validation error class for clearer client feedback
class RequestValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'RequestValidationError';
    this.status = status;
  }
}

// Security limits
const MAX_URL_LENGTH = 8192;
const MAX_QUERY_LENGTH = 4096;
const MAX_BODY_SIZE = 1024 * 10; // 10KB limit for POST request bodies
// Max total parameters (including array entries) to mitigate parameter pollution
const MAX_QUERY_PARAMS = 300;
// Per-array caps for POST bodies
const MAX_FILTER_ITEMS = 200;
const ALLOWED_BODY_KEYS = new Set(['query', 'page', 'pageSize', 'role', 'sports', 'divisions', 'countries', 'states', 'positions', 'graduatingClasses', 'conferences', 'minHeight', 'minWeight']);

// Helper function to parse search parameters from either GET query params or POST body
async function parseSearchParams(request: NextRequest) {
  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url);
    // Optional: defensive count of total params for GET as well
    const totalParams = Array.from(searchParams).length;
    if (totalParams > MAX_QUERY_PARAMS) {
      throw new RequestValidationError('Too many parameters in query string');
    }

    return {
      query: sanitizeText(searchParams.get('query') || ''),
      page: Math.min(Math.max(sanitizeNumber(searchParams.get('page'), 1, 100) || 1, 1), 100),
      pageSize: Math.min(Math.max(sanitizeNumber(searchParams.get('pageSize'), 1, 50) || 10, 1), 50),
      requestedRole: searchParams.get('role') as 'athlete' | 'coach' | 'recruiter' | null,
      sports: searchParams.getAll('sports').map(s => sanitizeText(s)).filter(Boolean),
      divisions: searchParams.getAll('divisions').map(d => sanitizeText(d)).filter(Boolean),
      countries: searchParams.getAll('countries').map(c => sanitizeText(c)).filter(Boolean),
      states: searchParams.getAll('states').map(s => sanitizeText(s)).filter(Boolean),
      positions: searchParams.getAll('positions').map(p => sanitizeText(p)).filter(Boolean),
      graduatingClasses: searchParams.getAll('graduatingClasses').map(gc => sanitizeText(gc)).filter(Boolean),
      conferences: searchParams.getAll('conferences').map(c => sanitizeText(c)).filter(Boolean),
      minHeight: sanitizeNumber(searchParams.get('minHeight'), 60, 96),
      minWeight: sanitizeNumber(searchParams.get('minWeight'), 100, 500)
    };
  } else {
    // POST request - parse from body
    try {
      const body = await request.json();

      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new RequestValidationError('Request body must be a JSON object');
      }

      // Reject unknown parameters to prevent pollution
      const unknownKeys = Object.keys(body).filter((k) => !ALLOWED_BODY_KEYS.has(k));
      if (unknownKeys.length > 0) {
        throw new RequestValidationError(`Unknown parameter(s): ${unknownKeys.join(', ')}`);
      }

      // Validate individual fields for clearer errors
      if (body.page !== undefined && sanitizeNumber(body.page, 1, 100) === null) {
        throw new RequestValidationError('Invalid page: must be a number between 1 and 100');
      }
      if (body.pageSize !== undefined && sanitizeNumber(body.pageSize, 1, 50) === null) {
        throw new RequestValidationError('Invalid pageSize: must be a number between 1 and 50');
      }
      if (body.role !== undefined && body.role !== null && !['athlete', 'coach', 'recruiter'].includes(sanitizeText(String(body.role)))) {
        throw new RequestValidationError('Invalid role specified');
      }

      const sportsArray = Array.isArray(body.sports) ? body.sports : [];
      const divisionsArray = Array.isArray(body.divisions) ? body.divisions : [];
      const countriesArray = Array.isArray(body.countries) ? body.countries : [];
      const statesArray = Array.isArray(body.states) ? body.states : [];
      const positionsArray = Array.isArray(body.positions) ? body.positions : [];
      const graduatingClassesArray = Array.isArray(body.graduatingClasses) ? body.graduatingClasses : [];
      const conferencesArray = Array.isArray(body.conferences) ? body.conferences : [];

      if (body.sports !== undefined && !Array.isArray(body.sports)) {
        throw new RequestValidationError('Invalid sports: must be an array of strings');
      }
      if (body.divisions !== undefined && !Array.isArray(body.divisions)) {
        throw new RequestValidationError('Invalid divisions: must be an array of strings');
      }
      if (body.countries !== undefined && !Array.isArray(body.countries)) {
        throw new RequestValidationError('Invalid countries: must be an array of strings');
      }
      if (body.states !== undefined && !Array.isArray(body.states)) {
        throw new RequestValidationError('Invalid states: must be an array of strings');
      }
      if (body.positions !== undefined && !Array.isArray(body.positions)) {
        throw new RequestValidationError('Invalid positions: must be an array of strings');
      }
      if (body.graduatingClasses !== undefined && !Array.isArray(body.graduatingClasses)) {
        throw new RequestValidationError('Invalid graduatingClasses: must be an array of strings');
      }
      if (body.conferences !== undefined && !Array.isArray(body.conferences)) {
        throw new RequestValidationError('Invalid conferences: must be an array of strings');
      }
      if (body.minHeight !== undefined && sanitizeNumber(body.minHeight, 60, 96) === null) {
        throw new RequestValidationError('Invalid minHeight: must be a number between 60 and 96 inches');
      }
      if (body.minWeight !== undefined && sanitizeNumber(body.minWeight, 100, 500) === null) {
        throw new RequestValidationError('Invalid minWeight: must be a number between 100 and 500 pounds');
      }

      if (sportsArray.length > MAX_FILTER_ITEMS) {
        throw new RequestValidationError(`Too many sports selected. Max ${MAX_FILTER_ITEMS}.`);
      }
      if (divisionsArray.length > MAX_FILTER_ITEMS) {
        throw new RequestValidationError(`Too many divisions selected. Max ${MAX_FILTER_ITEMS}.`);
      }
      if (countriesArray.length > MAX_FILTER_ITEMS) {
        throw new RequestValidationError(`Too many countries selected. Max ${MAX_FILTER_ITEMS}.`);
      }
      if (statesArray.length > MAX_FILTER_ITEMS) {
        throw new RequestValidationError(`Too many states selected. Max ${MAX_FILTER_ITEMS}.`);
      }
      if (positionsArray.length > MAX_FILTER_ITEMS) {
        throw new RequestValidationError(`Too many positions selected. Max ${MAX_FILTER_ITEMS}.`);
      }
      if (graduatingClassesArray.length > MAX_FILTER_ITEMS) {
        throw new RequestValidationError(`Too many graduating classes selected. Max ${MAX_FILTER_ITEMS}.`);
      }
      if (conferencesArray.length > MAX_FILTER_ITEMS) {
        throw new RequestValidationError(`Too many conferences selected. Max ${MAX_FILTER_ITEMS}.`);
      }

      // Total param count check to match the spirit of GET validation
      const totalParamCount =
        (body.query ? 1 : 0) +
        (body.page !== undefined ? 1 : 0) +
        (body.pageSize !== undefined ? 1 : 0) +
        (body.role ? 1 : 0) +
        (body.minHeight !== undefined ? 1 : 0) +
        (body.minWeight !== undefined ? 1 : 0) +
        sportsArray.length +
        divisionsArray.length +
        statesArray.length +
        positionsArray.length +
        graduatingClassesArray.length +
        conferencesArray.length;

      if (totalParamCount > MAX_QUERY_PARAMS) {
        throw new RequestValidationError('Too many parameters selected. Please reduce the number of filters.');
      }

      return {
        query: sanitizeText(body.query || ''),
        page: Math.min(Math.max(sanitizeNumber(body.page, 1, 100) || 1, 1), 100),
        pageSize: Math.min(Math.max(sanitizeNumber(body.pageSize, 1, 50) || 10, 1), 50),
        requestedRole: body.role ? sanitizeText(String(body.role)) as 'athlete' | 'coach' | 'recruiter' : null,
        sports: sportsArray.map((s: string) => sanitizeText(s)).filter(Boolean),
        divisions: divisionsArray.map((d: string) => sanitizeText(d)).filter(Boolean),
        countries: countriesArray.map((c: string) => sanitizeText(c)).filter(Boolean),
        states: statesArray.map((s: string) => sanitizeText(s)).filter(Boolean),
        positions: positionsArray.map((p: string) => sanitizeText(p)).filter(Boolean),
        graduatingClasses: graduatingClassesArray.map((gc: string) => sanitizeText(gc)).filter(Boolean),
        conferences: conferencesArray.map((c: string) => sanitizeText(c)).filter(Boolean),
        minHeight: sanitizeNumber(body.minHeight, 60, 96),
        minWeight: sanitizeNumber(body.minWeight, 100, 500)
      };
    } catch (err) {
      if (err instanceof RequestValidationError) {
        throw err;
      }
      throw new RequestValidationError('Invalid JSON body');
    }
  }
}

async function handleDiscoverRequest(request: NextRequest) {
  try {
    // Security validations for different request methods (middleware already handled auth.protect())
    if (request.method === 'POST') {
      // Validate POST request body size to prevent abuse
      const bodySize = parseInt(request.headers.get('content-length') || '0', 10);
      if (bodySize > MAX_BODY_SIZE) {
        return NextResponse.json(
          { error: 'Request body too large. Please reduce the number of filters or try again.' },
          { status: 413 }
        );
      }
    } else if (request.method === 'GET') {
      const url = new URL(request.url);
      
      // Limit total URL length for GET requests
      if (request.url.length > MAX_URL_LENGTH) {
        return NextResponse.json(
          { error: 'URL too long. Consider using fewer filters or try again.' },
          { status: 414 }
        );
      }

      // Limit query string size for GET requests
      if (url.search.length > MAX_QUERY_LENGTH) {
        return NextResponse.json(
          { error: 'Too many filters selected. Please reduce the number of filters.' },
          { status: 400 }
        );
      }
      // Defensive check on total parameter entries
      const totalParams = Array.from(url.searchParams).length;
      if (totalParams > MAX_QUERY_PARAMS) {
        return NextResponse.json(
          { error: 'Too many parameters in query string.' },
          { status: 400 }
        );
      }
    }

    // Verify authentication and get user info
    const auth = await requireAnyRole();
    if (auth instanceof NextResponse) return auth;

    const { userId, role } = auth;
    
    // Apply rate limiting for search operations
    const rateLimitCheck = await withRateLimit(request, 'search', userId, role);
    if (!rateLimitCheck.success) return rateLimitCheck.response;

    // Parse search parameters from either GET or POST
    const {
      query,
      page,
      pageSize,
      requestedRole,
      sports,
      divisions,
      countries,
      states,
      positions,
      graduatingClasses,
      conferences,
      minHeight,
      minWeight
    } = await parseSearchParams(request);

    // Validate role if specified
    if (requestedRole && !['athlete', 'coach', 'recruiter'].includes(requestedRole)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * pageSize;

    // Base query to exclude:
    // 1. Current user
    // 2. Users they're already connected to 
    // 3. Users they have outgoing pending requests to (but allow incoming pending requests)
    // 4. Athletes can't discover other athletes
    // 5. Demo profiles should never appear in discover
    // 6. Admin profiles should never appear in discover
    const baseExcludeConditions = [
      ne(users.id, userId), // Exclude self
      ne(users.role, 'admin'), // Exclude admin profiles
      not(exists(
        db.select()
          .from(connections)
          .where(and(
            or(
              // Exclude if connected (in either direction)
              and(
                eq(connections.fromUserId, userId),
                eq(connections.toUserId, users.id),
                eq(connections.status, 'connected')
              ),
              and(
                eq(connections.fromUserId, users.id),
                eq(connections.toUserId, userId),
                eq(connections.status, 'connected')
              ),
              // Exclude if current user has outgoing pending request
              and(
                eq(connections.fromUserId, userId),
                eq(connections.toUserId, users.id),
                eq(connections.status, 'pending')
              )
            )
          ))
      ))
    ];

    // Role-based discovery restrictions and default role filtering:
    // - Coaches and recruiters can only discover athletes
    // - Athletes can discover coaches, recruiters, and other athletes
    const roleFilterConditions = [];
    if (role === 'coach' || role === 'recruiter') {
      // Only show athletes to coaches and recruiters
      roleFilterConditions.push(
        eq(users.role, 'athlete')
      );
      
      // If no specific role requested, default to athlete for coaches/recruiters
      if (!requestedRole) {
        baseExcludeConditions.push(
          not(isNull(athleteProfiles.userId))
        );
      }
    }

    // Add role-based filtering - only include users with the requested role's profile
    if (requestedRole === 'athlete') {
      baseExcludeConditions.push(
        not(isNull(athleteProfiles.userId))
      );
    } else if (requestedRole === 'coach') {
      baseExcludeConditions.push(
        not(isNull(coachProfiles.userId))
      );
    } else if (requestedRole === 'recruiter') {
      baseExcludeConditions.push(
        not(isNull(recruitingProfiles.userId))
      );
    }

    // Always exclude demo profiles from discover results
    // This will be handled in the query where clause based on which tables are joined

    // Search conditions with parameterized queries to prevent SQL injection
    const searchConditions = query ? (() => {
      const searchTerm = sql`${'%' + query.toLowerCase() + '%'}`;
      return [
        or(
          and(
            not(isNull(athleteProfiles.userId)),
            or(
              ilike(athleteProfiles.fullName, searchTerm),
              ilike(schools.name, searchTerm),
              ilike(athleteProfiles.sport, searchTerm)
            )
          ),
          and(
            not(isNull(coachProfiles.userId)),
            or(
              ilike(coachProfiles.fullName, searchTerm),
              ilike(schools.name, searchTerm),
              ilike(coachProfiles.sportCoaching, searchTerm),
              ilike(coachProfiles.title, searchTerm)
            )
          ),
          and(
            not(isNull(recruitingProfiles.userId)),
            or(
              ilike(recruitingProfiles.fullName, searchTerm),
              ilike(schools.name, searchTerm),
              ilike(recruitingProfiles.sportRecruiting, searchTerm),
              ilike(recruitingProfiles.title, searchTerm)
            )
          )
        )
      ];
    })() : [];

    // Filter conditions - Fixed logic
    const filterConditions = [];
    
    // Sports filter - users must match at least one selected sport
    if (sports.length > 0) {
      filterConditions.push(
        or(
          and(not(isNull(athleteProfiles.userId)), or(...sports.map((sport: string) => eq(athleteProfiles.sport, sport)))),
          and(not(isNull(coachProfiles.userId)), or(...sports.map((sport: string) => eq(coachProfiles.sportCoaching, sport)))),
          and(not(isNull(recruitingProfiles.userId)), or(...sports.map((sport: string) => eq(recruitingProfiles.sportRecruiting, sport))))
        )
      );
    }

    // Divisions filter - only apply to coaches and recruiters, users must match at least one selected division
    if (divisions.length > 0) {
      filterConditions.push(
        or(
          // For athletes, division filter doesn't apply, so include all athletes
          not(isNull(athleteProfiles.userId)),
          // For coaches and recruiters, check division
          and(not(isNull(coachProfiles.userId)), or(...divisions.map((div: string) => eq(coachProfiles.division, div)))),
          and(not(isNull(recruitingProfiles.userId)), or(...divisions.map((div: string) => eq(recruitingProfiles.division, div))))
        )
      );
    }

    // States filter - users must match at least one selected state
    if (states.length > 0) {
      filterConditions.push(
        or(
          and(not(isNull(athleteProfiles.userId)), or(...states.map((state: string) => eq(athleteProfiles.state, state)))),
          and(not(isNull(coachProfiles.userId)), or(...states.map((state: string) => eq(coachProfiles.state, state)))),
          and(not(isNull(recruitingProfiles.userId)), or(...states.map((state: string) => eq(recruitingProfiles.state, state))))
        )
      );
    }

    // Countries filter - users must match at least one selected country
    if (countries.length > 0) {
      filterConditions.push(
        or(
          and(not(isNull(athleteProfiles.userId)), or(...countries.map((country: string) => eq(athleteProfiles.country, country)))),
          and(not(isNull(coachProfiles.userId)), or(...countries.map((country: string) => eq(coachProfiles.country, country)))),
          and(not(isNull(recruitingProfiles.userId)), or(...countries.map((country: string) => eq(recruitingProfiles.country, country))))
        )
      );
    }

    // Positions filter - only for athletes, must match at least one selected position
    if (positions.length > 0) {
      filterConditions.push(
        and(
          not(isNull(athleteProfiles.userId)),
          arrayOverlaps(athleteProfiles.positions, positions)
        )
      );
    }

    // Graduating classes filter - only for athletes
    if (graduatingClasses.length > 0) {
      const graduationYears = graduatingClasses.map((gc: string) => parseInt(gc, 10)).filter((year: number) => !isNaN(year));
      if (graduationYears.length > 0) {
        filterConditions.push(
          and(
            not(isNull(athleteProfiles.userId)),
            or(...graduationYears.map((year: number) => eq(athleteProfiles.graduationYear, year)))
          )
        );
      }
    }

    // Conferences filter - only for coaches and recruiters
    if (conferences.length > 0) {
      filterConditions.push(
        or(
          and(not(isNull(coachProfiles.userId)), or(...conferences.map((conf: string) => eq(coachProfiles.conference, conf)))),
          and(not(isNull(recruitingProfiles.userId)), or(...conferences.map((conf: string) => eq(recruitingProfiles.conference, conf))))
        )
      );
    }

    // Height filter - only for athletes with proper database-level filtering
    if (minHeight && minHeight > 60) {
      filterConditions.push(
        and(
          not(isNull(athleteProfiles.userId)),
          createHeightFilter(minHeight)
        )
      );
    }

    // Weight filter - only for athletes with proper database-level filtering
    if (minWeight && minWeight > 100) {
      filterConditions.push(
        and(
          not(isNull(athleteProfiles.userId)),
          createWeightFilter(minWeight)
        )
      );
    }

    // Combine all conditions
    const allConditions = [
      ...baseExcludeConditions,
      ...searchConditions,
      ...filterConditions,
      ...roleFilterConditions
    ];

    // Execute the search query using Drizzle's query builder with left joins
    const results = await db
      .select({
        id: users.id,
        role: users.role,
        athleteProfile: athleteProfiles,
        coachProfile: coachProfiles,
        recruitingProfile: recruitingProfiles,
        school: schools,
        hasPendingRequest: exists(
          db.select()
            .from(connections)
            .where(and(
              eq(connections.fromUserId, userId),
              eq(connections.toUserId, users.id),
              eq(connections.status, 'pending')
            ))
        ),
        hasIncomingRequest: exists(
          db.select()
            .from(connections)
            .where(and(
              eq(connections.fromUserId, users.id),
              eq(connections.toUserId, userId),
              eq(connections.status, 'pending')
            ))
        )
      })
      .from(users)
      .leftJoin(athleteProfiles, and(
        eq(athleteProfiles.userId, users.id),
        or(
          isNull(athleteProfiles.isDemoProfile),
          eq(athleteProfiles.isDemoProfile, false)
        )
      ))
      .leftJoin(coachProfiles, and(
        eq(coachProfiles.userId, users.id),
        or(
          isNull(coachProfiles.isDemoProfile),
          eq(coachProfiles.isDemoProfile, false)
        )
      ))
      .leftJoin(recruitingProfiles, and(
        eq(recruitingProfiles.userId, users.id),
        or(
          isNull(recruitingProfiles.isDemoProfile),
          eq(recruitingProfiles.isDemoProfile, false)
        )
      ))
      .leftJoin(schools, or(
        eq(schools.id, athleteProfiles.schoolId),
        eq(schools.id, coachProfiles.schoolId),
        eq(schools.id, recruitingProfiles.schoolId)
      ))
      .where(allConditions.length > 0 ? and(...allConditions) : undefined)
      .limit(pageSize)
      .offset(offset);

    // Fetch recruiting needs for coaches and recruiters in parallel
    const coachProfileIds = results
      .filter(user => user.role === 'coach' && user.coachProfile)
      .map(user => user.coachProfile!.id);

    const recruiterProfileIds = results
      .filter(user => user.role === 'recruiter' && user.recruitingProfile)
      .map(user => user.recruitingProfile!.id);

    // Fetch recruiting needs with error handling
    let coachRecruitingNeeds: typeof recruitingNeeds.$inferSelect[] = [];
    let recruiterRecruitingNeeds: typeof recruitingProfileNeeds.$inferSelect[] = [];

    try {
      // Fetch coach recruiting needs
      if (coachProfileIds.length > 0) {
        coachRecruitingNeeds = await db.query.recruitingNeeds.findMany({
          where: or(...coachProfileIds.map(id => eq(recruitingNeeds.coachId, id)))
        });
      }

      // Fetch recruiter recruiting needs
      if (recruiterProfileIds.length > 0) {
        recruiterRecruitingNeeds = await db.query.recruitingProfileNeeds.findMany({
          where: or(...recruiterProfileIds.map(id => eq(recruitingProfileNeeds.recruitingProfileId, id)))
        });
      }
    } catch (recruitingNeedsError) {
      console.error('Error fetching recruiting needs:', recruitingNeedsError);
      // Continue without recruiting needs data if fetch fails
    }

    // Create maps for quick lookup with safe data handling
    const coachNeedsMap = new Map<number, {
      studentClassifications: string[];
      positions: string[];
      scholarshipsAvailable: number | null;
      recruitingPhilosophy: string | null;
    }>();
    coachRecruitingNeeds.forEach(need => {
      if (need && typeof need.coachId === 'number') {
        coachNeedsMap.set(need.coachId, {
          studentClassifications: Array.isArray(need.studentClassifications) ? need.studentClassifications : [],
          positions: Array.isArray(need.positions) ? need.positions : [],
          scholarshipsAvailable: typeof need.scholarshipsAvailable === 'number' ? need.scholarshipsAvailable : null,
          recruitingPhilosophy: typeof need.recruitingPhilosophy === 'string' ? need.recruitingPhilosophy : null
        });
      }
    });

    const recruiterNeedsMap = new Map<number, Array<{
      id: number;
      recruitingProfileId: number;
      sport: string;
      studentClassifications: string[];
      positions: string[];
      scholarshipsAvailable: number | null;
      recruitingPhilosophy: string | null;
    }>>();
    recruiterRecruitingNeeds.forEach(need => {
      if (need && typeof need.recruitingProfileId === 'number') {
        if (!recruiterNeedsMap.has(need.recruitingProfileId)) {
          recruiterNeedsMap.set(need.recruitingProfileId, []);
        }
        recruiterNeedsMap.get(need.recruitingProfileId)!.push({
          id: need.id,
          recruitingProfileId: need.recruitingProfileId,
          sport: need.sport || '',
          studentClassifications: Array.isArray(need.studentClassifications) ? need.studentClassifications : [],
          positions: Array.isArray(need.positions) ? need.positions : [],
          scholarshipsAvailable: typeof need.scholarshipsAvailable === 'number' ? need.scholarshipsAvailable : null,
          recruitingPhilosophy: typeof need.recruitingPhilosophy === 'string' ? need.recruitingPhilosophy : null
        });
      }
    });

    // Process results using a similar approach as the connections API
    const processedResults = results.map(user => {
      // Determine which profile to use
      const userRole = user.role;
      let userProfileData: {
        fullName: string | null;
        organizationName: string | null;
        profileImage: string | null;
        city: string | null;
        state: string | null;
        country?: string | null;
        isVerified: boolean | null;
        sport: string | null;
        title?: string | null;
        division?: string | null;
        educationLevel?: string | null;
        graduationYear?: number | null;
        height?: string | null;
        weight?: string | null;
        positions?: string[] | null;
        recruitingNeeds?: {
          studentClassifications: string[];
          positions: string[];
          scholarshipsAvailable: number | null;
          recruitingPhilosophy: string | null;
        } | null;
      } = {
        fullName: null,
        organizationName: null,
        profileImage: null,
        city: null,
        state: null,
        isVerified: false,
        sport: null,
      };

      // Set properties based on profile type
      if (userRole === 'athlete' && user.athleteProfile) {
        const athleteProfile = user.athleteProfile;
        userProfileData = {
          fullName: athleteProfile.fullName,
          organizationName: user.school?.name || null,
          profileImage: athleteProfile.profileImageR3Key,
          city: athleteProfile.city,
          state: athleteProfile.state,
          country: athleteProfile.country,
          isVerified: athleteProfile.isVerified || false,
          sport: athleteProfile.sport,
          educationLevel: athleteProfile.educationLevel,
          graduationYear: athleteProfile.graduationYear,
          height: athleteProfile.height,
          weight: athleteProfile.weight,
          positions: athleteProfile.positions,
        };
      } else if (userRole === 'coach' && user.coachProfile) {
        const coachProfile = user.coachProfile;
        const coachNeeds = coachNeedsMap.get(coachProfile.id) || null;
        
        userProfileData = {
          fullName: coachProfile.fullName,
          organizationName: user.school?.name || null,
          profileImage: coachProfile.profileImageR3Key,
          city: coachProfile.city,
          state: coachProfile.state,
          country: coachProfile.country,
          isVerified: coachProfile.isVerified || false,
          sport: coachProfile.sportCoaching,
          title: coachProfile.title,
          division: coachProfile.division,
          recruitingNeeds: coachNeeds,
        };
      } else if (userRole === 'recruiter' && user.recruitingProfile) {
        const recruitingProfile = user.recruitingProfile;
        const profileNeeds = recruiterNeedsMap.get(recruitingProfile.id) || [];
        
        // Get needs for the main sport
        const mainSportNeeds = profileNeeds.find(need => need.sport === recruitingProfile.sportRecruiting);
        
        userProfileData = {
          fullName: recruitingProfile.fullName,
          organizationName: user.school?.name || null,
          profileImage: recruitingProfile.profileImageR3Key,
          city: recruitingProfile.city,
          state: recruitingProfile.state,
          country: recruitingProfile.country,
          isVerified: recruitingProfile.isVerified || false,
          sport: recruitingProfile.sportRecruiting,
          title: recruitingProfile.title,
          division: recruitingProfile.division,
          recruitingNeeds: mainSportNeeds || null,
        };
      }

      // Return formatted and sanitized user data
      return {
        id: user.id,
        fullName: userProfileData.fullName ? sanitizeText(userProfileData.fullName) : null,
        organizationName: userProfileData.organizationName ? sanitizeText(userProfileData.organizationName) : null,
        profileImage: userProfileData.profileImage || null,
        city: userProfileData.city ? sanitizeText(userProfileData.city) : null,
        state: userProfileData.state ? sanitizeText(userProfileData.state) : null,
        country: userProfileData.country ? sanitizeText(userProfileData.country) : null,
        isVerified: userProfileData.isVerified || false,
        role: userRole,
        sport: userProfileData.sport ? sanitizeText(userProfileData.sport) : null,
        title: userProfileData.title ? sanitizeText(userProfileData.title) : null,
        division: userProfileData.division ? sanitizeText(userProfileData.division) : null,
        educationLevel: userProfileData.educationLevel ? sanitizeText(userProfileData.educationLevel) : null,
        graduationYear: userProfileData.graduationYear,
        height: userProfileData.height ? sanitizeText(userProfileData.height) : null,
        weight: userProfileData.weight ? sanitizeText(userProfileData.weight) : null,
        positions: userProfileData.positions || null,
        hasPendingRequest: user.hasPendingRequest || false,
        hasIncomingRequest: user.hasIncomingRequest || false,
        recruitingNeeds: userProfileData.recruitingNeeds ? {
          studentClassifications: userProfileData.recruitingNeeds.studentClassifications || [],
          positions: userProfileData.recruitingNeeds.positions || [],
          scholarshipsAvailable: userProfileData.recruitingNeeds.scholarshipsAvailable || null,
        } : null,
      };
    });

    // Note: Height and weight filtering is now done at the database level for better performance
    // No post-query filtering needed for these fields anymore

    // Set security headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-store, max-age=0'
    });

    const response = new NextResponse(
      JSON.stringify({
        success: true,
        results: processedResults,
        total: processedResults.length,
        hasMore: processedResults.length === pageSize
      }),
      { 
        status: 200,
        headers
      }
    );
    
    // Add rate limit headers to response
    Object.entries(rateLimitCheck.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('Discover API error:', error);
    if (error instanceof RequestValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleDiscoverRequest(request);
}

export async function POST(request: NextRequest) {
  return handleDiscoverRequest(request);
} 