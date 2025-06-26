import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { userOperations } from '@/database/db-utils'

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid session token' },
        { status: 401 }
      )
    }

    // Check if user is admin in Clerk
    const userRole = sessionClaims?.metadata?.role as string;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin role required' },
        { status: 403 }
      )
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user already exists in database
    const existingUser = await userOperations.getUserWithProfile(userId);
    if (existingUser) {
      return NextResponse.json(
        { 
          message: 'Admin user already initialized',
          user: existingUser
        },
        { status: 200 }
      )
    }

    // Create admin user in database
    const user = await userOperations.createUser({
      id: userId,
      email,
      role: 'admin',
    });

    return NextResponse.json(
      { 
        message: 'Admin user initialized successfully',
        user
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error initializing admin user:', error)
    return NextResponse.json(
      { error: 'Failed to initialize admin user' },
      { status: 500 }
    )
  }
} 