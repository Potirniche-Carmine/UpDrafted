import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';
import { athleteProfiles, coachProfiles, recruitingProfiles } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '@/utils/roles';

export async function GET(request: NextRequest) {
  try {
    // Validate admin access using secure session claims
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const targetUserId = searchParams.get('targetUserId');

    if (!role || !targetUserId) {
      return NextResponse.json(
        { error: 'Role and targetUserId parameters are required' },
        { status: 400 }
      );
    }

    // Get verification status for the specified role
    let profile;
    
    switch (role) {
      case 'athlete':
        profile = await db.query.athleteProfiles.findFirst({
          where: and(
            eq(athleteProfiles.userId, targetUserId),
            eq(athleteProfiles.isDemoProfile, true)
          ),
          columns: {
            id: true,
            isVerified: true
          }
        });
        break;
        
      case 'coach':
        profile = await db.query.coachProfiles.findFirst({
          where: and(
            eq(coachProfiles.userId, targetUserId),
            eq(coachProfiles.isDemoProfile, true)
          ),
          columns: {
            id: true,
            isVerified: true
          }
        });
        break;
        
      case 'recruiter':
        profile = await db.query.recruitingProfiles.findFirst({
          where: and(
            eq(recruitingProfiles.userId, targetUserId),
            eq(recruitingProfiles.isDemoProfile, true)
          ),
          columns: {
            id: true,
            isVerified: true
          }
        });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid role specified' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      role,
      isVerified: profile?.isVerified ?? false,
      profileExists: !!profile
    });

  } catch (error) {
    console.error('Error getting verification status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin access using secure session claims
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { role, isVerified, targetUserId } = await request.json();

    if (!role || typeof isVerified !== 'boolean' || !targetUserId) {
      return NextResponse.json(
        { error: 'Role, isVerified status, and targetUserId are required' },
        { status: 400 }
      );
    }

    // Update the appropriate profile's verification status
    let updateResult;
    
    switch (role) {
      case 'athlete':
        updateResult = await db
          .update(athleteProfiles)
          .set({ isVerified, updatedAt: new Date() })
          .where(and(
            eq(athleteProfiles.userId, targetUserId),
            eq(athleteProfiles.isDemoProfile, true)
          ))
          .returning({ id: athleteProfiles.id });
        break;
        
      case 'coach':
        updateResult = await db
          .update(coachProfiles)
          .set({ isVerified, updatedAt: new Date() })
          .where(and(
            eq(coachProfiles.userId, targetUserId),
            eq(coachProfiles.isDemoProfile, true)
          ))
          .returning({ id: coachProfiles.id });
        break;
        
      case 'recruiter':
        updateResult = await db
          .update(recruitingProfiles)
          .set({ isVerified, updatedAt: new Date() })
          .where(and(
            eq(recruitingProfiles.userId, targetUserId),
            eq(recruitingProfiles.isDemoProfile, true)
          ))
          .returning({ id: recruitingProfiles.id });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid role specified' },
          { status: 400 }
        );
    }

    if (!updateResult || updateResult.length === 0) {
      return NextResponse.json(
        { error: `No ${role} demo profile found to update` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `${role} verification status updated successfully`,
      profileId: updateResult[0].id,
      isVerified
    });

  } catch (error) {
    console.error('Error updating verification status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 