import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateClerkHeaders, logSecurityValidation } from '@/utils/clerk-security'

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
    const body = await request.json()
    const { email, fullName, profileImage, role, profileData } = body

    // Validate the userId matches the authenticated user
    if (body.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - User ID mismatch' },
        { status: 403 }
      )
    }

    // TODO: Implement your database logic here
    // For now, we'll just simulate success
    console.log('Creating user profile:', {
      userId,
      email,
      fullName,
      profileImage,
      role,
      profileData
    })

    // TODO: Update Clerk user metadata
    // You'll need to implement this part based on your needs

    return NextResponse.json(
      { message: 'Profile created successfully', userId },
      { status: 200 }
    )

  } catch (error) {
    console.error('Onboarding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 