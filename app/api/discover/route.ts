import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { db } from '@/database/db';
import { users, athleteProfiles, coachProfiles, recruitingProfiles, connections } from '@/database/schema';
import { and, eq, or, not, ilike, isNull, sql, exists, ne } from 'drizzle-orm';
import { R2_PUBLIC_URL } from '@/database/r2';
import { sanitizeText, sanitizeNumber } from '@/utils/sanitization';

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

    // Execute the search query using Drizzle's query builder
    const results = await db
      .select({
        id: users.id,
        fullName: sql<string>`COALESCE(${athleteProfiles.fullName}, ${coachProfiles.fullName}, ${recruitingProfiles.fullName})`,
        organizationName: sql<string>`COALESCE(${athleteProfiles.organizationName}, ${coachProfiles.organizationName}, ${recruitingProfiles.organizationName})`,
        profileImage: sql<string>`COALESCE(${athleteProfiles.profileImageR3Key}, ${coachProfiles.profileImageR3Key}, ${recruitingProfiles.profileImageR3Key})`,
        city: sql<string>`COALESCE(${athleteProfiles.city}, ${coachProfiles.city}, ${recruitingProfiles.city})`,
        state: sql<string>`COALESCE(${athleteProfiles.state}, ${coachProfiles.state}, ${recruitingProfiles.state})`,
        isVerified: sql<boolean>`COALESCE(${athleteProfiles.isVerified}, ${coachProfiles.isVerified}, ${recruitingProfiles.isVerified}, false)`,
        role: sql<'athlete' | 'coach' | 'recruiter'>`CASE 
          WHEN ${athleteProfiles.userId} IS NOT NULL THEN 'athlete'
          WHEN ${coachProfiles.userId} IS NOT NULL THEN 'coach'
          WHEN ${recruitingProfiles.userId} IS NOT NULL THEN 'recruiter'
        END`,
        sport: sql<string>`COALESCE(${athleteProfiles.sport}, ${coachProfiles.sportCoaching}, ${recruitingProfiles.sportRecruiting})`,
        title: sql<string>`COALESCE(${coachProfiles.title}, ${recruitingProfiles.title})`,
        division: sql<string>`COALESCE(${coachProfiles.division}, ${recruitingProfiles.division})`,
        educationLevel: athleteProfiles.educationLevel,
        graduationYear: athleteProfiles.graduationYear,
        hasPendingRequest: exists(
          db.select()
            .from(connections)
            .where(and(
              eq(connections.fromUserId, users.id),
              eq(connections.toUserId, userId),
              eq(connections.status, 'pending')
            ))
        ).as('hasPendingRequest')
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

    // Process profile images to use R2 URLs and sanitize output
    const processedResults = results.map(user => ({
      ...user,
      // Sanitize all text fields to prevent XSS
      fullName: sanitizeText(user.fullName),
      organizationName: sanitizeText(user.organizationName),
      city: sanitizeText(user.city),
      state: sanitizeText(user.state),
      sport: sanitizeText(user.sport),
      title: user.title ? sanitizeText(user.title) : null,
      division: user.division ? sanitizeText(user.division) : null,
      educationLevel: user.educationLevel ? sanitizeText(user.educationLevel) : null,
      // Safely construct profile image URL
      profileImage: user.profileImage ? `${R2_PUBLIC_URL}/${user.profileImage}` : null
    }));

    // Set security headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-store, max-age=0'
    });

    return new NextResponse(
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
  } catch (error) {
    console.error('Discover API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 