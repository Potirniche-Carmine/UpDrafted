import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { db } from '@/database/db';
import { users, athleteProfiles, coachProfiles, recruitingProfiles, connections } from '@/database/schema';
import { and, eq, or, not, ilike, isNull, exists, ne, sql } from 'drizzle-orm';
import { sanitizeText, sanitizeNumber } from '@/utils/sanitization';
import { rateLimitMiddleware, addRateLimitHeaders } from '@/utils/rate-limiting';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Validate request size and URL length to prevent DoS attacks
    const url = new URL(request.url);
    
    // Limit total URL length (including query params)
    const MAX_URL_LENGTH = 2048; // Standard browser limit
    if (request.url.length > MAX_URL_LENGTH) {
      return NextResponse.json(
        { error: 'URL too long' },
        { status: 414 } // 414 URI Too Long
      );
    }

    // Limit query string size
    const MAX_QUERY_LENGTH = 1024;
    if (url.search.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: 'Query parameters too long' },
        { status: 400 }
      );
    }

    // Limit number of query parameters to prevent parameter pollution
    const MAX_QUERY_PARAMS = 10;
    if (url.searchParams.size > MAX_QUERY_PARAMS) {
      return NextResponse.json(
        { error: 'Too many query parameters' },
        { status: 400 }
      );
    }

    // Verify authentication and get user info
    const auth = await requireAnyRole();
    if (auth instanceof NextResponse) return auth;

    const { userId, role } = auth;
    
    // Apply rate limiting for search operations
    const rateLimitCheck = await rateLimitMiddleware('search')(request, userId, role);
    if (rateLimitCheck) return rateLimitCheck;
    const { searchParams } = url;

    // Sanitize and validate query parameters
    const query = sanitizeText(searchParams.get('query') || '');
    const page = Math.min(Math.max(sanitizeNumber(searchParams.get('page'), 1, 100) || 1, 1), 100); // Limit page numbers
    const pageSize = Math.min(Math.max(sanitizeNumber(searchParams.get('pageSize'), 1, 50) || 9, 1), 50); // Limit page size
    const requestedRole = searchParams.get('role') as 'athlete' | 'coach' | 'recruiter' | null;

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
    // 3. Users they've sent requests to
    // 4. Athletes can't discover other athletes
    const baseExcludeConditions = [
      ne(users.id, userId), // Exclude self
      not(exists(
        db.select()
          .from(connections)
          .where(or(
            and(
              eq(connections.fromUserId, userId),
              eq(connections.toUserId, users.id)
            ),
            and(
              eq(connections.fromUserId, users.id),
              eq(connections.toUserId, userId)
            )
          ))
      ))
    ];

    // Add role-based filtering
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

    // If user is an athlete, they can't discover other athletes
    if (role === 'athlete') {
      baseExcludeConditions.push(
        isNull(athleteProfiles.userId)
      );
    }

    // Search conditions with sanitized input
    const searchConditions = query ? [
      or(
        and(
          not(isNull(athleteProfiles.userId)),
          or(
            ilike(athleteProfiles.fullName, `%${query}%`),
            ilike(athleteProfiles.organizationName, `%${query}%`),
            ilike(athleteProfiles.sport, `%${query}%`)
          )
        ),
        and(
          not(isNull(coachProfiles.userId)),
          or(
            ilike(coachProfiles.fullName, `%${query}%`),
            ilike(coachProfiles.organizationName, `%${query}%`),
            ilike(coachProfiles.sportCoaching, `%${query}%`),
            ilike(coachProfiles.title, `%${query}%`)
          )
        ),
        and(
          not(isNull(recruitingProfiles.userId)),
          or(
            ilike(recruitingProfiles.fullName, `%${query}%`),
            ilike(recruitingProfiles.organizationName, `%${query}%`),
            ilike(recruitingProfiles.sportRecruiting, `%${query}%`),
            ilike(recruitingProfiles.title, `%${query}%`)
          )
        )
      )
    ] : [];

    // Execute the search query using Drizzle's query builder with relations
    const results = await db
      .select({
        id: users.id,
        role: users.role,
        athleteProfile: athleteProfiles,
        coachProfile: coachProfiles,
        recruitingProfile: recruitingProfiles,
        hasPendingRequest: exists(
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
      .leftJoin(athleteProfiles, eq(athleteProfiles.userId, users.id))
      .leftJoin(coachProfiles, eq(coachProfiles.userId, users.id))
      .leftJoin(recruitingProfiles, eq(recruitingProfiles.userId, users.id))
      .where(and(...baseExcludeConditions, ...searchConditions))
      .limit(pageSize)
      .offset(offset);

    // Get total count for pagination
    const totalResults = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .leftJoin(athleteProfiles, eq(athleteProfiles.userId, users.id))
      .leftJoin(coachProfiles, eq(coachProfiles.userId, users.id))
      .leftJoin(recruitingProfiles, eq(recruitingProfiles.userId, users.id))
      .where(and(...baseExcludeConditions, ...searchConditions));

    const total = Number(totalResults[0]?.count || 0);
    const totalPages = Math.ceil(total / pageSize);

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
        isVerified: boolean | null;
        sport: string | null;
        title?: string | null;
        division?: string | null;
        educationLevel?: string | null;
        graduationYear?: number | null;
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
        userProfileData = {
          fullName: user.athleteProfile.fullName,
          organizationName: user.athleteProfile.organizationName,
          profileImage: user.athleteProfile.profileImageR3Key,
          city: user.athleteProfile.city,
          state: user.athleteProfile.state,
          isVerified: user.athleteProfile.isVerified || false,
          sport: user.athleteProfile.sport,
          educationLevel: user.athleteProfile.educationLevel,
          graduationYear: user.athleteProfile.graduationYear,
        };
      } else if (userRole === 'coach' && user.coachProfile) {
        userProfileData = {
          fullName: user.coachProfile.fullName,
          organizationName: user.coachProfile.organizationName,
          profileImage: user.coachProfile.profileImageR3Key,
          city: user.coachProfile.city,
          state: user.coachProfile.state,
          isVerified: user.coachProfile.isVerified || false,
          sport: user.coachProfile.sportCoaching,
          title: user.coachProfile.title,
          division: user.coachProfile.division,
        };
      } else if (userRole === 'recruiter' && user.recruitingProfile) {
        userProfileData = {
          fullName: user.recruitingProfile.fullName,
          organizationName: user.recruitingProfile.organizationName,
          profileImage: user.recruitingProfile.profileImageR3Key,
          city: user.recruitingProfile.city,
          state: user.recruitingProfile.state,
          isVerified: user.recruitingProfile.isVerified || false,
          sport: user.recruitingProfile.sportRecruiting,
          title: user.recruitingProfile.title,
          division: user.recruitingProfile.division,
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
        isVerified: userProfileData.isVerified || false,
        role: userRole,
        sport: userProfileData.sport ? sanitizeText(userProfileData.sport) : null,
        title: userProfileData.title ? sanitizeText(userProfileData.title) : null,
        division: userProfileData.division ? sanitizeText(userProfileData.division) : null,
        educationLevel: userProfileData.educationLevel ? sanitizeText(userProfileData.educationLevel) : null,
        graduationYear: userProfileData.graduationYear,
        hasPendingRequest: user.hasPendingRequest,
      };
    });

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
        total,
        currentPage: page,
        totalPages,
        pageSize
      }),
      { 
        status: 200,
        headers
      }
    );
    
    // Add rate limit headers to response
    return addRateLimitHeaders(response, userId, role, 'search');
  } catch (error) {
    console.error('Discover API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 