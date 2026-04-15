import { getSession } from '@/utils/roles'
import { NextRequest, NextResponse } from 'next/server'
import { validateRoleAssignment, validateRoleEscalation } from '@/utils/validation'
import { uploadProfilePicture, uploadOrganizationLogo } from '@/database/r2'
import { onboardingOperations, adminOperations, schoolOperations } from '@/database/db-utils'
import { convertFormDataToProfileData } from '@/app/(onboarding)/lib/onboarding'
import { FormValidator } from '@/app/(onboarding)/lib/form-validation'
import { recruitingNeedsOperations } from '@/database/db-utils'

// Force Node.js runtime to avoid expensive edge function costs
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request using better-auth session
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid session token' },
        { status: 401 }
      )
    }

    const userId = session.user.id;
    // Check if user is admin
    const isAdmin = session.user.role === 'admin';

    // Parse the request body
    const formData = await request.formData()
    const profileDataJson = formData.get('profileData') as string
    const profileImage = formData.get('profileImage') as File | null
    const organizationLogo = formData.get('organizationLogo') as File | null
    const userIdFromForm = formData.get('userId') as string
    const email = formData.get('email') as string || session.user.email
    const role = formData.get('role') as 'athlete' | 'coach' | 'recruiter'

    // Validate the userId matches the authenticated user
    if (userIdFromForm !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - User ID mismatch' },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!email || !role || !profileDataJson) {
      return NextResponse.json(
        { error: 'Missing required fields: email, role, profileData' },
        { status: 400 }
      )
    }

    // Validate role assignment (prevent admin role assignment)
    try {
      validateRoleAssignment(role, 'onboarding');
      validateRoleEscalation(userId, userId, role);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid role assignment' },
        { status: 400 }
      );
    }

    let rawProfileData
    try {
      rawProfileData = JSON.parse(profileDataJson)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in profileData' },
        { status: 400 }
      )
    }

    // Server-side validation using FormValidator
    let validationErrors
    if (role === 'athlete') {
      validationErrors = FormValidator.validateAthleteForm(rawProfileData)
    } else {
      validationErrors = FormValidator.validateCoachRecruiterForm(rawProfileData)
    }

    // Check if there are validation errors
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          validationErrors
        },
        { status: 400 }
      )
    }

    // Clean weight input for athletes (remove "lbs" if present)
    if (role === 'athlete' && rawProfileData.weight) {
      rawProfileData.weight = FormValidator.cleanWeightInput(rawProfileData.weight)
    }

    const profileData = convertFormDataToProfileData(rawProfileData)

    try {
      let profileImageR3Key: string | undefined
      let profileImageUrl: string | null = null
      let organizationLogoR3Key: string | undefined
      let organizationLogoUrl: string | null = null

      if (profileImage) {
        try {
          const { key, url } = await uploadProfilePicture(profileImage, userId)
          profileImageUrl = url
          profileImageR3Key = key
        } catch (uploadError) {
          console.error('Profile image upload failed:', uploadError)
          // Continue without profile image rather than failing the entire onboarding
        }
      }

      // Handle organization logo upload for coaches and recruiters
      if (organizationLogo && (role === 'coach' || role === 'recruiter')) {
        try {
          const { key, url } = await uploadOrganizationLogo(organizationLogo, userId)
          organizationLogoUrl = url
          organizationLogoR3Key = key
        } catch (uploadError) {
          console.error('Organization logo upload failed:', uploadError)
          // Continue without organization logo rather than failing the entire onboarding
        }
      }

      let result
      let profileId: number

      if (isAdmin) {
        // For admin users, create demo profiles instead of regular profiles
        if (role === 'athlete') {
          // Get or create school for demo profile
          const educationLevelMap: { [key: string]: 'high_school' | 'college' | 'university' | 'professional' | 'other' } = {
            'high_school': 'high_school',
            'associate': 'college',
            'undergraduate': 'university',
            'graduate': 'university'
          };

          const educationLevel = profileData.educationLevel || 'undergraduate';
          const schoolClassification = educationLevelMap[educationLevel] || 'university';

          const school = await schoolOperations.getOrCreateSchool(
            profileData.organizationName || 'Unknown Institution',
            schoolClassification
          );

          result = await adminOperations.createDemoAthleteProfile(userId, {
            fullName: profileData.fullName,
            sport: profileData.sport!,
            secondarySports: profileData.secondarySports,
            graduationYear: profileData.graduationYear!,
            educationLevel: educationLevel as 'high_school' | 'undergraduate' | 'graduate' | 'associate',
            schoolId: school.id,
            city: profileData.city,
            country: profileData.country, // Country is required, no fallback
            state: profileData.state || null,
            division: profileData.division,
            conference: profileData.conference,
            height: profileData.height!,
            weight: profileData.weight!,
            positions: profileData.positions!,
            teamLevel: profileData.teamLevel, // Include team level for high school athletes
            gpa: profileData.gpa ? parseFloat(profileData.gpa) : null,
            satScore: profileData.satScore,
            actScore: profileData.actScore,
            intendedMajor: profileData.intendedMajor,
            gender: profileData.gender,
            maxprepsUrl: profileData.maxprepsUrl,
            hudlUrl: profileData.hudlUrl,
            instagramHandle: profileData.instagramHandle,
            twitterHandle: profileData.twitterHandle,
            personalStatement: profileData.personalStatement,
            profileImageR3Key
          })
          profileId = result.id

        } else if (role === 'coach') {
          // Get or create school for demo coach profile
          const school = await schoolOperations.getOrCreateSchool(
            profileData.organizationName || 'Unknown Institution',
            'university' // Coaches are typically at universities
          );

          result = await adminOperations.createDemoCoachProfile(userId, {
            fullName: profileData.fullName,
            title: profileData.title!,
            sportCoaching: profileData.sportCoaching!,
            schoolId: school.id,
            division: profileData.division!,
            conference: profileData.conference,
            city: profileData.city,
            country: profileData.country, // Country is required, no fallback
            state: profileData.state || null,
            programWebsite: profileData.programWebsite,
            schoolWebsite: profileData.schoolWebsite,
            instagramHandle: profileData.instagramHandle,
            twitterHandle: profileData.twitterHandle,
            personalStatement: profileData.personalStatement,
            profileImageR3Key,
            organizationLogoR3Key
          })
          profileId = result.id

          // Create recruiting needs for demo coach if provided
          if (profileData.recruitingPositions) {
            await recruitingNeedsOperations.createRecruitingNeeds({
              coachId: profileId,
              studentClassifications: (profileData.recruitingStudentClassifications || []) as ('high_school' | 'university_transfers' | 'juco_students' | 'graduate_transfers' | 'international_students')[],
              positions: profileData.recruitingPositions,
              scholarshipsAvailable: profileData.scholarshipsAvailable ?? undefined,
              recruitingPhilosophy: profileData.recruitingPhilosophy || undefined
            });
          }

        } else if (role === 'recruiter') {
          // Get or create school for demo recruiter profile
          const school = await schoolOperations.getOrCreateSchool(
            profileData.organizationName || 'Unknown Institution',
            'university' // Recruiters are typically at universities
          );

          result = await adminOperations.createDemoRecruitingProfile(userId, {
            fullName: profileData.fullName,
            title: profileData.title!,
            sportRecruiting: profileData.sportCoaching!,
            secondarySports: profileData.secondarySportsRecruiting,
            schoolId: school.id,
            division: profileData.division!,
            conference: profileData.conference,
            city: profileData.city,
            country: profileData.country, // Country is required, no fallback
            state: profileData.state || null,
            programWebsite: profileData.programWebsite,
            schoolWebsite: profileData.schoolWebsite,
            instagramHandle: profileData.instagramHandle,
            twitterHandle: profileData.twitterHandle,
            personalStatement: profileData.personalStatement,
            profileImageR3Key,
            organizationLogoR3Key
          })
          profileId = result.id

          // Create sport-specific recruiting needs for demo recruiter if provided
          if (profileData.sportSpecificNeeds) {
            for (const [sport, needs] of Object.entries(profileData.sportSpecificNeeds)) {
              if (needs.positions) {
                await recruitingNeedsOperations.createRecruitingProfileNeeds({
                  recruitingProfileId: profileId,
                  sport: sport,
                  studentClassifications: (needs.studentClassifications || []) as ('high_school' | 'university_transfers' | 'juco_students' | 'graduate_transfers' | 'international_students')[],
                  positions: needs.positions,
                  scholarshipsAvailable: needs.scholarshipsAvailable ?? undefined,
                  recruitingPhilosophy: needs.recruitingPhilosophy || undefined
                });
              }
            }
          }
        } else {
          throw new Error('Invalid role provided')
        }

      } else {
        // For regular users, use normal onboarding flow
        // The operations below automatically update the user record in the database with the new role
        if (role === 'athlete') {
          result = await onboardingOperations.createAthleteOnboarding(
            userId,
            email,
            profileData,
            profileImageR3Key
          )
          profileId = result.athleteProfile.id

        } else if (role === 'coach') {
          result = await onboardingOperations.createCoachOnboarding(
            userId,
            email,
            profileData,
            profileImageR3Key,
            organizationLogoR3Key
          )
          profileId = result.profile.id

        } else if (role === 'recruiter') {
          result = await onboardingOperations.createRecruiterOnboarding(
            userId,
            email,
            profileData,
            profileImageR3Key,
            organizationLogoR3Key
          )
          profileId = result.profile.id
        } else {
          throw new Error('Invalid role provided')
        }
      }

      let isVerified = false;

      // Set verification status based on role and admin status
      if (!isAdmin) {
        if (role === 'athlete' && 'athleteProfile' in result) {
          isVerified = result.athleteProfile.isVerified || false;
        } else if ((role === 'coach' || role === 'recruiter') && 'profile' in result) {
          isVerified = result.profile.isVerified || false;
        }
      }

      return NextResponse.json(
        {
          message: 'Profile created successfully',
          userId,
          role,
          profileId,
          profileImageUrl,
          organizationLogoUrl,
          isVerified
        },
        { status: 200 }
      )

    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      return NextResponse.json(
        { error: 'Failed to create profile. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('General error in onboarding API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}