import { NextResponse } from 'next/server'
import { checkRole } from '@/utils/roles'
import { getUserStats } from '@/lib/admin-api'

export async function GET() {
  try {
    if (!(await checkRole('admin'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const stats = await getUserStats()
    
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' // Cache for 5 minutes
      }
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 