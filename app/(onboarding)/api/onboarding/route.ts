import { auth, createClerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateClerkHeaders } from '@/utils/clerk-security'
import { uploadProfilePicture, uploadOrganizationLogo } from '@/database/r2'
import { onboardingOperations } from '@/database/db-utils'
import { convertFormDataToProfileData } from '@/app/(onboarding)/lib/onboarding'
import { FormValidator } from '@/app/(onboarding)/lib/form-validation'
import { calculateAndSaveProfileCompletion } from '@/lib/profile-completion'

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

    // Validate role
    if (!['athlete', 'coach', 'recruiter'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be athlete, coach, or recruiter' },
        { status: 400 }
      )
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

      if (role === 'athlete') {
        result = await onboardingOperations.createAthleteOnboarding(
          userId, 
          email, 
          profileData, 
          profileImageR3Key
        )
        profileId = result.profile.id
        
        // Calculate initial profile completion for athlete
        try {
          await calculateAndSaveProfileCompletion(userId, 'athlete', true);
        } catch (completionError) {
          console.error('Failed to calculate profile completion for athlete:', completionError);
          // Don't fail the onboarding, just log the error
        }
        
      } else if (role === 'coach') {
        result = await onboardingOperations.createCoachOnboarding(
          userId, 
          email, 
          profileData, 
          profileImageR3Key,
          organizationLogoR3Key
        )
        profileId = result.profile.id
        
        // Calculate initial profile completion for coach
        try {
          await calculateAndSaveProfileCompletion(userId, 'coach', true);
        } catch (completionError) {
          console.error('Failed to calculate profile completion for coach:', completionError);
          // Don't fail the onboarding, just log the error
        }
        
      } else if (role === 'recruiter') {
        result = await onboardingOperations.createRecruiterOnboarding(
          userId, 
          email, 
          profileData, 
          profileImageR3Key,
          organizationLogoR3Key
        )
        profileId = result.profile.id
        
        // Calculate initial profile completion for recruiter
        try {
          await calculateAndSaveProfileCompletion(userId, 'recruiter', true);
        } catch (completionError) {
          console.error('Failed to calculate profile completion for recruiter:', completionError);
          // Don't fail the onboarding, just log the error
        }
      } else {
        throw new Error('Invalid role provided')
      }

      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role
        }
      })

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