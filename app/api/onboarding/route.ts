import { auth, createClerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateClerkHeaders, logSecurityValidation } from '@/utils/clerk-security'
import { uploadProfilePicture } from '@/lib/r2'
import { onboardingOperations } from '@/lib/db-utils'
import { convertFormDataToProfileData } from '@/types/onboarding'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
})

export async function POST(request: NextRequest) {
  try {
    // Validate required Clerk headers
    const validation = validateClerkHeaders(request)
    logSecurityValidation(validation, '/api/onboarding')

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

    const profileData = convertFormDataToProfileData(rawProfileData)

    try {
      let profileImageR3Key: string | undefined
      let profileImageUrl: string | null = null

      if (profileImage) {
        const { key, url } = await uploadProfilePicture(profileImage, userId)
        profileImageUrl = url
        profileImageR3Key = key
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
        
      } else if (role === 'coach') {
        result = await onboardingOperations.createCoachOnboarding(
          userId, 
          email, 
          profileData, 
          profileImageR3Key
        )
        profileId = result.profile.id
        
      } else if (role === 'recruiter') {
        result = await onboardingOperations.createRecruiterOnboarding(
          userId, 
          email, 
          profileData, 
          profileImageR3Key
        )
        profileId = result.profile.id
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
          profileImageUrl
        },
        { status: 200 }
      )

    } catch (dbError) {
      console.error('Debug: Database/Clerk operation failed:', dbError)
      return NextResponse.json(
        { error: 'Failed to create profile. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Debug: General error in onboarding API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 