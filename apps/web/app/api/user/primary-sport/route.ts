import { NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { userOperations } from '@/database/db-utils';

export const runtime = 'nodejs';

// Get current user's primary sport
export async function GET() {
  try {
    // Verify authentication
    const authResult = await requireAnyRole();
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = authResult;

    // Get user with profile
    const userWithProfile = await userOperations.getUserWithProfile(userId);

    if (!userWithProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let primarySport: string | null = null;
    let secondarySports: string[] = [];

    // Extract primary sport and secondary sports based on user role
    if (userWithProfile.role === 'athlete' && userWithProfile.athleteProfile) {
      primarySport = userWithProfile.athleteProfile.sport;
      secondarySports = userWithProfile.athleteProfile.secondarySports || [];
    } else if (userWithProfile.role === 'coach' && userWithProfile.coachProfile) {
      primarySport = userWithProfile.coachProfile.sportCoaching;
      // Coaches don't have secondary sports in the current schema
    } else if (userWithProfile.role === 'recruiter' && userWithProfile.recruitingProfile) {
      primarySport = userWithProfile.recruitingProfile.sportRecruiting;
      secondarySports = userWithProfile.recruitingProfile.secondarySports || [];
    }

    return NextResponse.json({
      primarySport,
      secondarySports,
      role: userWithProfile.role
    });

  } catch (error) {
    console.error('Error fetching user primary sport:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}