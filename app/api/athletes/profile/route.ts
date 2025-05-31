import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/utils/roles';
import { validateClerkHeaders} from '@/utils/clerk-security';
import { athleteOperations } from '@/lib/db-utils';

export async function GET() {
  try {
    // Check if user is athlete or admin
    const auth = await requireRole(['athlete', 'admin']);
    if (auth instanceof NextResponse) return auth;

    const { userId } = auth;

    // Get athlete profile
    const profile = await athleteOperations.getAthleteProfile(userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Athlete profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error('Error fetching athlete profile:', error);
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

    const auth = await requireRole(['athlete', 'admin']);
    if (auth instanceof NextResponse) return auth;

    const { userId } = auth;
    const body = await request.json();

    const sanitizedBody = {
      fullName: body.fullName?.toString().trim(),
      sport: body.sport?.toString().trim(),
      graduationYear: parseInt(body.graduationYear) || undefined,
      city: body.city?.toString().trim(),
      state: body.state?.toString().trim(),
    };

    // Remove undefined values
    const cleanBody = Object.fromEntries(
      Object.entries(sanitizedBody).filter(([, value]) => value !== undefined)
    );

    // Update athlete profile
    const updatedProfile = await athleteOperations.updateAthleteProfile(userId, cleanBody);

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
    console.error('Error updating athlete profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 