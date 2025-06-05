import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { db } from '@/database/db';
import { users, athleteProfiles, coachProfiles, recruitingProfiles } from '@/database/schema';
import { or, eq, ilike, sql } from 'drizzle-orm';
import { R2_PUBLIC_URL } from '@/database/r2';

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
      return NextResponse.json(
        { error: 'URL too long' },
        { status: 414 }
      );
    }

    // Require authentication
    const auth = await requireAnyRole();
    if (auth instanceof NextResponse) return auth;

    const searchParams = url.searchParams;
    const query = searchParams.get('q')?.trim();
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '12'), 50); // Cap at 50 per page
    const role = searchParams.get('role'); // Optional role filter

    // Validate minimum search length
    if (!query || query.length < 3) {
      return NextResponse.json({
        results: [],
        total: 0,
        message: query ? 'Search query must be at least 3 characters long' : 'Search query is required'
      });
    }

    // Validate query length (prevent very long queries)
    if (query.length > 100) {
      return NextResponse.json(
        { error: 'Search query too long' },
        { status: 400 }
      );
    }

    const searchTerm = `%${query.toLowerCase()}%`;
    const results: SearchResult[] = [];
    let totalResults = 0;

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Search athletes if no role filter or role is athlete
    if (!role || role === 'athlete') {
      const athleteResults = await db
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
          or(
            ilike(athleteProfiles.fullName, searchTerm),
            ilike(athleteProfiles.sport, searchTerm),
            ilike(athleteProfiles.organizationName, searchTerm),
            ilike(athleteProfiles.city, searchTerm),
            ilike(athleteProfiles.state, searchTerm)
          )
        )
        .offset(offset)
        .limit(pageSize);

      // Get total count for athletes
      const athleteCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(athleteProfiles)
        .innerJoin(users, eq(users.id, athleteProfiles.userId))
        .where(
          or(
            ilike(athleteProfiles.fullName, searchTerm),
            ilike(athleteProfiles.sport, searchTerm),
            ilike(athleteProfiles.organizationName, searchTerm),
            ilike(athleteProfiles.city, searchTerm),
            ilike(athleteProfiles.state, searchTerm)
          )
        );

      totalResults += Number(athleteCount[0]?.count || 0);

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

    // Search coaches if no role filter or role is coach
    if (!role || role === 'coach') {
      const coachResults = await db
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
          or(
            ilike(coachProfiles.fullName, searchTerm),
            ilike(coachProfiles.sportCoaching, searchTerm),
            ilike(coachProfiles.organizationName, searchTerm),
            ilike(coachProfiles.city, searchTerm),
            ilike(coachProfiles.state, searchTerm),
            ilike(coachProfiles.title, searchTerm)
          )
        )
        .offset(offset)
        .limit(pageSize);

      // Get total count for coaches
      const coachCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(coachProfiles)
        .innerJoin(users, eq(users.id, coachProfiles.userId))
        .where(
          or(
            ilike(coachProfiles.fullName, searchTerm),
            ilike(coachProfiles.sportCoaching, searchTerm),
            ilike(coachProfiles.organizationName, searchTerm),
            ilike(coachProfiles.city, searchTerm),
            ilike(coachProfiles.state, searchTerm),
            ilike(coachProfiles.title, searchTerm)
          )
        );

      totalResults += Number(coachCount[0]?.count || 0);

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

    // Search recruiters if no role filter or role is recruiter
    if (!role || role === 'recruiter') {
      const recruiterResults = await db
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
          or(
            ilike(recruitingProfiles.fullName, searchTerm),
            ilike(recruitingProfiles.sportRecruiting, searchTerm),
            ilike(recruitingProfiles.organizationName, searchTerm),
            ilike(recruitingProfiles.city, searchTerm),
            ilike(recruitingProfiles.state, searchTerm),
            ilike(recruitingProfiles.title, searchTerm)
          )
        )
        .offset(offset)
        .limit(pageSize);

      // Get total count for recruiters
      const recruiterCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(recruitingProfiles)
        .innerJoin(users, eq(users.id, recruitingProfiles.userId))
        .where(
          or(
            ilike(recruitingProfiles.fullName, searchTerm),
            ilike(recruitingProfiles.sportRecruiting, searchTerm),
            ilike(recruitingProfiles.organizationName, searchTerm),
            ilike(recruitingProfiles.city, searchTerm),
            ilike(recruitingProfiles.state, searchTerm),
            ilike(recruitingProfiles.title, searchTerm)
          )
        );

      totalResults += Number(recruiterCount[0]?.count || 0);

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

    // Sort results by verification status and name
    results.sort((a, b) => {
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      return a.fullName.localeCompare(b.fullName);
    });

    return NextResponse.json({
      results,
      total: totalResults,
      currentPage: page,
      totalPages: Math.ceil(totalResults / pageSize),
      pageSize,
      query,
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 