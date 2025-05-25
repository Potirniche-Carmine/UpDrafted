import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient, currentUser } from '@clerk/nextjs/server';
import { createUser, createAthleteProfile } from '@/lib/database-utils';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role, profileData } = body;

    console.log('Onboarding API Debug:', {
      userId: user.id,
      role,
      profileData: JSON.stringify(profileData, null, 2),
      currentMetadata: user.publicMetadata
    });

    // Update user metadata in Clerk
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    
    console.log('Updating Clerk metadata with role:', role);
    const updateResult = await clerk.users.updateUserMetadata(user.id, {
      publicMetadata: { role }
    });
    
    console.log('Clerk metadata update result:', updateResult);

    // Create user in database
    const dbUser = await createUser({
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      full_name: user.fullName || '',
      profile_image: user.imageUrl,
      role: role
    });

    console.log('Database user created:', dbUser);

    // Create role-specific profile
    if (role === 'athlete') {
      const athleteProfile = await createAthleteProfile({
        user_id: user.id,
        sport: profileData.sport || '',
        secondary_sports: profileData.secondarySports || [],
        graduation_year: profileData.graduationYear || new Date().getFullYear(),
        high_school: profileData.highSchool || '',
        city: profileData.city || '',
        state: profileData.state || '',
        height: profileData.height || '',
        weight: profileData.weight || '',
        positions: profileData.positions || [],
        gpa: profileData.gpa,
        sat_score: profileData.satScore,
        act_score: profileData.actScore,
        intended_major: profileData.intendedMajor,
        maxpreps_url: '',
        maxpreps_verified: false,
        hudl_url: '',
        hudl_embed_url: '',
        instagram_handle: '',
        twitter_handle: '',
        personal_statement: profileData.personalStatement,
        phone: ''
      });
      console.log('Athlete profile created:', athleteProfile);
    } else if (role === 'coach' || role === 'recruiter') {
      // TODO: Implement coach profile creation
      // For now, just create the user record
      console.log('Coach/Recruiter profile creation not yet implemented');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile created successfully',
      user: dbUser 
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' }, 
      { status: 500 }
    );
  }
} 