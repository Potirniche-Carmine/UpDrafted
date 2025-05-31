import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/utils/roles';
import { validateClerkHeaders } from '@/utils/clerk-security';
import { coachOperations } from '@/lib/db-utils';

export async function GET() {
  try {
    // Check if user is coach or admin
    const auth = await requireRole(['coach', 'admin']);
    if (auth instanceof NextResponse) return auth;

    const { userId } = auth;

    // Get coach profile
    const profile = await coachOperations.getCoachProfile(userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Coach profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error('Error fetching coach profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate required Clerk headers
    const validation = validateClerkHeaders(request);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Missing required security headers',
          missingHeaders: validation.missingHeaders
        },
        { status: 400 }
      );
    }

    // Check if user is coach or admin
    const auth = await requireRole(['coach', 'admin']);
    if (auth instanceof NextResponse) return auth;

    const { userId } = auth;
    const body = await request.json();

    // Sanitize input - remove any potentially dangerous fields
    const sanitizedBody = {
      title: body.title?.toString().trim(),
      sportCoaching: body.sportCoaching?.toString().trim(),
      organizationName: body.organizationName?.toString().trim(),
      division: body.division?.toString().trim(),
      conference: body.conference?.toString().trim(),
      city: body.city?.toString().trim(),
      state: body.state?.toString().trim(),
      programWebsite: body.programWebsite?.toString().trim(),
      schoolWebsite: body.schoolWebsite?.toString().trim(),
      // Add other allowed fields as needed, with proper validation
    };

    // Remove undefined values
    const cleanBody = Object.fromEntries(
      Object.entries(sanitizedBody).filter(([, value]) => value !== undefined)
    );

    // Update coach profile
    const updatedProfile = await coachOperations.updateCoachProfile(userId, cleanBody);

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Error updating coach profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 