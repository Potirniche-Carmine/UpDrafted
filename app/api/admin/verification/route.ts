import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { validateClerkHeaders, logSecurityValidation } from '@/utils/clerk-security';
import { db } from '@/database/db';
import { athleteProfiles, coachProfiles, recruitingProfiles } from '@/database/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const validation = validateClerkHeaders(request);
    if (!validation.isValid) {
      logSecurityValidation(validation, '/api/admin/verification');
      return NextResponse.json({ error: 'Invalid security headers' }, { status: 401 });
    }

    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user and check if admin
    const user = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!user.ok) {
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 403 }
      );
    }

    const userData = await user.json();
    const isAdmin = userData.public_metadata?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    if (!role) {
      return NextResponse.json(
        { error: 'Role parameter is required' },
        { status: 400 }
      );
    }

    // Get verification status for the specified role
    let profile;
    
    switch (role) {
      case 'athlete':
        profile = await db.query.athleteProfiles.findFirst({
          where: and(
            eq(athleteProfiles.userId, userId),
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
            eq(coachProfiles.userId, userId),
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
            eq(recruitingProfiles.userId, userId),
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
    const validation = validateClerkHeaders(request);
    if (!validation.isValid) {
      logSecurityValidation(validation, '/api/admin/verification');
      return NextResponse.json({ error: 'Invalid security headers' }, { status: 401 });
    }

    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user and check if admin
    const user = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!user.ok) {
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 403 }
      );
    }

    const userData = await user.json();
    const isAdmin = userData.public_metadata?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { role, isVerified } = await request.json();

    if (!role || typeof isVerified !== 'boolean') {
      return NextResponse.json(
        { error: 'Role and isVerified status are required' },
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
            eq(athleteProfiles.userId, userId),
            eq(athleteProfiles.isDemoProfile, true)
          ))
          .returning({ id: athleteProfiles.id });
        break;
        
      case 'coach':
        updateResult = await db
          .update(coachProfiles)
          .set({ isVerified, updatedAt: new Date() })
          .where(and(
            eq(coachProfiles.userId, userId),
            eq(coachProfiles.isDemoProfile, true)
          ))
          .returning({ id: coachProfiles.id });
        break;
        
      case 'recruiter':
        updateResult = await db
          .update(recruitingProfiles)
          .set({ isVerified, updatedAt: new Date() })
          .where(and(
            eq(recruitingProfiles.userId, userId),
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