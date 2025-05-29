import { NextResponse, NextRequest } from 'next/server'
import { checkRole } from '@/utils/roles'
import { searchUsers } from '@/lib/admin-api'

export async function GET(request: NextRequest) {
  try {
    if (!(await checkRole('admin'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    const users = await searchUsers(query.trim())
    
    return NextResponse.json(users, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' // Cache for 30 seconds
      }
    })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 