import { requireAdmin } from '@/utils/roles'
import { NextRequest, NextResponse } from 'next/server'
import { userOperations } from '@/database/db-utils'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (auth instanceof NextResponse) return auth

    const { userId } = auth;

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
    const username = email.split('@')[0];
    const user = await userOperations.createUser({
      id: userId,
      name: username,
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