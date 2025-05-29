import { NextResponse, NextRequest } from 'next/server'
import { checkRole } from '@/utils/roles'
import { getUsersByRole } from '@/lib/admin-api'

export async function GET(request: NextRequest) {
  try {
    if (!(await checkRole('admin'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    
    if (!role) {
      return NextResponse.json({ error: 'Role parameter required' }, { status: 400 })
    }

    const users = await getUsersByRole(role)
    
    return NextResponse.json(users, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240' // Cache for 2 minutes
      }
    })
  } catch (error) {
    console.error('Error fetching users by role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 