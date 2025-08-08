import { NextRequest, NextResponse } from 'next/server'
import { validateClerkHeaders, logSecurityValidation } from '@/utils/clerk-security'
import { requireAdmin } from '@/utils/roles'
import { adminOperations } from '@/database/db-utils'

export async function GET(request: NextRequest) {
  try {
    const validation = validateClerkHeaders(request);
    if (!validation.isValid) {
      logSecurityValidation(validation, '/api/admin/demo-profiles');
      return NextResponse.json({ error: 'Invalid security headers' }, { status: 401 });
    }
    const result = await requireAdmin();
    if (result instanceof NextResponse) return result;
    
    const { userId } = result;
    
    const demoProfiles = await adminOperations.getDemoProfiles(userId);
    
    return NextResponse.json({
      profiles: demoProfiles
    });
  } catch (error) {
    console.error('Error fetching demo profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo profiles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const validation = validateClerkHeaders(request);
    if (!validation.isValid) {
      logSecurityValidation(validation, '/api/admin/demo-profiles');
      return NextResponse.json({ error: 'Invalid security headers' }, { status: 401 });
    }
    const result = await requireAdmin();
    if (result instanceof NextResponse) return result;
    
    const { userId } = result;
    
    const body = await request.json();
    const { profileType, profileData } = body;
    
    // Validate profile type
    if (!['athlete', 'coach', 'recruiter'].includes(profileType)) {
      return NextResponse.json(
        { error: 'Invalid profile type. Must be athlete, coach, or recruiter' },
        { status: 400 }
      );
    }
    
    let createdProfile;
    
    switch (profileType) {
      case 'athlete':
        createdProfile = await adminOperations.createDemoAthleteProfile(userId, profileData);
        break;
      case 'coach':
        createdProfile = await adminOperations.createDemoCoachProfile(userId, profileData);
        break;
      case 'recruiter':
        createdProfile = await adminOperations.createDemoRecruitingProfile(userId, profileData);
        break;
    }
    
    return NextResponse.json({
      message: `Demo ${profileType} profile created successfully`,
      profile: createdProfile
    });
  } catch (error) {
    console.error('Error creating demo profile:', error);
    return NextResponse.json(
      { error: 'Failed to create demo profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const validation = validateClerkHeaders(request);
    if (!validation.isValid) {
      logSecurityValidation(validation, '/api/admin/demo-profiles');
      return NextResponse.json({ error: 'Invalid security headers' }, { status: 401 });
    }
    const result = await requireAdmin();
    if (result instanceof NextResponse) return result;
    
    const { userId } = result;
    
    const body = await request.json();
    const { profileType, profileData } = body;
    
    // Validate profile type
    if (!['athlete', 'coach', 'recruiter'].includes(profileType)) {
      return NextResponse.json(
        { error: 'Invalid profile type. Must be athlete, coach, or recruiter' },
        { status: 400 }
      );
    }
    
    let updatedProfile;
    
    switch (profileType) {
      case 'athlete':
        updatedProfile = await adminOperations.updateDemoAthleteProfile(userId, profileData);
        break;
      case 'coach':
        updatedProfile = await adminOperations.updateDemoCoachProfile(userId, profileData);
        break;
      case 'recruiter':
        updatedProfile = await adminOperations.updateDemoRecruitingProfile(userId, profileData);
        break;
    }
    
    return NextResponse.json({
      message: `Demo ${profileType} profile updated successfully`,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating demo profile:', error);
    return NextResponse.json(
      { error: 'Failed to update demo profile' },
      { status: 500 }
    );
  }
} 