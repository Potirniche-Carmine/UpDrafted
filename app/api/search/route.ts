import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { db } from '@/database/db';
import { users, athleteProfiles, coachProfiles, recruitingProfiles } from '@/database/schema';
import { or, eq, ilike, sql, and, ne, isNull } from 'drizzle-orm';
import { R2_PUBLIC_URL } from '@/database/r2';
import { withRateLimit } from '@/utils/rate-limiting';
import { getCachedWithType, setCachedWithType, createErrorResponse, createSuccessResponse } from '@/utils/security-cache';

// Force Node.js runtime
export const runtime = 'nodejs';

export interface SearchResult {
  id: string;
  fullName: string;
  role: 'athlete' | 'coach' | 'recruiter';
  sport: string;
  profileImage: string | null;
  organizationName: string;
  city: string;
  state: string;
  isVerified: boolean;
  title?: string;
  division?: string;
  graduationYear?: number;
  educationLevel?: string;
}

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Validate request size and URL length
    const url = new URL(request.url);
    const MAX_URL_LENGTH = 2048;
    if (request.url.length > MAX_URL_LENGTH) {
      return createErrorResponse('URL too long', 414);
    }
    // Require authentication
    const auth = await requireAnyRole();
    if (auth instanceof NextResponse) return auth;

    const { userId, role } = auth;

    // Apply rate limiting
    const rateLimitCheck = await withRateLimit(request, 'search', userId, role);
    if (!rateLimitCheck.success) return rateLimitCheck.response;

    const searchParams = url.searchParams;
    const query = searchParams.get('q')?.trim();
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '12'), 50); // Cap at 50 per page
    const roleFilter = searchParams.get('role'); // Optional role filter

    // Validate minimum search length
    if (!query || query.length < 3) {
      return createSuccessResponse({
        results: [],
        total: 0,
        message: query ? 'Search query must be at least 3 characters long' : 'Search query is required'
      }, rateLimitCheck.headers);
    }

    // Validate query length (prevent very long queries)
    if (query.length > 100) {
      return createErrorResponse('Search query too long', 400);
    }

    // Try cache first
    const cacheKey = `search:${query}:${roleFilter || 'all'}:${page}:${pageSize}:${userId}`;
    const cachedResults = await getCachedWithType<{
      results: SearchResult[];
      total: number;
      page: number;
      pageSize: number;
      hasMore: boolean;
    }>(cacheKey);

    if (cachedResults) {
      return createSuccessResponse(cachedResults, rateLimitCheck.headers);
    }

    const searchTerm = `%${query.toLowerCase()}%`;
    const results: SearchResult[] = [];
    let totalResults = 0;

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Use Promise.all for parallel execution instead of sequential queries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchPromises: Promise<any[]>[] = [];

    // Search athletes if no role filter or role is athlete
    if (!roleFilter || roleFilter === 'athlete') {
      // Only allow athlete search if current user is not an athlete
      if (role !== 'athlete') {
        searchPromises.push(
          db
            .select({
              id: users.id,
              fullName: athleteProfiles.fullName,
              role: users.role,
              sport: athleteProfiles.sport,
              profileImageR3Key: athleteProfiles.profileImageR3Key,
              organizationName: athleteProfiles.organizationName,
              city: athleteProfiles.city,
              state: athleteProfiles.state,
              isVerified: athleteProfiles.isVerified,
              graduationYear: athleteProfiles.graduationYear,
              educationLevel: athleteProfiles.educationLevel,
            })
            .from(athleteProfiles)
            .innerJoin(users, eq(users.id, athleteProfiles.userId))
            .where(
              and(
                or(
                  ilike(athleteProfiles.fullName, searchTerm),
                  ilike(athleteProfiles.sport, searchTerm),
                  ilike(athleteProfiles.organizationName, searchTerm),
                  ilike(athleteProfiles.city, searchTerm),
                  ilike(athleteProfiles.state, searchTerm)
                ),
                ne(users.id, auth.userId),
                // Exclude demo profiles
                or(
                  isNull(athleteProfiles.isDemoProfile),
                  eq(athleteProfiles.isDemoProfile, false)
                )
              )
            )
            .offset(offset)
            .limit(pageSize)
        );
      }
    }

    // Search coaches if no role filter or role is coach
    if (!roleFilter || roleFilter === 'coach') {
      searchPromises.push(
        db
          .select({
            id: users.id,
            fullName: coachProfiles.fullName,
            role: users.role,
            sport: coachProfiles.sportCoaching,
            profileImageR3Key: coachProfiles.profileImageR3Key,
            organizationName: coachProfiles.organizationName,
            city: coachProfiles.city,
            state: coachProfiles.state,
            isVerified: coachProfiles.isVerified,
            title: coachProfiles.title,
            division: coachProfiles.division,
          })
          .from(coachProfiles)
          .innerJoin(users, eq(users.id, coachProfiles.userId))
          .where(
            and(
              or(
                ilike(coachProfiles.fullName, searchTerm),
                ilike(coachProfiles.sportCoaching, searchTerm),
                ilike(coachProfiles.organizationName, searchTerm),
                ilike(coachProfiles.city, searchTerm),
                ilike(coachProfiles.state, searchTerm),
                ilike(coachProfiles.title, searchTerm)
              ),
              ne(users.id, auth.userId),
              // Exclude demo profiles
              or(
                isNull(coachProfiles.isDemoProfile),
                eq(coachProfiles.isDemoProfile, false)
              )
            )
          )
          .offset(offset)
          .limit(pageSize)
      );
    }

    // Search recruiters if no role filter or role is recruiter
    if (!roleFilter || roleFilter === 'recruiter') {
      searchPromises.push(
        db
          .select({
            id: users.id,
            fullName: recruitingProfiles.fullName,
            role: users.role,
            sport: recruitingProfiles.sportRecruiting,
            profileImageR3Key: recruitingProfiles.profileImageR3Key,
            organizationName: recruitingProfiles.organizationName,
            city: recruitingProfiles.city,
            state: recruitingProfiles.state,
            isVerified: recruitingProfiles.isVerified,
            title: recruitingProfiles.title,
            division: recruitingProfiles.division,
          })
          .from(recruitingProfiles)
          .innerJoin(users, eq(users.id, recruitingProfiles.userId))
          .where(
            and(
              or(
                ilike(recruitingProfiles.fullName, searchTerm),
                ilike(recruitingProfiles.sportRecruiting, searchTerm),
                ilike(recruitingProfiles.organizationName, searchTerm),
                ilike(recruitingProfiles.city, searchTerm),
                ilike(recruitingProfiles.state, searchTerm),
                ilike(recruitingProfiles.title, searchTerm)
              ),
              ne(users.id, auth.userId),
              // Exclude demo profiles
              or(
                isNull(recruitingProfiles.isDemoProfile),
                eq(recruitingProfiles.isDemoProfile, false)
              )
            )
          )
          .offset(offset)
          .limit(pageSize)
      );
    }

    // Execute all search queries in parallel
    const searchResults = await Promise.all(searchPromises);

    // Process results from each search
    let searchIndex = 0;
    
    if (!roleFilter || roleFilter === 'athlete') {
      // Only process athlete results if current user is not an athlete
      if (role !== 'athlete') {
        const athleteResults = searchResults[searchIndex++];
        for (const athlete of athleteResults) {
          results.push({
            id: athlete.id,
            fullName: athlete.fullName,
            role: 'athlete',
            sport: athlete.sport,
            profileImage: athlete.profileImageR3Key ? `${R2_PUBLIC_URL}/${athlete.profileImageR3Key}` : null,
            organizationName: athlete.organizationName,
            city: athlete.city,
            state: athlete.state,
            isVerified: athlete.isVerified ?? false,
            graduationYear: athlete.graduationYear,
            educationLevel: athlete.educationLevel,
          });
        }
      }
    }

    if (!roleFilter || roleFilter === 'coach') {
      const coachResults = searchResults[searchIndex++];
      for (const coach of coachResults) {
        results.push({
          id: coach.id,
          fullName: coach.fullName,
          role: 'coach',
          sport: coach.sport,
          profileImage: coach.profileImageR3Key ? `${R2_PUBLIC_URL}/${coach.profileImageR3Key}` : null,
          organizationName: coach.organizationName,
          city: coach.city,
          state: coach.state,
          isVerified: coach.isVerified ?? false,
          title: coach.title,
          division: coach.division,
        });
      }
    }

    if (!roleFilter || roleFilter === 'recruiter') {
      const recruiterResults = searchResults[searchIndex++];
      for (const recruiter of recruiterResults) {
        results.push({
          id: recruiter.id,
          fullName: recruiter.fullName,
          role: 'recruiter',
          sport: recruiter.sport,
          profileImage: recruiter.profileImageR3Key ? `${R2_PUBLIC_URL}/${recruiter.profileImageR3Key}` : null,
          organizationName: recruiter.organizationName,
          city: recruiter.city,
          state: recruiter.state,
          isVerified: recruiter.isVerified ?? false,
          title: recruiter.title,
          division: recruiter.division,
        });
      }
    }

    // Get count in parallel using combined query for better performance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countPromises: Promise<any>[] = [];

    if (!roleFilter || roleFilter === 'athlete') {
      // Only count athletes if current user is not an athlete
      if (role !== 'athlete') {
        countPromises.push(
          db
            .select({ count: sql<number>`count(*)` })
            .from(athleteProfiles)
            .innerJoin(users, eq(users.id, athleteProfiles.userId))
            .where(
              and(
                or(
                  ilike(athleteProfiles.fullName, searchTerm),
                  ilike(athleteProfiles.sport, searchTerm),
                  ilike(athleteProfiles.organizationName, searchTerm),
                  ilike(athleteProfiles.city, searchTerm),
                  ilike(athleteProfiles.state, searchTerm)
                ),
                ne(users.id, auth.userId),
                // Exclude demo profiles
                or(
                  isNull(athleteProfiles.isDemoProfile),
                  eq(athleteProfiles.isDemoProfile, false)
                )
              )
            )
        );
      }
    }

    if (!roleFilter || roleFilter === 'coach') {
      countPromises.push(
        db
          .select({ count: sql<number>`count(*)` })
          .from(coachProfiles)
          .innerJoin(users, eq(users.id, coachProfiles.userId))
          .where(
            and(
              or(
                ilike(coachProfiles.fullName, searchTerm),
                ilike(coachProfiles.sportCoaching, searchTerm),
                ilike(coachProfiles.organizationName, searchTerm),
                ilike(coachProfiles.city, searchTerm),
                ilike(coachProfiles.state, searchTerm),
                ilike(coachProfiles.title, searchTerm)
              ),
              ne(users.id, auth.userId),
              // Exclude demo profiles
              or(
                isNull(coachProfiles.isDemoProfile),
                eq(coachProfiles.isDemoProfile, false)
              )
            )
          )
      );
    }

    if (!roleFilter || roleFilter === 'recruiter') {
      countPromises.push(
        db
          .select({ count: sql<number>`count(*)` })
          .from(recruitingProfiles)
          .innerJoin(users, eq(users.id, recruitingProfiles.userId))
          .where(
            and(
              or(
                ilike(recruitingProfiles.fullName, searchTerm),
                ilike(recruitingProfiles.sportRecruiting, searchTerm),
                ilike(recruitingProfiles.organizationName, searchTerm),
                ilike(recruitingProfiles.city, searchTerm),
                ilike(recruitingProfiles.state, searchTerm),
                ilike(recruitingProfiles.title, searchTerm)
              ),
              ne(users.id, auth.userId),
              // Exclude demo profiles
              or(
                isNull(recruitingProfiles.isDemoProfile),
                eq(recruitingProfiles.isDemoProfile, false)
              )
            )
          )
      );
    }

    // Execute count queries in parallel
    const countResults = await Promise.all(countPromises);
    totalResults = countResults.reduce((total, result) => total + Number(result[0]?.count || 0), 0);

    const responseData = {
      results,
      total: totalResults,
      page,
      pageSize,
      hasMore: (page * pageSize) < totalResults,
    };

    // Cache the results
    await setCachedWithType(cacheKey, responseData, 'searchResults');

    return createSuccessResponse(responseData, rateLimitCheck.headers);

  } catch (error) {
    console.error('Search API error:', error);
    return createErrorResponse('Search failed', 500);
  }
} 