import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/utils/roles';
import { validateClerkHeaders, logSecurityValidation } from '@/utils/clerk-security';
import { recruitingOperations } from '@/lib/db-utils';

export async function GET() {
  try {
    // Check if user is recruiter or admin
    const auth = await requireRole(['recruiter', 'admin']);
    if (auth instanceof NextResponse) return auth;

    const { userId } = auth;

    // Get recruiter profile
    const profile = await recruitingOperations.getRecruitingProfile(userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Recruiter profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
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
    logSecurityValidation(validation, '/api/recruiters/profile');

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Missing required security headers',
          missingHeaders: validation.missingHeaders
        },
        { status: 400 }
      );
    }

    // Check if user is recruiter or admin
    const auth = await requireRole(['recruiter', 'admin']);
    if (auth instanceof NextResponse) return auth;

    const { userId } = auth;
    const body = await request.json();

    // Sanitize input - remove any potentially dangerous fields
    const sanitizedBody = {
      title: body.title?.toString().trim(),
      sportRecruiting: body.sportRecruiting?.toString().trim(),
      organizationName: body.organizationName?.toString().trim(),
      division: body.division?.toString().trim(),
      conference: body.conference?.toString().trim(),
      city: body.city?.toString().trim(),
      state: body.state?.toString().trim(),
      programWebsite: body.programWebsite?.toString().trim(),
      schoolWebsite: body.schoolWebsite?.toString().trim(),
      recruitingPhilosophy: body.recruitingPhilosophy?.toString().trim(),
      // Add other allowed fields as needed, with proper validation
    };

    // Remove undefined values
    const cleanBody = Object.fromEntries(
      Object.entries(sanitizedBody).filter(([, value]) => value !== undefined)
    );

    // Update recruiter profile
    const updatedProfile = await recruitingOperations.updateRecruitingProfile(userId, cleanBody);

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
    console.error('Error updating recruiter profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 