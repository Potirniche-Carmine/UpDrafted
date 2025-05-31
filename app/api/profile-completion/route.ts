import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { validateClerkHeaders, logSecurityValidation } from '@/utils/clerk-security';
import { getProfileCompletion, calculateAndSaveProfileCompletion } from '@/lib/profile-completion';

export async function GET(request: NextRequest) {
  try {
    // Validate Clerk security headers
    const validation = validateClerkHeaders(request);
    logSecurityValidation(validation, '/api/profile-completion');

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Missing required security headers', missingHeaders: validation.missingHeaders },
        { status: 400 }
      );
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userType = searchParams.get('userType') as 'athlete' | 'coach' | 'recruiter' | null;

    if (!userType || !['athlete', 'coach', 'recruiter'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid or missing userType parameter' },
        { status: 400 }
      );
    }

    // Get profile completion data
    const completion = await getProfileCompletion(userId, userType);

    return NextResponse.json({
      success: true,
      data: completion
    });

  } catch (error) {
    console.error('Error in profile completion GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate Clerk security headers
    const validation = validateClerkHeaders(request);
    logSecurityValidation(validation, '/api/profile-completion');

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Missing required security headers', missingHeaders: validation.missingHeaders },
        { status: 400 }
      );
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { userType, forceRecalculate = false } = body;

    if (!userType || !['athlete', 'coach', 'recruiter'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid or missing userType in request body' },
        { status: 400 }
      );
    }

    // Calculate and save profile completion
    const completion = await calculateAndSaveProfileCompletion(userId, userType, forceRecalculate);

    if (!completion) {
      return NextResponse.json(
        { error: 'Profile not found or could not calculate completion' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: completion
    });

  } catch (error) {
    console.error('Error in profile completion POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 