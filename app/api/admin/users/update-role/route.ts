import { NextResponse, NextRequest } from 'next/server'
import { checkRole } from '@/utils/roles'
import { updateUserRole } from '@/lib/admin-api'

export async function POST(request: NextRequest) {
  try {
    if (!(await checkRole('admin'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role } = body
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const validRoles = ['admin', 'coach', 'athlete', 'recruiter', 'no-role', '']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Convert 'no-role' to empty string for the backend
    const actualRole = role === 'no-role' ? '' : role

    await updateUserRole(userId, actualRole)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 