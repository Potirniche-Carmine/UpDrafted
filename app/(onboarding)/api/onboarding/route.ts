import { auth, createClerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateClerkHeaders } from '@/utils/clerk-security'
import { validateRoleAssignment, validateRoleEscalation } from '@/utils/validation'
import { uploadProfilePicture, uploadOrganizationLogo } from '@/database/r2'
import { onboardingOperations, adminOperations } from '@/database/db-utils'
import { convertFormDataToProfileData } from '@/app/(onboarding)/lib/onboarding'
import { FormValidator } from '@/app/(onboarding)/lib/form-validation'
import { recruitingNeedsOperations } from '@/database/db-utils'

// Force Node.js runtime to avoid expensive edge function costs
export const runtime = 'nodejs'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
})

export async function POST(request: NextRequest) {
  try {
    const validation = validateClerkHeaders(request)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Missing required security headers',
          missingHeaders: validation.missingHeaders
        },
        { status: 400 }
      )
    }

    // Authenticate the request using Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid session token' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await clerkClient.users.getUser(userId)
    const isAdmin = user.publicMetadata?.role === 'admin'

    // Parse the request body
    const formData = await request.formData()
    const profileDataJson = formData.get('profileData') as string
    const profileImage = formData.get('profileImage') as File | null
    const organizationLogo = formData.get('organizationLogo') as File | null
    const userIdFromForm = formData.get('userId') as string
    const email = formData.get('email') as string
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
          result = await adminOperations.createDemoAthleteProfile(userId, {
            fullName: profileData.fullName,
            sport: profileData.sport!,
            secondarySports: profileData.secondarySports,
            graduationYear: profileData.graduationYear!,
            educationLevel: profileData.educationLevel!,
            organizationName: profileData.organizationName!,
            city: profileData.city,
            state: profileData.state,
            height: profileData.height!,
            weight: profileData.weight!,
            positions: profileData.positions!,
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
          result = await adminOperations.createDemoCoachProfile(userId, {
            fullName: profileData.fullName,
            title: profileData.title!,
            sportCoaching: profileData.sportCoaching!,
            organizationName: profileData.organizationName!,
            division: profileData.division!,
            conference: profileData.conference,
            city: profileData.city,
            state: profileData.state,
            programWebsite: profileData.programWebsite,
            schoolWebsite: profileData.schoolWebsite,
            instagramHandle: profileData.orgInstagramHandle,
            twitterHandle: profileData.orgTwitterHandle,
            personalStatement: profileData.personalStatement,
            profileImageR3Key,
            organizationLogoR3Key
          })
          profileId = result.id
          
          // Create recruiting needs for demo coach if provided
          if (profileData.recruitingGraduationYears && profileData.recruitingPositions) {
            await recruitingNeedsOperations.createRecruitingNeeds({
              coachId: profileId,
              graduationYears: profileData.recruitingGraduationYears,
              positions: profileData.recruitingPositions,
              scholarshipsAvailable: profileData.scholarshipsAvailable ?? undefined,
              recruitingPhilosophy: profileData.recruitingPhilosophy || undefined
            });
          }
          
        } else if (role === 'recruiter') {
          result = await adminOperations.createDemoRecruitingProfile(userId, {
            fullName: profileData.fullName,
            title: profileData.title!,
            sportRecruiting: profileData.sportCoaching!,
            secondarySports: profileData.secondarySportsRecruiting,
            organizationName: profileData.organizationName!,
            division: profileData.division!,
            conference: profileData.conference,
            city: profileData.city,
            state: profileData.state,
            programWebsite: profileData.programWebsite,
            schoolWebsite: profileData.schoolWebsite,
            instagramHandle: profileData.orgInstagramHandle,
            twitterHandle: profileData.orgTwitterHandle,
            personalStatement: profileData.personalStatement,
            profileImageR3Key,
            organizationLogoR3Key
          })
          profileId = result.id
          
          // Create sport-specific recruiting needs for demo recruiter if provided
          if (profileData.sportSpecificNeeds) {
            for (const [sport, needs] of Object.entries(profileData.sportSpecificNeeds)) {
              if (needs.graduationYears && needs.positions) {
                await recruitingNeedsOperations.createRecruitingProfileNeeds({
                  recruitingProfileId: profileId,
                  sport: sport,
                  graduationYears: needs.graduationYears,
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
        
        // Don't update admin role in Clerk - keep them as admin
      } else {
        // For regular users, use normal onboarding flow
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

        // Update user role in Clerk for regular users only
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            role
          }
        })
      }

      return NextResponse.json(
        { 
          message: 'Profile created successfully', 
          userId,
          role,
          profileId,
          profileImageUrl,
          organizationLogoUrl
        },
        { status: 200 }
      )

    } catch (dbError) {
      console.error('Database/Clerk operation failed:', dbError)
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